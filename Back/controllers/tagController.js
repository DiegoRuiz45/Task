// controllers/tagController.js
const db = require('../db');

// 🔹 GET - Todos los tags
exports.getAllTags = (req, res) => {
    db.query('SELECT * FROM tags ORDER BY name ASC', (err, results) => {
        if (err) {
            console.error('💥 Error al obtener tags:', err);
            return res.status(500).json({ error: 'Error al obtener tags' });
        }
        res.json(results);
    });
};

// 🔹 GET - Tag por ID
exports.getTagById = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM tags WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('💥 Error al obtener tag:', err);
            return res.status(500).json({ error: 'Error al obtener tag' });
        }
        if (!results.length) {
            return res.status(404).json({ error: 'Tag no encontrado' });
        }
        res.json(results[0]);
    });
};

// 🔹 POST - Crear tag
exports.createTag = (req, res) => {
    const { name, description } = req.body;

    if (!name?.trim()) {
        return res.status(400).json({ error: 'El nombre del tag es obligatorio' });
    }

    db.query(
        'INSERT INTO tags (name, description) VALUES (?, ?)',
        [name.trim(), description || null],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'El tag ya existe' });
                }
                console.error('💥 Error al crear tag:', err);
                return res.status(500).json({ error: 'Error al crear tag' });
            }

            res.status(201).json({
                message: 'Tag creado correctamente',
                tag: { id: result.insertId, name: name.trim(), description: description || null },
            });
        }
    );
};

// 🔹 PUT - Actualizar tag
exports.updateTag = (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name?.trim()) {
        return res.status(400).json({ error: 'El nombre del tag es obligatorio' });
    }

    db.query(
        'UPDATE tags SET name = ?, description = ? WHERE id = ?',
        [name.trim(), description || null, id],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'El tag ya existe' });
                }
                console.error('💥 Error al actualizar tag:', err);
                return res.status(500).json({ error: 'Error al actualizar tag' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Tag no encontrado' });
            }

            res.json({ message: 'Tag actualizado correctamente' });
        }
    );
};

// 🔹 DELETE - Eliminar tag
exports.deleteTag = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM tags WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('💥 Error al eliminar tag:', err);
            return res.status(500).json({ error: 'Error al eliminar tag' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tag no encontrado' });
        }

        res.json({ message: 'Tag eliminado correctamente' });
    });
};
