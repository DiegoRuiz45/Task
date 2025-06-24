const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // tu conexión a MySQL
const router = express.Router();

const SECRET = process.env.JWT_SECRET || 'super_secreto';
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false, // ponlo en true si usas HTTPS
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 día
};

// 🔑 Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Validación básica
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos.' });
    }

    try {
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) return res.status(500).json({ error: 'Error en la base de datos.' });

            const user = results[0];
            if (!user) return res.status(401).json({ error: 'Credenciales inválidas.' });

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) return res.status(401).json({ error: 'Credenciales inválidas.' });

            const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });
            res.cookie('token', token, COOKIE_OPTIONS);
            res.json({ message: 'Login exitoso', user: { id: user.id, username: user.username, role: user.role } });
        });
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 🧼 Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.json({ message: 'Sesión cerrada correctamente' });
});

// 👤 Info del usuario actual (si tiene token)
router.get('/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'No autenticado' });

    try {
        const decoded = jwt.verify(token, SECRET);
        res.json({ user: decoded });
    } catch (err) {
        res.status(403).json({ error: 'Token inválido' });
    }
});

module.exports = router;
