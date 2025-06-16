const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
const taskRoutes = require('./routes/tasks');
app.use('/api', taskRoutes); // Esto monta /api/tasks y demás

app.listen(3001, () => {
  console.log('🚀 Servidor backend corriendo en http://localhost:3001');
});
