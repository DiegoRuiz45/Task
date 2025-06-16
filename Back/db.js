const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err.message);
    process.exit(1);
  }

  console.log('✅ Conectado a MySQL (sin DB específica).');

  const dbName = process.env.DB_NAME;

  connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`, (err) => {
    if (err) {
      console.error('❌ Error al crear la base de datos:', err.message);
      process.exit(1);
    }

    console.log(`✅ Base de datos "${dbName}" verificada o creada.`);

    connection.changeUser({ database: dbName }, (err) => {
      if (err) {
        console.error('❌ Error al seleccionar base de datos:', err.message);
        process.exit(1);
      }

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS task_manager (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          completed BOOLEAN DEFAULT false,
          status ENUM('actividades', 'enProceso', 'realizadas', 'cancelado') DEFAULT 'actividades',
          priority ENUM('baja', 'media', 'alta') DEFAULT 'media',
          tags JSON,
          color VARCHAR(7) DEFAULT '#3b82f6',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      connection.query(createTableQuery, (err) => {
        if (err) {
          console.error('❌ Error al crear la tabla:', err.message);
          process.exit(1);
        }

        console.log('✅ Tabla "task_manager" creada con usuario, título, descripción, prioridad, etiquetas, color y estado.');
      });
    });
  });
});

module.exports = connection;
