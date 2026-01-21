const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuración de PostgreSQL
// En desarrollo usa SQLite, en producción usa PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

let pool;

if (databaseUrl) {
    const useSSL = isProduction || databaseUrl.includes('supabase.co');

    pool = new Pool({
        connectionString: databaseUrl,
        ssl: useSSL ? { rejectUnauthorized: false } : false
    });

    console.log(`✓ Configurando conexión PostgreSQL (${useSSL ? 'con SSL' : 'sin SSL'})`);
} else {
    pool = new Pool({
        connectionString: 'postgresql://localhost/ugel06_dev',
        ssl: false
    });
    console.log('✓ Usando PostgreSQL local (sin DATABASE_URL)');
}

// Inicializar base de datos
const inicializarDB = async () => {
    try {
        // Crear tabla instituciones
        await pool.query(`
      CREATE TABLE IF NOT EXISTS instituciones (
        id SERIAL PRIMARY KEY,
        "nombreIE" TEXT NOT NULL,
        "nombreDirector" TEXT NOT NULL,
        "dniDirector" TEXT NOT NULL UNIQUE,
        situacion TEXT NOT NULL,
        aula TEXT NOT NULL,
        telefono TEXT NOT NULL,
        correo TEXT NOT NULL,
        "fechaRegistro" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✓ Tabla instituciones creada/verificada');

        // Crear tabla usuarios
        await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        usuario TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        rol TEXT DEFAULT 'admin',
        "fechaCreacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('✓ Tabla usuarios creada/verificada');

        // Crear usuario admin por defecto si no existe
        const hashedPassword = bcrypt.hashSync('ugel06admin', 10);
        await pool.query(`
      INSERT INTO usuarios (usuario, password, rol) 
      VALUES ($1, $2, $3)
      ON CONFLICT (usuario) DO NOTHING
    `, ['admin', hashedPassword, 'admin']);

        console.log('✓ Usuario admin verificado (usuario: admin, contraseña: ugel06admin)');
    } catch (error) {
        console.error('Error al inicializar base de datos:', error.message);
        throw error;
    }
};

// ============= FUNCIONES PARA INSTITUCIONES =============

const obtenerInstituciones = (callback) => {
    pool.query('SELECT * FROM instituciones ORDER BY "fechaRegistro" DESC')
        .then(result => callback(null, result.rows))
        .catch(err => callback(err, null));
};

const obtenerInstitucionPorId = (id, callback) => {
    pool.query('SELECT * FROM instituciones WHERE id = $1', [id])
        .then(result => callback(null, result.rows[0]))
        .catch(err => callback(err, null));
};

const crearInstitucion = (data, callback) => {
    const { nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo } = data;

    pool.query(
        `INSERT INTO instituciones ("nombreIE", "nombreDirector", "dniDirector", situacion, aula, telefono, correo) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo]
    )
        .then(result => callback(null, result.rows[0].id))
        .catch(err => callback(err, null));
};

const actualizarInstitucion = (id, data, callback) => {
    const { nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo } = data;

    pool.query(
        `UPDATE instituciones 
     SET "nombreIE" = $1, "nombreDirector" = $2, "dniDirector" = $3, situacion = $4, 
         aula = $5, telefono = $6, correo = $7
     WHERE id = $8`,
        [nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo, id]
    )
        .then(result => callback(null, result.rowCount))
        .catch(err => callback(err, null));
};

const eliminarInstitucion = (id, callback) => {
    pool.query('DELETE FROM instituciones WHERE id = $1', [id])
        .then(result => callback(null, result.rowCount))
        .catch(err => callback(err, null));
};

const verificarDniExiste = (dni, idExcluir, callback) => {
    let query = 'SELECT id FROM instituciones WHERE "dniDirector" = $1';
    let params = [dni];

    if (idExcluir) {
        query += ' AND id != $2';
        params.push(idExcluir);
    }

    pool.query(query, params)
        .then(result => callback(null, result.rows.length > 0))
        .catch(err => callback(err, null));
};

// ============= FUNCIONES PARA USUARIOS =============

const obtenerUsuarioPorNombre = (usuario, callback) => {
    pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario])
        .then(result => callback(null, result.rows[0]))
        .catch(err => callback(err, null));
};

// Función para visualizador DB
const obtenerTodasLasTablas = async () => {
    const instituciones = await pool.query('SELECT * FROM instituciones ORDER BY "fechaRegistro" DESC');
    const usuarios = await pool.query('SELECT id, usuario, rol, "fechaCreacion" FROM usuarios');

    return {
        instituciones: instituciones.rows,
        usuarios: usuarios.rows
    };
};

module.exports = {
    pool,
    inicializarDB,
    obtenerInstituciones,
    obtenerInstitucionPorId,
    crearInstitucion,
    actualizarInstitucion,
    eliminarInstitucion,
    verificarDniExiste,
    obtenerUsuarioPorNombre,
    obtenerTodasLasTablas
};
