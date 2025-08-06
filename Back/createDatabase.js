const pool = require('./connection');

async function createDatabase() {
    const dbName = process.env.DB_NAME;
    await pool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Base de datos "${dbName}" verificada o creada.`);
}

module.exports = createDatabase;
