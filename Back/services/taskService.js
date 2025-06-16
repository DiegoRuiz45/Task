const db = require('../db');

exports.getAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM task_manager ORDER BY created_at DESC', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.create = ({ title, description, user_id, status, priority, tags, color }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO task_manager (title, description, user_id, status, priority, tags, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      String(title),
      description || '',
      user_id || null,
      status,
      priority,
      typeof tags === 'string' ? tags : JSON.stringify(tags),
      color || null,
    ];

    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({
        id: result.insertId,
        title,
        description,
        user_id,
        status,
        priority,
        tags,
        color,
      });
    });
  });
};


exports.update = (id, data) => {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.completed !== undefined) {
      fields.push("completed = ?");
      values.push(data.completed);
    }
    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(data.status);
    }
    if (data.priority !== undefined) {
      fields.push("priority = ?");
      values.push(data.priority);
    }
    if (data.tags !== undefined) {
      fields.push("tags = ?");
      values.push(data.tags);
    }
    if (data.color !== undefined) {
      fields.push("color = ?");
      values.push(data.color);
    }
    if (data.user_id !== undefined) {
      fields.push("user_id = ?");
      values.push(data.user_id);
    }

    if (fields.length === 0) {
      return reject(new Error("No hay campos para actualizar."));
    }

    values.push(id);
    const sql = `UPDATE task_manager SET ${fields.join(", ")} WHERE id = ?`;

    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.remove = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM task_manager WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
