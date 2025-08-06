const db = require('../db');

const validStatuses = ['actividades', 'enProceso', 'realizadas', 'cancelado'];
const validPriorities = ['baja', 'media', 'alta'];

//
// 📥 GET ALL TASKS
//
exports.getTasks = async (req, res) => {
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//
// 🆕 CREATE TASK
//
exports.createTask = async (req, res) => {
  const {
    title,
    description,
    status,
    priority,
    tags = [],
    color,
    user_ids = [],
  } = req.body;

  const errors = [];

  if (typeof title !== 'string' || !title.trim()) errors.push("El título es requerido.");
  if (!validStatuses.includes(status)) errors.push(`Estado inválido: "${status}"`);
  if (!validPriorities.includes(priority)) errors.push(`Prioridad inválida: "${priority}"`);
  if (!Array.isArray(user_ids) || user_ids.some(id => isNaN(id))) {
    errors.push("user_ids debe ser un array de números válidos.");
  }

  if (errors.length > 0) {
    console.log("❌ Errores de validación:", errors);
    return res.status(400).json({ errors });
  }

  try {
    const newTask = await createTask({
      title: title.trim(),
      description,
      status,
      priority,
      tags: Array.isArray(tags) ? tags : safeParseArray(tags),
      color,
    });

    await assignUsersToTask(newTask.id, user_ids);

    res.status(201).json({ task: newTask, assigned_users: user_ids });
  } catch (err) {
    console.error("💥 Error al crear la tarea:", err);
    res.status(500).json({ error: err.message });
  }
};

//
// 🛠️ UPDATE TASK
//
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    completed,
    status,
    priority,
    tags,
    color,
    user_ids,
  } = req.body;

  if (
    !title && description === undefined && completed === undefined &&
    !status && !priority && !tags && !color && user_ids === undefined
  ) {
    return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar.' });
  }

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido.' });
  }

  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Prioridad inválida.' });
  }

  if (user_ids && (!Array.isArray(user_ids) || user_ids.some(id => isNaN(id)))) {
    return res.status(400).json({ error: "user_ids debe ser un array de números válidos." });
  }

  try {
    const updatedFields = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(completed !== undefined && { completed }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(tags && { tags: JSON.stringify(Array.isArray(tags) ? tags : safeParseArray(tags)) }),
      ...(color && { color }),
    };

    const result = await updateTask(id, updatedFields);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }

    if (Array.isArray(user_ids)) {
      await deleteUsersFromTask(id);
      await assignUsersToTask(id, user_ids);
    }

    res.json({ message: 'Tarea actualizada correctamente.' });
  } catch (err) {
    console.error("💥 Error en updateTask:", err);
    res.status(500).json({ error: err.message });
  }
};

//
// ❌ DELETE TASK
//
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteTask(id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Tarea no encontrada.' });

    res.json({ message: 'Tarea eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUsersFromTask = (taskId) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM task_users WHERE task_id = ?', [taskId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

//
// 🔽 FUNCIONES INTERNAS
//
const getAllTasks = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        t.*,
        tu.user_id,
        u.username
      FROM task_manager t
      LEFT JOIN task_users tu ON t.id = tu.task_id
      LEFT JOIN users u ON tu.user_id = u.id
      ORDER BY t.created_at DESC
    `;

    db.query(sql, (err, rows) => {
      if (err) return reject(err);

      const taskMap = new Map();

      rows.forEach(row => {
        const existing = taskMap.get(row.id);
        const tagArray = safeParseArray(row.tags);

        if (!existing) {
          taskMap.set(row.id, {
            id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            priority: row.priority,
            tags: tagArray,
            color: row.color,
            completed: row.completed,
            created_at: row.created_at,
            user_ids: row.user_id ? [row.user_id] : [],
            user_names: row.username ? [row.username] : [],
          });
        } else {
          if (row.user_id && !existing.user_ids.includes(row.user_id)) {
            existing.user_ids.push(row.user_id);
          }
          if (row.username && !existing.user_names.includes(row.username)) {
            existing.user_names.push(row.username);
          }
        }
      });

      resolve(Array.from(taskMap.values()));
    });
  });
};

const safeParseArray = (value) => {
  if (Array.isArray(value)) return value; // ✅ ya es un array, no lo toques
  try {
    if (Buffer.isBuffer(value)) value = value.toString('utf8');
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    return [];
  } catch (err) {
    console.warn("⚠️ Error al parsear tags:", value);
    return [];
  }
};


const createTask = ({ title, description, status, priority, tags, color }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO task_manager (title, description, status, priority, tags, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      title,
      description || '',
      status,
      priority,
      JSON.stringify(tags),
      color || null,
    ];

    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve({
        id: result.insertId,
        title,
        description,
        status,
        priority,
        tags,
        color,
      });
    });
  });
};

const assignUsersToTask = (taskId, userIds = []) => {
  return new Promise((resolve, reject) => {
    if (userIds.length === 0) return resolve([]);
    const values = userIds.map(userId => [taskId, userId]);
    db.query(`INSERT INTO task_users (task_id, user_id) VALUES ?`, [values], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const updateTask = (id, data) => {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    for (const [key, val] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(val);
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

const deleteTask = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM task_manager WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
