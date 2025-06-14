# Reglas para limpiar Docker sin borrar la base de datos

## ❌ NUNCA usar este comando (borra todo, incluyendo la base de datos):
```bash
docker system prune -a -f --volumes
```

## ✅ Usar estos comandos seguros:

### 1. Borrar solo contenedores detenidos:
```bash
docker container prune -f
```

### 2. Borrar solo imágenes no utilizadas:
```bash
docker image prune -a -f
```

### 3. Borrar solo redes no utilizadas:
```bash
docker network prune -f
```

### 4. Para limpiar volúmenes, hacerlo manualmente y con cuidado:
```bash
# Listar volúmenes
docker volume ls

# Borrar un volumen específico (solo si es necesario)
docker volume rm NOMBRE_DEL_VOLUMEN
```

### 5. Hacer backup de la base de datos antes de cualquier limpieza:
```bash
# Backup de la base de datos
docker exec -t perros_postgres_1 pg_dump -U postgres peludosclick > backup_$(date +%Y%m%d).sql
```

## 📝 Nota:
Siempre verificar qué se está borrando antes de ejecutar cualquier comando de limpieza. 