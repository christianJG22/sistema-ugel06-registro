// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

// Usar PostgreSQL en producción, SQLite en desarrollo
const isProduction = process.env.NODE_ENV === 'production';
const dbModule = isProduction ? './database-postgres' : './database';

console.log(`Entorno: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
console.log(`Base de datos: ${isProduction ? 'PostgreSQL' : 'SQLite'}`);

const {
  obtenerInstituciones,
  obtenerInstitucionPorId,
  crearInstitucion,
  actualizarInstitucion,
  eliminarInstitucion,
  verificarDniExiste,
  obtenerUsuarioPorNombre,
  inicializarDB,
  obtenerTodasLasTablas
} = require(dbModule);

const { verificarToken, generarToken } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inicializar base de datos en producción (PostgreSQL)
if (isProduction && inicializarDB) {
  console.log('Iniciando inicialización de BD...');
  inicializarDB()
    .then(() => console.log('✓ Base de datos inicializada correctamente'))
    .catch(err => {
      console.error('❌ Error fatal al inicializar BD:', err.message);
      if (err.code === 'ECONNREFUSED' || err.code === '28P01') {
        console.error('💡 Tip: Verifica que DATABASE_URL sea correcta y que el usuario tenga permisos.');
      }
      // No salimos del proceso para permitir que Vercel intente servir otras rutas o reintentar
      // process.exit(1); 
    });
}

// ============= RUTAS PÚBLICAS =============

// Obtener todas las instituciones (público)
app.get('/api/instituciones', (req, res) => {
  obtenerInstituciones((err, instituciones) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener instituciones',
        error: err.message
      });
    }
    res.json({ success: true, data: instituciones });
  });
});

// Crear institución (público - para registro)
app.post('/api/instituciones', (req, res) => {
  const { nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo } = req.body;

  // Validaciones básicas
  if (!nombreIE || !nombreDirector || !dniDirector || !situacion || !aula || !telefono || !correo) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    });
  }

  // Verificar si DNI ya existe
  verificarDniExiste(dniDirector, null, (err, existe) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar DNI',
        error: err.message
      });
    }

    if (existe) {
      return res.status(400).json({
        success: false,
        message: 'El DNI ya está registrado'
      });
    }

    // Crear institución
    crearInstitucion(req.body, (err, id) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error al crear institución',
          error: err.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Institución registrada exitosamente',
        id: id
      });
    });
  });
});

// Login de administrador
app.post('/api/auth/login', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({
      success: false,
      message: 'Usuario y contraseña son requeridos'
    });
  }

  obtenerUsuarioPorNombre(usuario, (err, usuarioDb) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: err.message
      });
    }

    if (!usuarioDb) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const passwordValida = bcrypt.compareSync(password, usuarioDb.password);

    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // Generar token
    const token = generarToken(usuarioDb);

    res.json({
      success: true,
      message: 'Login exitoso',
      token: token,
      usuario: {
        id: usuarioDb.id,
        usuario: usuarioDb.usuario,
        rol: usuarioDb.rol
      }
    });
  });
});

// ============= RUTAS PROTEGIDAS (SOLO ADMIN) =============

// Actualizar institución (requiere autenticación)
app.put('/api/instituciones/:id', verificarToken, (req, res) => {
  const id = req.params.id;
  const { nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo } = req.body;

  if (!nombreIE || !nombreDirector || !dniDirector || !situacion || !aula || !telefono || !correo) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    });
  }

  // Verificar si DNI ya existe (excluyendo el registro actual)
  verificarDniExiste(dniDirector, id, (err, existe) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar DNI',
        error: err.message
      });
    }

    if (existe) {
      return res.status(400).json({
        success: false,
        message: 'El DNI ya está registrado en otra institución'
      });
    }

    actualizarInstitucion(id, req.body, (err, changes) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error al actualizar institución',
          error: err.message
        });
      }

      if (changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Institución no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Institución actualizada exitosamente'
      });
    });
  });
});

// Eliminar institución (requiere autenticación)
app.delete('/api/instituciones/:id', verificarToken, (req, res) => {
  const id = req.params.id;

  eliminarInstitucion(id, (err, changes) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar institución',
        error: err.message
      });
    }

    if (changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Institución no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Institución eliminada exitosamente'
    });
  });
});

// Verificar token (para validar sesión)
app.get('/api/auth/verify', verificarToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token válido',
    usuario: req.usuario
  });
});

// ============= VISUALIZADOR DE BASE DE DATOS =============

// Visualizador web de la base de datos
app.get('/db-viewer', async (req, res) => {
  try {
    let instituciones, usuarios;

    if (isProduction && obtenerTodasLasTablas) {
      // PostgreSQL
      const datos = await obtenerTodasLasTablas();
      instituciones = datos.instituciones;
      usuarios = datos.usuarios;
    } else {
      // SQLite (callback-based)
      const db = require('./database').db;
      instituciones = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM instituciones ORDER BY fechaRegistro DESC', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      usuarios = await new Promise((resolve, reject) => {
        db.all('SELECT id, usuario, rol, fechaCreacion FROM usuarios', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visualizador Base de Datos - UGEL 06</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      text-align: center;
      color: #667eea;
      margin-bottom: 10px;
      font-size: 2em;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 0.9em;
    }
    .env-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 15px;
      font-size: 0.8em;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .env-prod {
      background: #22c55e;
      color: white;
    }
    .env-dev {
      background: #3b82f6;
      color: white;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .stat-number {
      font-size: 2.5em;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 0.9em;
      opacity: 0.9;
    }
    .section {
      margin-bottom: 40px;
    }
    h2 {
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 0.9em;
      text-transform: uppercase;
    }
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #f0f0f0;
    }
    tr:hover {
      background: #f8f9ff;
    }
    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
    }
    .badge-primary {
      background: #e0e7ff;
      color: #667eea;
    }
    .badge-success {
      background: #d1fae5;
      color: #059669;
    }
    .no-data {
      text-align: center;
      padding: 40px;
      color: #999;
    }
    .refresh-btn {
      display: block;
      margin: 20px auto;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 1em;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🗄️ Visualizador de Base de Datos</h1>
    <p class="subtitle">Sistema de Registro UGEL 06</p>
    <div style="text-align: center;">
      <span class="env-badge ${isProduction ? 'env-prod' : 'env-dev'}">
        ${isProduction ? '🌐 PRODUCCIÓN - PostgreSQL' : '💻 DESARROLLO - SQLite'}
      </span>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${instituciones.length}</div>
        <div class="stat-label">Instituciones Registradas</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${usuarios.length}</div>
        <div class="stat-label">Usuarios Admin</div>
      </div>
    </div>

    <button class="refresh-btn" onclick="location.reload()">🔄 Actualizar Datos</button>

    <div class="section">
      <h2>📚 Instituciones</h2>
      ${instituciones.length === 0 ? '<div class="no-data">No hay instituciones registradas</div>' : `
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Institución</th>
              <th>Director</th>
              <th>DNI</th>
              <th>Situación</th>
              <th>Aula</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${instituciones.map(ie => `
              <tr>
                <td><span class="badge badge-primary">${ie.id}</span></td>
                <td><strong>${ie.nombreIE}</strong></td>
                <td>${ie.nombreDirector}</td>
                <td>${ie.dniDirector}</td>
                <td><span class="badge badge-success">${ie.situacion}</span></td>
                <td>${ie.aula}</td>
                <td>${ie.telefono}</td>
                <td style="font-size: 0.85em;">${ie.correo}</td>
                <td style="font-size: 0.85em;">${new Date(ie.fechaRegistro).toLocaleString('es-PE')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      `}
    </div>

    <div class="section">
      <h2>👥 Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Fecha Creación</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios.map(user => `
            <tr>
              <td><span class="badge badge-primary">${user.id}</span></td>
              <td><strong>${user.usuario}</strong></td>
              <td><span class="badge badge-success">${user.rol}</span></td>
              <td>${new Date(user.fechaCreacion).toLocaleString('es-PE')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="text-align: center; margin-top: 30px; color: #999; font-size: 0.85em;">
      Última actualización: ${new Date().toLocaleString('es-PE')}
    </div>
  </div>
</body>
</html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Error en visualizador:', error);
    res.status(500).send('Error al cargar visualizador');
  }
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    environment: isProduction ? 'production' : 'development',
    database: isProduction ? 'PostgreSQL' : 'SQLite',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API UGEL 06 - Sistema de Registro',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      dbViewer: '/db-viewer',
      instituciones: '/api/instituciones',
      login: '/api/auth/login'
    }
  });
});

// Solo iniciar servidor si NO es Vercel (desarrollo local)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 Servidor UGEL 06 iniciado`);
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📊 DB Viewer: http://localhost:${PORT}/db-viewer`);
    console.log(`========================================\n`);
  });
}

// Exportar app para Vercel
module.exports = app;
