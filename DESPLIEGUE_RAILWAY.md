# 🚂 Guía Completa: Desplegar en Railway

## ✅ Por Qué Railway es Perfecto para Ti

- ✅ **$5 USD gratis cada mes** (se renueva automáticamente)
- ✅ **No se duerme** - siempre activo
- ✅ **Link público permanente** para compartir
- ✅ **Múltiples usuarios simultáneos**
- ✅ **PostgreSQL incluido gratis**
- ✅ **Deploy automático** desde GitHub

---

## 📋 PASO 1: Arreglar GitHub (PRIMERO)

### Opción A: Usar GitHub Desktop (MÁS FÁCIL)

1. **Descargar GitHub Desktop:**
   - https://desktop.github.com/
   
2. **Abrir GitHub Desktop**
   - Sign in con tu cuenta GitHub

3. **Publicar Repositorio:**
   - File → Add Local Repository
   - Seleccionar: `c:\Users\CHRISTIAN\Desktop\sistema-registro-ie`
   - Si dice "repository not found", click "create a repository"
   - Name: `sistema-registro-ie`
   - Desmarcar "Keep this code private"
   - Click "Publish repository"

### Opción B: Línea de Comandos con Token

```powershell
cd c:\Users\CHRISTIAN\Desktop\sistema-registro-ie

# Remover origin problemático
git remote remove origin

# Ir a GitHub y crear nuevo repo: sistema-registro-ie (público)

# Agregar con tu token
git remote add origin https://cristianJG22:TU-TOKEN@github.com/cristianJG22/sistema-registro-ie.git

# Push
git push -u origin main
```

**Obtener token:**
1. https://github.com/settings/tokens
2. Generate new token (classic)
3. Marcar: `repo`
4. Generar y copiar

---

## 📋 PASO 2: Crear Cuenta en Railway

1. **Ve a:** https://railway.app
2. **Sign Up with GitHub**
3. **Autoriza Railway** para acceder a tus repositorios

---

## 📋 PASO 3: Crear PostgreSQL Database

1. En Railway Dashboard → **New Project**
2. Click **"Provision PostgreSQL"**
3. Espera 30 segundos
4. **Copia estas variables** (las necesitarás):
   - Click en PostgreSQL
   - Tab "Variables"
   - Copia: `DATABASE_URL`

---

## 📋 PASO 4: Desplegar Backend

1. En el mismo proyecto → **"+ New"** → **"GitHub Repo"**
2. Selecciona: `sistema-registro-ie`
3. Railway detectará que hay múltiples apps, selecciona **Root directory: `backend`**

### Configurar Backend:

1. Click en el servicio "backend"
2. **Settings:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

3. **Variables (Tab "Variables"):**
   - Click "+ New Variable"
   - Agregar estas 2 variables:

   ```
   NODE_ENV = production
   DATABASE_URL = (pegar la URL que copiaste del paso 3)
   ```

4. **Deploy:**
   - Automáticamente se desplegará
   - Espera 2-3 minutos

5. **Obtener URL del Backend:**
   - Settings → Networking
   - Click "Generate Domain"
   - Copia la URL: `https://backend-production-XXXX.up.railway.app`

---

## 📋 PASO 5: Desplegar Frontend

1. En el proyecto → **"+ New"** → **"GitHub Repo"**  
2. Selecciona el MISMO repo: `sistema-registro-ie`
3. Root directory: `mi-sistema`

### Configurar Frontend:

1. Click en el servicio "frontend"
2. **Settings:**
   - **Root Directory:** `mi-sistema`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** Dejar vacío
   - **Service Type:** ⚠️ Cambiar a **"Static Site"** (muy importante)
   - **Output Directory:** `build`

3. **Variables:**
   - Click "+ New Variable"
   
   ```
   REACT_APP_API_URL = https://TU-BACKEND-URL.up.railway.app/api
   ```
   
   ⚠️ **IMPORTANTE:** Reemplaza con la URL real de tu backend del paso 4

4. **Deploy:**
   - Click "Deploy"
   - Espera 2-3 minutos

5. **Obtener URL Pública:**
   - Settings → Networking
   - Click "Generate Domain"
   - Tu link público: `https://frontend-production-XXXX.up.railway.app`

---

## 🎉 PASO 6: ¡LISTO! Comparte el Link

Tu sistema estará en:
```
https://frontend-production-XXXX.up.railway.app
```

**Comparte este link** para que las personas se registren.

---

## 🔍 Verificar que Funciona

1. Abre tu link público
2. **Registra una institución** (sin login)
3. **Login como admin:**
   - Usuario: `admin`
   - Contraseña: `ugel06admin`
4. **Ver registros** en la pestaña "Ver Registros"

---

## 📊 Monitoreo en Railway

### Ver Logs:
1. Click en el servicio (backend o frontend)
2. Tab "Deployments"
3. Click en el deployment activo
4. Ver logs en tiempo real

### Ver Base de Datos:
En Railway:
- Click en PostgreSQL
- Tab "Data"
- Ver tablas: `instituciones` y `usuarios`

O desde tu aplicación:
- `https://TU-BACKEND-URL.up.railway.app/db-viewer`

---

## 💡 Uso Mensual (Gratis)

Con $5 USD/mes incluyes:
- **Backend:** ~$2.50 (500 horas activo)
- **Frontend:** ~$0 (estático)
- **PostgreSQL:** ~$2.50 (siempre activo)

**Total: ~$5/mes = GRATIS** con el crédito que te dan

Si gastas todo el crédito antes de fin de mes:
- Las apps se pausan automáticamente
- Se reactivan el 1ro del mes siguiente
- **Solución:** Agregar tarjeta (solo cobra lo que exceda los $5 gratis)

---

## ⚙️ Configuración Avanzada (Opcional)

### Dominio Personalizado:
1. Settings → Networking
2. Custom Domain
3. Agregar tu dominio (ej: `registro-ugel06.com`)

### Backups Automáticos:
1. Click en PostgreSQL
2. Settings → Backups
3. Habilitar backups diarios

---

## 🆘 Solución de Problemas

### Backend no inicia:
- Revisa logs
- Verifica que `DATABASE_URL` esté configurada
- Verifica que `NODE_ENV=production`

### Frontend no se conecta:
- Verifica `REACT_APP_API_URL`
- Debe terminar en `/api`
- Debe ser HTTPS
- Vuelve a desplegar: Settings → "Redeploy"

### Error CORS:
- Ya está habilitado en el backend
- Si persiste, agrega en backend/server.js:
  ```javascript
  app.use(cors({
    origin: 'https://TU-FRONTEND-URL.up.railway.app'
  }));
  ```

---

## 📝 Resumen de URLs

Después del despliegue tendrás:

| Servicio | URL |
|----------|-----|
| **Frontend (LINK PÚBLICO)** | `https://frontend-production-XXXX.up.railway.app` |
| **Backend API** | `https://backend-production-XXXX.up.railway.app/api` |
| **Visualizador BD** | `https://backend-production-XXXX.up.railway.app/db-viewer` |
| **PostgreSQL** | Interno (solo accesible por el backend) |

---

## 🎯 Próximos Pasos

1. ✅ Arreglar GitHub (Paso 1)
2. ✅ Crear cuenta Railway (Paso 2)
3. ✅ Desplegar PostgreSQL (Paso 3)
4. ✅ Desplegar Backend (Paso 4)
5. ✅ Desplegar Frontend (Paso 5)
6. ✅ Compartir link público (Paso 6)

---

**¿Listo? Empieza por el Paso 1 y avísame cuando necesites ayuda.** 🚀
