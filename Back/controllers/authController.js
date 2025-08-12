const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
import multer from "multer";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || 'secreto123';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // cambia a true si usas HTTPS
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 día
    path: '/', // esencial para que clearCookie funcione global
};

// ==============================
// 🔐 LOGIN
// ==============================
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await findByUsername(username);
        if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: '1d',
        });

        res
            .cookie('token', token, COOKIE_OPTIONS)
            .json({
                message: 'Login exitoso',
                user: { id: user.id, username: user.username, role: user.role },
            });
    } catch (err) {
        console.error('💥 Error en login:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// ==============================
// 🚪 LOGOUT
// ==============================
const logout = (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS).json({ message: 'Logout exitoso' });
};

// ==============================
// 🙋‍♂️ GET ME
// ==============================
const getMe = (req, res) => {
    if (!req.cookies.token) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    try {
        const decoded = jwt.verify(req.cookies.token, JWT_SECRET);
        res.json({ user: decoded });
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// ==============================
// 👥 OBTENER USUARIOS
// ==============================
const getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsersFromDB();
        res.json(users);
    } catch (err) {
        console.error('💥 Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const user = await findUserById(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (err) {
        console.error('💥 Error al obtener usuario por ID:', err);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};
// Configuración para guardar directamente con fecha en el nombre
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    cb(null, `${baseName}_${timestamp}${ext}`);
  }
});
const upload = multer({ storage });

// ==============================
// ➕ CREAR / ACTUALIZAR / ELIMINAR USUARIO
// ==============================
// const createUser = async (req, res) => {
//     const { username, password, role } = req.body;

//     if (!username || !password || !role) {
//         return res.status(400).json({ error: 'Faltan campos obligatorios' });
//     }

//     try {
//         const validRoles = await getAllRolesFromDB();
//         const roleNames = validRoles.map((r) => r.name);

//         if (!roleNames.includes(role)) {
//             return res.status(400).json({ error: 'Rol inválido' });
//         }

//         const existing = await findByUsername(username);
//         if (existing) {
//             return res.status(409).json({ error: 'El usuario ya existe' });
//         }


//         const hashedPassword = await bcrypt.hash(password, 10); 
//         const newUser = await insertUser({ username, password: hashedPassword, role });

//         res.status(201).json({
//             message: 'Usuario creado exitosamente',
//             user: {
//                 id: newUser.insertId,
//                 username,
//                 role,
//             },
//         });
//     } catch (err) {
//         console.error('💥 Error al crear usuario:', err);
//         res.status(500).json({ error: 'Error al crear usuario' });
//     }
// };
export const createUser = [
  upload.single("profileImage"), // Este middleware procesa el FormData antes
  async (req, res) => {
    try {
      // Ahora req.body SI tiene los campos del form
      const { username, password, role } = req.body;

      if (!username || !password || !role) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const validRoles = await getAllRolesFromDB();
      const roleNames = validRoles.map((r) => r.name);

      if (!roleNames.includes(role)) {
        return res.status(400).json({ error: "Rol inválido" });
      }

      const existing = await findByUsername(username);
      if (existing) {
        return res.status(409).json({ error: "El usuario ya existe" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const imageName = req.file ? req.file.filename : null;

      const newUser = await insertUser({
        username,
        password: hashedPassword,
        role,
        profile_image: imageName
      });

      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: {
          id: newUser.insertId,
          username,
          role,
          profile_image: imageName
        }
      });
    } catch (err) {
      console.error("💥 Error al crear usuario:", err);
      res.status(500).json({ error: "Error al crear usuario" });
    }
  }
];


const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    if (!username && !password && !role) {
        return res.status(400).json({ error: 'Debe enviar al menos un campo para actualizar' });
    }

    try {
        let hashedPassword = null;

        if (password?.trim()) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        let roleToUpdate = role;

        if (role?.trim()) {
            const validRoles = await getAllRolesFromDB();
            const roleNames = validRoles.map((r) => r.name);
            if (!roleNames.includes(role)) {
                return res.status(400).json({ error: 'Rol inválido' });
            }
        } else {
            roleToUpdate = undefined;
        }

        await updateUserInDB(id, {
            username: username?.trim(),
            password: hashedPassword,
            role: roleToUpdate,
        });

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (err) {
        console.error('💥 Error al actualizar usuario:', err);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        await deleteUserFromDB(id);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        console.error('💥 Error al eliminar usuario:', err);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};

// ==============================
// 🧠 FUNCIONES DB INTERNAS
// ==============================
const findByUsername = (username) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

const getAllUsersFromDB = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT id, username, role FROM users ORDER BY username ASC', (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const findUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT id, username, role FROM users WHERE id = ?', [id], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

const insertUser = ({ username, password, role }) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.query(sql, [username, password, role], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const getAllRolesFromDB = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT name FROM roles', (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const updateUserInDB = (id, { username, password, role }) => {
    return new Promise((resolve, reject) => {
        const fields = [];
        const values = [];

        if (username) {
            fields.push('username = ?');
            values.push(username);
        }

        if (role) {
            fields.push('role = ?');
            values.push(role);
        }

        if (password) {
            fields.push('password = ?');
            values.push(password);
        }

        if (fields.length === 0) {
            return resolve({ message: 'Sin cambios' });
        }

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);

        db.query(sql, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const deleteUserFromDB = (id) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// ==============================
// 🚀 EXPORTS
// ==============================
module.exports = {
    login,
    logout,
    getMe,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};
