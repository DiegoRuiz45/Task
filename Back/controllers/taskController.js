const taskService = require('../services/taskService');

const validStatuses = ['actividades', 'enProceso', 'realizadas', 'cancelado'];
const validPriorities = ['baja', 'media', 'alta'];

exports.getTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAll();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTask = async (req, res) => {
  // console.log("👉 Datos recibidos en backend:", req.body);
  const {
    title,
    description,
    user_id = null,
    status,
    priority,
    tags = [],
    color,
  } = req.body;

  const errors = [];

  if (typeof title !== 'string' || !title.trim()) {
    errors.push("El título es requerido.");
  }

  if (!validStatuses.includes(status)) {
    errors.push(`Estado inválido: "${status}"`);
  }

  if (!validPriorities.includes(priority)) {
    errors.push(`Prioridad inválida: "${priority}"`);
  }

  if (errors.length > 0) {
    console.log("❌ Errores de validación:", errors);
    return res.status(400).json({ errors });
  }

  try {
    const newTask = await taskService.create({
      title: title.trim(),
      description,
      user_id,
      status,
      priority,
      tags: JSON.stringify(tags),
      color,
    });

    res.status(201).json(newTask);
  } catch (err) {
    console.error("💥 Error al crear la tarea:", err);
    res.status(500).json({ error: err.message });
  }
};

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
    user_id,
  } = req.body;

  if (
    !title &&
    description === undefined &&
    completed === undefined &&
    !status &&
    !priority &&
    !tags &&
    !color &&
    user_id === undefined
  ) {
    return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar.' });
  }

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido.' });
  }

  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Prioridad inválida.' });
  }

  try {
    const updatedFields = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(completed !== undefined && { completed }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(tags && { tags: JSON.stringify(tags) }),
      ...(color && { color }),
      ...(user_id !== undefined && { user_id: user_id || null }),
    };

    const result = await taskService.update(id, updatedFields);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Tarea no encontrada.' });

    res.json({ message: 'Tarea actualizada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await taskService.remove(id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Tarea no encontrada.' });

    res.json({ message: 'Tarea eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
