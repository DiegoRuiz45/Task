const db = require('../db');

// 🔹 GET - Todos los roles
exports.getAllRoles = (req, res) => {
  db.query('SELECT * FROM roles ORDER BY name ASC', (err, results) => {
    if (err) {
      console.error('💥 Error al obtener roles:', err);
      return res.status(500).json({ error: 'Error al obtener roles' });
    }
    res.json(results);
  });
};

// 🔹 GET - Rol por ID
exports.getRoleById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM roles WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('💥 Error al obtener rol:', err);
      return res.status(500).json({ error: 'Error al obtener rol' });
    }
    if (!results.length) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }
    res.json(results[0]);
  });
};

// 🔹 POST - Crear rol
exports.createRole = (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: 'El nombre del rol es obligatorio' });
  }

  db.query(
    'INSERT INTO roles (name, description) VALUES (?, ?)',
    [name.trim(), description || null],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'El rol ya existe' });
        }
        console.error('💥 Error al crear rol:', err);
        return res.status(500).json({ error: 'Error al crear rol' });
      }

      res.status(201).json({
        message: 'Rol creado correctamente',
        role: { id: result.insertId, name, description },
      });
    }
  );
};

// 🔹 PUT - Actualizar rol
exports.updateRole = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: 'El nombre del rol es obligatorio' });
  }

  db.query(
    'UPDATE roles SET name = ?, description = ? WHERE id = ?',
    [name.trim(), description || null, id],
    (err, result) => {
      if (err) {
        console.error('💥 Error al actualizar rol:', err);
        return res.status(500).json({ error: 'Error al actualizar rol' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Rol no encontrado' });
      }

      res.json({ message: 'Rol actualizado correctamente' });
    }
  );
};

// 🔹 DELETE - Eliminar rol
exports.deleteRole = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM roles WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('💥 Error al eliminar rol:', err);
      return res.status(500).json({ error: 'Error al eliminar rol' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    res.json({ message: 'Rol eliminado correctamente' });
  });
};
