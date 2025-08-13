# 🚀 Plan de Despliegue a Producción - Backend Vlad

## 📋 Resumen Ejecutivo

Este documento describe el plan completo y seguro para desplegar el backend-vlad a producción, incluyendo migraciones de base de datos, verificaciones de seguridad y procedimientos de rollback.

## ⚠️ ADVERTENCIAS IMPORTANTES

- **SIEMPRE** hacer backup antes de cualquier cambio
- **NUNCA** aplicar migraciones directamente sin probar
- **VERIFICAR** cada paso antes de continuar
- **TENER** un plan de rollback listo

## 🎯 Objetivos del Despliegue

1. ✅ Aplicar todas las migraciones pendientes de forma segura
2. ✅ Desplegar el código actualizado sin interrumpir el servicio
3. ✅ Verificar que todas las funcionalidades críticas funcionen
4. ✅ Mantener la integridad de los datos existentes

## 📊 Estado Actual

### Base de Datos de Producción
- **Host**: postgres (Docker)
- **Puerto**: 5432
- **Base de datos**: peludosclick
- **Schema**: public
- **Migraciones aplicadas**: 30+ migraciones

### Tablas Críticas
- `users` - Usuarios del sistema
- `medals` - Medallas registradas
- `virgin_medals` - Medallas virgin para QR
- `partners` - Partners del sistema
- `medal_fronts` - Frentes de medallas personalizados

## 🔄 FASE 1: Preparación (DÍA 1)

### 1.1 Backup Completo de Producción

```bash
# Conectar al servidor de producción
ssh usuario@servidor-produccion

# Crear backup completo
pg_dump -h postgres -U Silvestre1993 -d peludosclick > backup_produccion_$(date +%Y%m%d_%H%M%S).sql

# Verificar que el backup se creó correctamente
ls -la backup_produccion_*.sql
```

### 1.2 Verificar Estado Actual

```bash
# En el servidor de producción
cd /ruta/al/backend-vlad

# Verificar migraciones aplicadas
npx prisma migrate status

# Verificar conexión a la base de datos
npx prisma db pull --force
```

### 1.3 Crear Entorno de Staging (Recomendado)

```bash
# Crear base de datos de staging
createdb peludosclick_staging

# Restaurar backup de producción en staging
psql -h postgres -U Silvestre1993 -d peludosclick_staging < backup_produccion_YYYYMMDD_HHMMSS.sql

# Configurar variables de entorno para staging
export DATABASE_URL="postgres://Silvestre1993:iendlshLANDHG423423480@postgres:5432/peludosclick_staging?schema=public"
```

## 🔄 FASE 2: Testing en Staging (DÍA 1-2)

### 2.1 Probar Migraciones en Staging

```bash
# Cambiar a la base de datos de staging
export DATABASE_URL="postgres://Silvestre1993:iendlshLANDHG423423480@postgres:5432/peludosclick_staging?schema=public"

# Verificar estado actual
npx prisma migrate status

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Verificar que todo funciona
npx prisma generate
npm run build
npm run start:prod
```

### 2.2 Verificar Funcionalidades Críticas

- [ ] Login del dashboard
- [ ] Creación de medallas virgin
- [ ] Generación de QR codes
- [ ] Gestión de partners
- [ ] API endpoints principales

### 2.3 Verificar Integridad de Datos

```bash
# Verificar que las tablas principales tienen datos
npx prisma studio

# O usar queries directas
psql -h postgres -U Silvestre1993 -d peludosclick_staging -c "SELECT COUNT(*) FROM users;"
psql -h postgres -U Silvestre1993 -d peludosclick_staging -c "SELECT COUNT(*) FROM virgin_medals;"
psql -h postgres -U Silvestre1993 -d peludosclick_staging -c "SELECT COUNT(*) FROM partners;"
```

## 🔄 FASE 3: Despliegue a Producción (DÍA 2)

### 3.1 Preparar el Despliegue

```bash
# Conectar al servidor de producción
ssh usuario@servidor-produccion

# Ir al directorio del proyecto
cd /ruta/al/backend-vlad

# Hacer el script ejecutable
chmod +x scripts/safe-production-deploy.sh
```

### 3.2 Ejecutar Despliegue Seguro

```bash
# Ejecutar el script de despliegue seguro
./scripts/safe-production-deploy.sh
```

**El script automáticamente:**
1. ✅ Crea backup de la base de datos
2. ✅ Verifica el estado actual
3. ✅ Valida el schema
4. ✅ Aplica migraciones pendientes
5. ✅ Verifica integridad
6. ✅ Construye la aplicación
7. ✅ Despliega la aplicación
8. ✅ Verifica post-despliegue

### 3.3 Verificación Manual Post-Despliegue

```bash
# Verificar que la aplicación responde
curl -f http://localhost:3335/health

# Verificar logs de la aplicación
pm2 logs backend-vlad

# Verificar estado de migraciones
npx prisma migrate status
```

## 🔄 FASE 4: Monitoreo (DÍA 2-7)

### 4.1 Verificaciones Inmediatas (Primeras 2 horas)

- [ ] La aplicación responde correctamente
- [ ] Los endpoints críticos funcionan
- [ ] No hay errores en los logs
- [ ] La base de datos está accesible

### 4.2 Verificaciones Diarias (Días 2-7)

- [ ] Monitorear logs de errores
- [ ] Verificar rendimiento de la aplicación
- [ ] Confirmar que las funcionalidades críticas funcionan
- [ ] Verificar integridad de datos

### 4.3 Métricas a Monitorear

- **Tiempo de respuesta** de la API
- **Tasa de errores** en los endpoints
- **Uso de memoria** y CPU
- **Conexiones a la base de datos**
- **Logs de errores**

## 🚨 PROCEDIMIENTO DE ROLLBACK

### Si algo sale mal durante el despliegue:

```bash
# 1. Detener la aplicación
pm2 stop backend-vlad

# 2. Restaurar backup
psql -h postgres -U Silvestre1993 -d peludosclick < backup_produccion_YYYYMMDD_HHMMSS.sql

# 3. Revertir migraciones si es necesario
npx prisma migrate reset --force

# 4. Reiniciar aplicación con versión anterior
pm2 start backend-vlad
```

### Si hay problemas después del despliegue:

```bash
# 1. Verificar logs
pm2 logs backend-vlad

# 2. Verificar estado de la base de datos
npx prisma migrate status

# 3. Verificar conectividad
npx prisma db pull --force

# 4. Si es necesario, restaurar backup
psql -h postgres -U Silvestre1993 -d peludosclick < backup_produccion_YYYYMMDD_HHMMSS.sql
```

## 📋 Checklist de Despliegue

### Antes del Despliegue
- [ ] Backup completo de producción creado
- [ ] Testing en staging completado
- [ ] Scripts de despliegue preparados
- [ ] Equipo notificado del mantenimiento
- [ ] Ventana de mantenimiento programada

### Durante el Despliegue
- [ ] Backup verificado
- [ ] Migraciones aplicadas exitosamente
- [ ] Aplicación construida correctamente
- [ ] Aplicación desplegada
- [ ] Verificaciones post-despliegue completadas

### Después del Despliegue
- [ ] Funcionalidades críticas verificadas
- [ ] Logs monitoreados
- [ ] Equipo notificado del éxito
- [ ] Documentación actualizada

## 🔧 Comandos Útiles

### Verificar Estado
```bash
# Estado de migraciones
npx prisma migrate status

# Estado de la aplicación
pm2 status

# Logs de la aplicación
pm2 logs backend-vlad

# Verificar conectividad a la DB
npx prisma db pull --force
```

### Backup y Restore
```bash
# Crear backup
pg_dump -h postgres -U Silvestre1993 -d peludosclick > backup.sql

# Restaurar backup
psql -h postgres -U Silvestre1993 -d peludosclick < backup.sql
```

### Gestión de la Aplicación
```bash
# Reiniciar aplicación
pm2 restart backend-vlad

# Ver logs en tiempo real
pm2 logs backend-vlad --lines 100

# Ver información de la aplicación
pm2 show backend-vlad
```

## 📞 Contactos de Emergencia

- **Desarrollador Principal**: [Tu contacto]
- **DevOps**: [Contacto DevOps]
- **DBA**: [Contacto DBA]
- **Soporte**: [Contacto Soporte]

## 📝 Notas Importantes

1. **Siempre** hacer backup antes de cualquier cambio
2. **Nunca** aplicar migraciones sin probar en staging
3. **Verificar** cada paso antes de continuar
4. **Documentar** cualquier problema encontrado
5. **Monitorear** la aplicación después del despliegue

## 🎯 Criterios de Éxito

- [ ] Todas las migraciones aplicadas exitosamente
- [ ] Aplicación funcionando sin errores
- [ ] Todas las funcionalidades críticas operativas
- [ ] Rendimiento dentro de parámetros normales
- [ ] Sin pérdida de datos

---

**Fecha de creación**: $(date)
**Versión**: 1.0
**Autor**: Sistema de Despliegue
