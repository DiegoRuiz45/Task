const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
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

    connection.changeUser({ database: dbName }, async (err) => {
      if (err) {
        console.error('❌ Error al seleccionar base de datos:', err.message);
        process.exit(1);
      }

      const createTablesQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role ENUM('admin', 'user') DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `;

      connection.query(createTablesQuery, async (err) => {
        if (err) {
          console.error('❌ Error al crear las tablas:', err.message);
          process.exit(1);
        }

        console.log('✅ Tablas "users" y "task_manager" creadas correctamente.');

        // Verificar si ya existe un admin
        connection.query(`SELECT * FROM users WHERE username = 'admin';`, async (err, results) => {
          if (err) {
            console.error('❌ Error al verificar usuario admin:', err.message);
            process.exit(1);
          }

          if (results.length === 0) {
            const hashedPassword = await bcrypt.hash('Login2025*', 10);

            connection.query(
              `INSERT INTO users (username, password, role) VALUES (?, ?, 'admin');`,
              ['admin', hashedPassword],
              (err) => {
                if (err) {
                  console.error('❌ Error al insertar usuario admin:', err.message);
                  process.exit(1);
                }

                console.log('✅ Usuario admin creado con éxito (usuario: admin / contraseña: Login2025*)');
              }
            );
          } else {
            console.log('ℹ️ Usuario admin ya existe, no se creó uno nuevo.');
          }
        });
      });
    });
  });
});

module.exports = connection;
