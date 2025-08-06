const createDatabase = require('./createDatabase');
const createTables = require('./createTables');
const createAdminUser = require('./createAdminUser');

async function initDB() {
    try {
        console.log('🛠️ Iniciando configuración de base de datos...');
        await createDatabase();
        await createTables();
        await createAdminUser();
        console.log('🎉 Todo listo. La base está firme como piedra.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error durante la inicialización de la base de datos:', err.message);
        process.exit(1);
    }
}

initDB();
