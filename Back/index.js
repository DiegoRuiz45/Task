const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('⛔️ No permitido por CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Secret (en producción debe venir de .env)
const SECRET = process.env.JWT_SECRET || 'super_secreto';

// Importa rutas y middleware
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/tasks');
const authMiddleware = require('./middlewares/auth');

// Rutas públicas
app.use('/auth', authRoutes);

// Rutas protegidas
app.use('/api', authMiddleware, taskRoutes);

app.listen(3001, () => {
  console.log('🚀 Servidor backend corriendo en http://localhost:3001');
});
