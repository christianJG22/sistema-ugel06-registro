const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Crear/abrir base de datos
const db = new sqlite3.Database(path.join(__dirname, 'ugel06.db'), (err) => {
    if (err) {
        console.error('Error al abrir base de datos:', err);
    } else {
        console.log('✓ Base de datos conectada');
    }
});

// Crear tablas si no existen
db.serialize(() => {
    // Tabla de instituciones
    db.run(`
    CREATE TABLE IF NOT EXISTS instituciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombreIE TEXT NOT NULL,
      nombreDirector TEXT NOT NULL,
      dniDirector TEXT NOT NULL UNIQUE,
      situacion TEXT NOT NULL,
      aula TEXT NOT NULL,
      telefono TEXT NOT NULL,
      correo TEXT NOT NULL,
      fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
        if (err) {
            console.error('Error al crear tabla instituciones:', err);
        } else {
            console.log('✓ Tabla instituciones lista');
        }
    });

    // Tabla de usuarios admin
    db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      rol TEXT DEFAULT 'admin',
      fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
        if (err) {
            console.error('Error al crear tabla usuarios:', err);
        } else {
            console.log('✓ Tabla usuarios lista');

            // Crear usuario admin por defecto si no existe
            db.get('SELECT * FROM usuarios WHERE usuario = ?', ['admin'], (err, row) => {
                if (!row) {
                    const hashedPassword = bcrypt.hashSync('ugel06admin', 10);
                    db.run(
                        'INSERT INTO usuarios (usuario, password, rol) VALUES (?, ?, ?)',
                        ['admin', hashedPassword, 'admin'],
                        (err) => {
                            if (err) {
                                console.error('Error al crear usuario admin:', err);
                            } else {
                                console.log('✓ Usuario admin creado (usuario: admin, contraseña: ugel06admin)');
                            }
                        }
                    );
                }
            });
        }
    });
});

// ============= FUNCIONES PARA INSTITUCIONES =============

// Obtener todas las instituciones
const obtenerInstituciones = (callback) => {
    db.all('SELECT * FROM instituciones ORDER BY fechaRegistro DESC', [], callback);
};

// Obtener institución por ID
const obtenerInstitucionPorId = (id, callback) => {
    db.get('SELECT * FROM instituciones WHERE id = ?', [id], callback);
};

// Crear nueva institución
const crearInstitucion = (data, callback) => {
    const { nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo } = data;

    db.run(
        `INSERT INTO instituciones (nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo],
        function (err) {
            callback(err, this.lastID);
        }
    );
};

// Actualizar institución
const actualizarInstitucion = (id, data, callback) => {
    const { nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo } = data;

    db.run(
        `UPDATE instituciones 
     SET nombreIE = ?, nombreDirector = ?, dniDirector = ?, situacion = ?, aula = ?, telefono = ?, correo = ?
     WHERE id = ?`,
        [nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo, id],
        function (err) {
            callback(err, this.changes);
        }
    );
};

// Eliminar institución
const eliminarInstitucion = (id, callback) => {
    db.run('DELETE FROM instituciones WHERE id = ?', [id], function (err) {
        callback(err, this.changes);
    });
};

// Verificar si DNI ya existe (para validación)
const verificarDniExiste = (dni, idExcluir, callback) => {
    let query = 'SELECT id FROM instituciones WHERE dniDirector = ?';
    let params = [dni];

    if (idExcluir) {
        query += ' AND id != ?';
        params.push(idExcluir);
    }

    db.get(query, params, (err, row) => {
        callback(err, !!row);
    });
};

// ============= FUNCIONES PARA USUARIOS =============

// Obtener usuario por nombre de usuario
const obtenerUsuarioPorNombre = (usuario, callback) => {
    db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario], callback);
};

module.exports = {
    db,
    obtenerInstituciones,
    obtenerInstitucionPorId,
    crearInstitucion,
    actualizarInstitucion,
    eliminarInstitucion,
    verificarDniExiste,
    obtenerUsuarioPorNombre
};
