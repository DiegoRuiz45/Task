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

// Importa rutas y middleware
const authRoutes = require('./routes/auth'); // ✅ corregido el nombre
const taskRoutes = require('./routes/tasks'); 
const roleRoutes = require('./routes/roles');
const tagRoutes = require('./routes/tag');
// Rutas públicas
app.use('/auth', authRoutes);    
app.use('/api/tasks', taskRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api', tagRoutes);
const listEndpoints = require('express-list-endpoints');

console.log("📡 Rutas registradas:");
console.table(listEndpoints(app));

app.listen(3001, () => {
  console.log('🚀 Servidor backend corriendo en http://localhost:3001');
});
