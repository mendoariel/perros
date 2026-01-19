# 📦 Revisión de Backups - Preparación para Refactorización

**Fecha**: 2026-01-12  
**Motivo**: Revisar backups existentes antes de refactorización del sistema de medallas

---

## 🔍 Script para Revisar Backups de Producción

He creado un script que puedes ejecutar para revisar los backups de producción:

```bash
./scripts/check-production-backups.sh
```

Este script:
- ✅ Se conecta al servidor de producción (67.205.144.228)
- ✅ Lista los últimos backups de base de datos
- ✅ Lista los últimos backups de imágenes/archivos
- ✅ Muestra estadísticas y resumen
- ❌ **NO crea nuevos backups**, solo revisa los existentes

---

## 📋 Backups Locales Encontrados

### Backups de Base de Datos Locales

Según la estructura del proyecto, los backups locales se encuentran en:
- `./backups/backup_*.sql.gz` - Backups automáticos diarios
- `./backups/pre_deployment_*/database_backup.sql.gz` - Backups antes de despliegues
- `./backups/production_data/*/peludosclick_backup_*.sql` - Backups de producción descargados

**Último backup local encontrado**:
- `./backup_local_20250829_120319.sql` (29 de agosto de 2025)

### Backups de Imágenes Locales

- `./backups/pre_refactor_medals_20260112_142724/photos_backup.tar.gz` (80MB, 103 archivos) - **Creado hoy**
- `./backups/pre_deployment_*/photos_backup.tar.gz` - Backups antes de despliegues
- `./backups/production_data/*/peludosclick_files_*.tar.gz` - Backups de producción descargados

---

## 🗄️ Backups en Producción (Revisar con el script)

Para revisar los backups de producción, ejecuta:

```bash
./scripts/check-production-backups.sh
```

El script buscará en:
- `/root/apps/2025/peludosclick_app/perros/backups/`
- Subdirectorios `pre_deployment_*`
- Subdirectorios `production_data/*`

---

## 📊 Información de Backups Automáticos

Según `backups/backup.sh`:
- **Frecuencia**: Backups automáticos diarios
- **Retención**: 30 días
- **Formato**: `backup_YYYYMMDD_HHMMSS.sql.gz`
- **Ubicación**: `./backups/`

---

## ✅ Checklist de Revisión

Antes de comenzar la refactorización, verifica:

- [ ] Ejecutar `./scripts/check-production-backups.sh` para ver backups de producción
- [ ] Verificar que existe al menos un backup reciente de base de datos
- [ ] Verificar que existe al menos un backup reciente de imágenes
- [ ] Anotar las fechas y ubicaciones de los backups más recientes
- [ ] Confirmar que los backups son accesibles y no están corruptos

---

## 🎯 Próximos Pasos

1. **Ejecutar el script de revisión**:
   ```bash
   ./scripts/check-production-backups.sh
   ```

2. **Anotar los backups más recientes**:
   - Último backup de BD: `[fecha y ubicación]`
   - Último backup de imágenes: `[fecha y ubicación]`

3. **Confirmar que son suficientes** antes de comenzar la refactorización

4. **Si es necesario**, crear un backup adicional con:
   ```bash
   ./scripts/backup-production-before-medal-refactor.sh
   ```

---

## 📝 Notas

- Los backups locales son del workspace local
- Los backups de producción están en el servidor remoto
- El script de revisión **NO modifica nada**, solo lee información
- Si necesitas descargar un backup de producción, puedes usar `scp` después de identificar su ubicación

