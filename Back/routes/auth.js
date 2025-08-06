const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// 🔑 Login
router.post('/login', authController.login);

// 🧼 Logout
router.post('/logout', authController.logout);

// 👤 Info del usuario actual (si tiene token)
router.get('/me', authController.getMe);

// 👥 Obtener todos los usuarios
router.get('/getUsers', authController.getAllUsers);

// 🔎 Obtener usuario por ID
router.get('/users/:id', authController.getUserById);

// ➕ Crear nuevo usuario
router.post('/create-user', authController.createUser);

// 🛠 Actualizar usuario
router.put('/users/:id', authController.updateUser);

// 🗑 Eliminar usuario
router.delete('/users/:id', authController.deleteUser);

module.exports = router;
