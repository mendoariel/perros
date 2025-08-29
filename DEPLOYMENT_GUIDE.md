# 🚀 Guía de Despliegue a Producción

## 📋 Resumen

Esta guía describe el proceso optimizado de despliegue a producción para el proyecto Mi Perro QR, considerando las limitaciones de espacio del servidor y las mejores prácticas para migraciones.

## 🎯 Objetivos del proceso de despliegue

1. **Construcción local** - Ahorrar espacio en el servidor
2. **Backup automático** - Protección de datos
3. **Migraciones robustas** - Manejo seguro de cambios de base de datos
4. **Verificación de salud** - Confirmar que todo funciona
5. **Rollback rápido** - Capacidad de revertir cambios

## 🛠️ Scripts disponibles

### 1. **Despliegue Completo** (`deploy-production-complete.sh`)
**Para cambios importantes que requieren migraciones**

```bash
./scripts/deploy-production-complete.sh
```

**Incluye:**
- ✅ Backup automático de base de datos y archivos
- ✅ Construcción local de backend y frontend
- ✅ Ejecución de migraciones con manejo de errores
- ✅ Reconstrucción completa de contenedores
- ✅ Verificación completa del sistema

**Cuándo usar:**
- Nuevas migraciones de base de datos
- Cambios estructurales importantes
- Nuevas dependencias
- Despliegues importantes

### 2. **Despliegue Rápido** (`deploy-production-quick.sh`)
**Para cambios menores sin migraciones**

```bash
./scripts/deploy-production-quick.sh
```

**Incluye:**
- ✅ Construcción local
- ✅ Subida de archivos
- ✅ Reinicio de contenedores (no rebuild completo)
- ✅ Verificación básica

**Cuándo usar:**
- Cambios en el código (sin cambios de BD)
- Actualizaciones de frontend
- Correcciones de bugs
- Cambios de configuración

### 3. **Gestión de Migraciones** (`manage-migrations.sh`)
**Para manejar migraciones específicamente**

```bash
# Verificar estado
./scripts/manage-migrations.sh check

# Ejecutar migraciones de forma segura
./scripts/manage-migrations.sh deploy

# Solo resolver problemas conocidos
./scripts/manage-migrations.sh resolve

# Resetear migraciones (solo emergencias)
./scripts/manage-migrations.sh reset
```

## 📊 Proceso de Despliegue Completo

### **Paso 1: Preparación**
```bash
# Verificar cambios pendientes
git status
git diff

# Asegurar que todo está committeado
git add .
git commit -m "Preparando despliegue a producción"
```

### **Paso 2: Ejecutar Despliegue**
```bash
# Para cambios importantes
./scripts/deploy-production-complete.sh

# Para cambios menores
./scripts/deploy-production-quick.sh
```

### **Paso 3: Verificación**
- ✅ API responde correctamente
- ✅ Frontend carga sin errores
- ✅ Base de datos conecta
- ✅ Imágenes se sirven correctamente

## 🔧 Configuración del Servidor

### **Estructura de directorios**
```
/root/apps/2025/peludosclick_app/perros/
├── backend-vlad/
│   ├── dist/           # Código compilado del backend
│   ├── prisma/         # Schema y migraciones
│   ├── public/         # Archivos estáticos
│   └── .env           # Variables de entorno
├── frontend/
│   └── dist/          # Código compilado del frontend
├── docker-compose-production.yml
└── backups/           # Backups automáticos
```

### **Variables de entorno**
- `DATABASE_URL` - Conexión a PostgreSQL
- `JWT_SECRET` - Secreto para JWT
- `BACKPORT` - Puerto del backend (3335)

## 🚨 Manejo de Errores

### **Problemas comunes y soluciones**

#### 1. **Error de migraciones**
```bash
# Verificar estado
./scripts/manage-migrations.sh check

# Resolver problemas automáticamente
./scripts/manage-migrations.sh resolve

# Ejecutar migraciones
./scripts/manage-migrations.sh deploy
```

#### 2. **Error de espacio en servidor**
```bash
# Limpiar espacio Docker
ssh root@67.205.144.228 "docker system prune -a"

# Limpiar backups antiguos
ssh root@67.205.144.228 "find /root/apps/2025/peludosclick_app/perros/backups -mtime +7 -delete"
```

#### 3. **Error de conexión a base de datos**
```bash
# Verificar contenedor PostgreSQL
ssh root@67.205.144.228 "docker ps | grep postgres"

# Reiniciar PostgreSQL si es necesario
ssh root@67.205.144.228 "cd /root/apps/2025/peludosclick_app/perros && docker-compose -f docker-compose-production.yml restart postgres"
```

### **Rollback rápido**
```bash
# Restaurar backup de base de datos
ssh root@67.205.144.228 "docker exec perros_postgres_1 psql -U postgres -d peludosclick < /path/to/backup.sql"

# Revertir a versión anterior
git checkout HEAD~1
./scripts/deploy-production-quick.sh
```

## 📈 Monitoreo y Logs

### **Ver logs en tiempo real**
```bash
# Backend
ssh root@67.205.144.228 "docker logs -f peludosclickbackend"

# Frontend
ssh root@67.205.144.228 "docker logs -f angular-frontend"

# PostgreSQL
ssh root@67.205.144.228 "docker logs -f perros_postgres_1"
```

### **Verificar salud del sistema**
```bash
# API Health
curl https://peludosclick.com/api/health

# Frontend
curl https://peludosclick.com

# Base de datos
ssh root@67.205.144.228 "docker exec peludosclickbackend npx prisma db execute --stdin <<< 'SELECT 1;'"
```

## 🔒 Seguridad

### **Backups automáticos**
- Los backups se crean automáticamente antes de cada despliegue
- Se almacenan en `/root/apps/2025/peludosclick_app/perros/backups/`
- Formato: `db_backup_YYYYMMDD_HHMMSS.sql`

### **Variables de entorno**
- Nunca committear archivos `.env` con credenciales
- Usar `.my-env-production` para configuración de producción
- Rotar secretos regularmente

## 📝 Checklist de Despliegue

### **Antes del despliegue**
- [ ] Código probado localmente
- [ ] Migraciones probadas en desarrollo
- [ ] Variables de entorno actualizadas
- [ ] Backup manual si es necesario

### **Durante el despliegue**
- [ ] Backup automático creado
- [ ] Construcción local exitosa
- [ ] Archivos subidos al servidor
- [ ] Migraciones ejecutadas
- [ ] Contenedores reiniciados

### **Después del despliegue**
- [ ] API responde correctamente
- [ ] Frontend carga sin errores
- [ ] Base de datos conecta
- [ ] Imágenes se sirven
- [ ] Logs sin errores críticos

## 🆘 Contacto y Soporte

### **En caso de emergencia**
1. **Detener despliegue**: `Ctrl+C` en el script
2. **Verificar estado**: `./scripts/manage-migrations.sh check`
3. **Rollback manual**: Restaurar backup más reciente
4. **Contactar**: Documentar el problema para análisis posterior

### **Comandos de emergencia**
```bash
# Detener todos los contenedores
ssh root@67.205.144.228 "cd /root/apps/2025/peludosclick_app/perros && docker-compose -f docker-compose-production.yml down"

# Restaurar backup
ssh root@67.205.144.228 "docker exec perros_postgres_1 psql -U postgres -d peludosclick < /path/to/backup.sql"

# Reiniciar servicios
ssh root@67.205.144.228 "cd /root/apps/2025/peludosclick_app/perros && docker-compose -f docker-compose-production.yml up -d"
```

---

**Última actualización**: Agosto 2025
**Versión**: 1.0
**Mantenido por**: Equipo de desarrollo Mi Perro QR
