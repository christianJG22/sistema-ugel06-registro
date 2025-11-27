# Sistema de Registro UGEL 06

Sistema completo con base de datos y autenticación para el registro de instituciones educativas.

## 🚀 Características

- ✅ **Base de datos SQLite** - Almacenamiento permanente de datos
- ✅ **Sistema de autenticación** - Acceso protegido para administradores
- ✅ **Registro público** - Cualquier persona puede registrar instituciones
- ✅ **Panel administrativo** - Solo admin puede ver, editar y eliminar
- ✅ **Exportación/Importación Excel** - Gestión masiva de datos
- ✅ **API REST** - Backend modular y escalable

## 📋 Requisitos

- Node.js instalado (versión 14 o superior)
- Navegador web moderno

## 🔧 Instalación

### 1. Backend (Servidor)

```bash
cd backend
npm install
```

### 2. Frontend (React)

```bash
cd mi-sistema
npm install
```

## ▶️ Ejecución

Es necesario ejecutar **AMBOS** servidores:

### Terminal 1 - Backend
```bash
cd backend
node server.js
```
Servidor corriendo en: http://localhost:5000

### Terminal 2 - Frontend
```bash
cd mi-sistema
npm start
```
Aplicación corriendo en: http://localhost:3000

## 🔐 Credenciales de Administrador

**Usuario:** `admin`  
**Contraseña:** `ugel06admin`

## 📖 Uso del Sistema

### Para el Público General
1. Abrir http://localhost:3000
2. Ir a la pestaña "Registrar"
3. Llenar el formulario con los datos del director
4. Hacer clic en "Guardar"

### Para Administradores
1. Hacer clic en "Ver Registros"
2. Ingresar credenciales de administrador
3. Acceder al panel administrativo donde se puede:
   - Ver todas las instituciones registradas
   - Editar instituciones existentes
   - Eliminar instituciones
   - Exportar datos a Excel
   - Importar datos desde Excel
   - Buscar instituciones

## 📁 Estructura del Proyecto

```
sistema-registro-ie/
├── backend/                    # Servidor Node.js + Express
│   ├── server.js              # Servidor principal
│   ├── database.js            # Capa de base de datos
│   ├── auth.js                # Autenticación JWT
│   ├── package.json           # Dependencias backend
│   └── ugel06.db              # Base de datos SQLite (se crea automáticamente)
│
└── mi-sistema/                # Aplicación React
    ├── src/
    │   ├── App.js             # Componente principal
    │   └── App.css            # Estilos
    └── package.json           # Dependencias frontend
```

## 🗄️ Base de Datos

La base de datos SQLite (`ugel06.db`) se crea automáticamente al iniciar el servidor backend.

### Tablas:

**instituciones**
- id (PRIMARY KEY)
- nombreIE
- nombreDirector
- dniDirector (UNIQUE)
- situacion
- aula
- telefono
- correo
- fechaRegistro

**usuarios**
- id (PRIMARY KEY)
- usuario (UNIQUE)
- password (encriptado con bcrypt)
- rol
- fechaCreacion

## 🔒 Seguridad

- Las contraseñas se almacenan encriptadas usando bcrypt
- Autenticación mediante JWT (JSON Web Tokens)
- Tokens válidos por 24 horas
- Las rutas administrativas están protegidas
- Validación de DNI único
- CORS habilitado para desarrollo

## 📊 API Endpoints

### Públicos
- `GET /api/instituciones` - Obtener todas las instituciones
- `POST /api/instituciones` - Registrar nueva institución
- `POST /api/auth/login` - Login de administrador

### Protegidos (requieren token)
- `PUT /api/instituciones/:id` - Actualizar institución
- `DELETE /api/instituciones/:id` - Eliminar institución
- `GET /api/auth/verify` - Verificar token

## 🛠️ Desarrollo

### Backend
Para desarrollo del backend con auto-restart:
```bash
npm install -g nodemon
cd backend
nodemon server.js
```

### Frontend
El servidor de desarrollo de React se recarga automáticamente.

## 📝 Notas Importantes

1. **Persistencia:** Los datos se guardan permanentemente en la base de datos SQLite
2. **Backup:** Recomendado hacer backup periódico del archivo `ugel06.db`
3. **Producción:** Para producción, cambiar JWT_SECRET en `auth.js`
4. **Puerto:** Backend usa puerto 5000, Frontend usa 3000

## 👨‍💻 Desarrollado por

Christian J. - 2024

## 📄 Licencia

ISC
