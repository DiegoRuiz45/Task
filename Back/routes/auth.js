const express = require('express');
const authController = require('../controllers/authController'); // ✅ te faltaba esta línea
const router = express.Router();

// 🔑 Login
router.post('/login', authController.login);

// 🧼 Logout
router.post('/logout', authController.logout);

// 👤 Info del usuario actual (si tiene token)
router.get('/me', authController.getMe);

module.exports = router;
