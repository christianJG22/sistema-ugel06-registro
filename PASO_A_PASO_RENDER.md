# 🚀 Guía Paso a Paso para Desplegar en Render

¡Perfecto! Todo está listo para desplegar. Sigue estos pasos:

---

## 📋 PASO 1: Subir Código a GitHub

```bash
# Navega al directorio principal
cd c:\Users\CHRISTIAN\Desktop\sistema-registro-ie

# Verifica el estado
git status

# Agrega todos los archivos
git add .

# Commit
git commit -m "Sistema listo para despliegue en Render con PostgreSQL"

# Push a GitHub
git push origin main
```

**✅ Verificación:** Revisa en GitHub que todos los archivos estén subidos.

---

## 📋 PASO 2: Crear Cuenta en Render

1. Ve a https://render.com
2. Click en **"Get Started for Free"**
3. Selecciona **"Sign up with GitHub"**
4. Autoriza Render a acceder a tus repositorios

---

## 📋 PASO 3: Crear Base de Datos PostgreSQL

1. En el dashboard de Render, click en **"New +"**
2. Selecciona **"PostgreSQL"**
   - **Name:** `ugel06-database`
   - **Database:** `ugel06`
   - **User:** `ugel06_user`
   - **Region:** Oregon (US West) - más cercano
   - **Plan:** **Free**
3. Click en **"Create Database"**
4. **IMPORTANTE:** Copia la **"Internal Database URL"** (la necesitarás)

---

## 📋 PASO 4: Desplegar Backend (Web Service)

1. En el dashboard, click en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub
   - Busca: `sistema-registro-ie`
   - Click en **"Connect"**

### Configuración del Backend:

| Campo | Valor |
|-------|-------|
| **Name** | `ugel06-backend` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | `Free` |

### Variables de Entorno:

Click en **"Advanced"** y agrega estas variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *Pegar la Internal Database URL del paso 3* |
| `PORT` | `10000` (Render lo asigna automático) |

4. Click en **"Create Web Service"**

**⏱️ Espera 3-5 minutos** mientras Render despliega el backend.

**✅ Verificación:** 
- El deploy debe decir "Live" (verde)
- Visita: `https://ugel06-backend.onrender.com/api/health`
- Deberías ver: `{"success":true,"message":"Servidor funcionando correctamente"...}`

---

## 📋 PASO 5: Desplegar Frontend (Static Site)

1. En el dashboard, click en **"New +"**
2. Selecciona **"Static Site"**
3. Conecta el mismo repositorio: `sistema-registro-ie`

### Configuración del Frontend:

| Campo | Valor |
|-------|-------|
| **Name** | `ugel06-frontend` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `mi-sistema` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |
| **Plan** | `Free` |

### Variables de Entorno:

Click en **"Advanced"** y agrega:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://ugel06-backend.onrender.com/api` |

*(Reemplaza `ugel06-backend` con el nombre exacto de tu backend)*

4. Click en **"Create Static Site"**

**⏱️ Espera 2-3 minutos** mientras Render construye el frontend.

---

## 🎉 PASO 6: ¡Listo! Prueba tu Aplicación

### URLs Finales:

- **Frontend:** `https://ugel06-frontend.onrender.com`
- **Backend API:** `https://ugel06-backend.onrender.com/api`
- **Visualizador DB:** `https://ugel06-backend.onrender.com/db-viewer`

### Pruebas:

1. **Abre el frontend** en tu navegador
2. **Registra una institución** (sin login - público)
3. **Haz login** como admin:
   - Usuario: `admin`
   - Contraseña: `ugel06admin`
4. **Ver la base de datos** en `/db-viewer`

---

## ⚠️ IMPORTANTE: Primera Vez

**El servicio gratuito de Render se "duerme" después de 15 minutos de inactividad.**

- Primera carga: ~30 segundos (se está "despertando")
- Cargas siguientes: Instantáneas

**Solución:** 
- Usar un servicio como UptimeRobot (gratis) para hacer ping cada 14 minutos
- O simplemente esperar 30 segundos la primera vez que alguien acceda

---

## 📊 Monitoreo y Logs

### Ver logs del Backend:
1. Ve a tu Web Service en Render
2. Click en **"Logs"**
3. Verás todos los registros en tiempo real

### Ver base de datos:
- Opción 1: `https://tu-backend.onrender.com/db-viewer`
- Opción 2: Dashboard de Render → PostgreSQL → "Info" → Copiar **External Database URL** → Usar con DB Browser

---

## 🔄 Actualizar el Sitio

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

**Render automáticamente:**
- Detecta el push
- Reconstruye el sitio
- Despliega la nueva versión

---

## 🆘 Solución de Problemas

### El backend no inicia:
1. Revisa los logs en Render
2. Verifica que `DATABASE_URL` esté configurada
3. Verifica que `NODE_ENV=production`

### El frontend no se conecta al backend:
1. Verifica la variable `REACT_APP_API_URL`
2. Asegúrate de terminar en `/api`
3. Reconstruye el frontend

### Error CORS:
- El backend ya tiene CORS habilitado (`app.use(cors())`)

---

## 💰 Costos

**TODO ES 100% GRATIS:**
- Backend: 750 horas/mes (suficiente)
- Frontend: Ilimitado
- PostgreSQL: 1GB de almacenamiento (suficiente para ~10,000 instituciones)

**Límites:**
- Backend se duerme tras 15 min sin uso
- PostgreSQL tiene límite de 1GB

---

## 📝 Checklist Final

Antes de decir que está listo:

- [ ] Código subido a GitHub
- [ ] Base de datos PostgreSQL creada en Render
- [ ] Backend desplegado (estado: Live)
- [ ] Frontend desplegado (estado: Live)
- [ ] Variables de entorno configuradas
- [ ] Puedes registrar una institución
- [ ] Puedes hacer login como admin
- [ ] Puedes ver registros
- [ ] Visualizador DB funciona

---

## 🎯 Próximos Pasos Opcionales

1. **Dominio personalizado** (en Render → Settings → Custom Domain)
2. **UptimeRobot** para mantener el sitio despierto
3. **Backups** periódicos de la base de datos

---

## 🎓 Comandos Útiles

### Ver estado de la BD en Render:
```bash
# Desde Render Dashboard → PostgreSQL → Shell
\dt  # Ver tablas
SELECT COUNT(*) FROM instituciones;  # Contar registros
```

### Exportar datos locales:
1. Ve a http://localhost:5000/db-viewer
2. Click "Exportar a Excel"
3. Sube a producción desde el frontend como admin

---

¿Listo para empezar? 🚀

**Siguiente paso:** Ejecuta los comandos de git para subir tu código.
