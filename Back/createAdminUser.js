const pool = require('./connection');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  const dbName = process.env.DB_NAME;
  const conn = await pool.getConnection();
  await conn.changeUser({ database: dbName });

  // Crear admin si no existe
  const [adminRows] = await conn.query(`SELECT * FROM users WHERE username = 'admin';`);
  if (adminRows.length === 0) {
    const hashedPassword = await bcrypt.hash('Login2025*', 10);
    await conn.query(
      `INSERT INTO users (username, password, role) VALUES (?, ?, 'admin');`,
      ['admin', hashedPassword]
    );
    console.log('✅ Usuario admin creado (usuario: admin / contraseña: Login2025*)');
  } else {
    console.log('ℹ️ Usuario admin ya existe.');
  }

  // Crear desarrollador1
  const [dev1] = await conn.query(`SELECT * FROM users WHERE username = 'dev1';`);
  if (dev1.length === 0) {
    const hashedPassword = await bcrypt.hash('Dev1234*', 10);
    await conn.query(
      `INSERT INTO users (username, password, role) VALUES (?, ?, 'dev');`,
      ['dev1', hashedPassword]
    );
    console.log('✅ Usuario dev1 creado (usuario: dev1 / contraseña: Dev1234*)');
  } else {
    console.log('ℹ️ Usuario dev1 ya existe.');
  }

  // Crear desarrollador2
  const [dev2] = await conn.query(`SELECT * FROM users WHERE username = 'dev2';`);
  if (dev2.length === 0) {
    const hashedPassword = await bcrypt.hash('Dev1234*', 10);
    await conn.query(
      `INSERT INTO users (username, password, role) VALUES (?, ?, 'dev');`,
      ['dev2', hashedPassword]
    );
    console.log('✅ Usuario dev2 creado (usuario: dev2 / contraseña: Dev1234*)');
  } else {
    console.log('ℹ️ Usuario dev2 ya existe.');
  }

  conn.release();
}

module.exports = createAdminUser;
