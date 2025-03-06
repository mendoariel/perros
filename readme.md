
docker network create web

docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $PWD/traefik.toml:/traefik.toml \
  -v $PWD/traefik_dynamic.toml:/traefik_dynamic.toml \
  -v $PWD/acme.json:/acme.json \
  -p 80:80 \
  -p 443:443 \
  --network web \
  --name traefik \
  traefik:v2.2

fallow this guide
https://www.digitalocean.com/community/tutorials/how-to-use-traefik-v2-as-a-reverse-proxy-for-docker-containers-on-ubuntu-20-04


Docker some command to delete all information

To delete all containers including its volumes use,

docker rm -vf $(docker ps -aq)

remove all images
docker rmi -f $(docker images -aq)

To delete all

docker system prune -a --volumes

En el caso de restauracion de la base de datos, los contenedores que esten linqueados a la aplicacion deben estar parados


Eliminar todas las bases de datos que tenga el contenedor



COMANDO PARA COPIAR LA DB A UN ARCHIVO DESDE UN CONTENEDOR DOCKER CORRIENDO
docker exec container_name pg_dumpall -U dabase_user > /home/albert/backup/dabase_name.sql 

Este comando nos genera un archivo con el nombre que especificamos

COMANDO STOP CONTAINER
docker stop container_name


COMANDO PARA INGRESAR A LA CONSOLA DE POSTGRES

docker exec -it container_name psql -U user_name 



COMANDO LISTAR BASES DE DATOS DENTRO DE LA CONSOLA POSTGRES
\l 

COMANDO PARA SALIR DE LA CONSOLA DE POSTGRES
\q

COMANDO PARA ELEMINAR BASES DE DATOS CORRIENDO EN UN CONTENDOR DOCKER
docker exec -it container_name dropdb -U user_name database_name

COMANDO PARA CREAR UNA BASE DE DATOS EN CONTENEDOR DOCKER
docker exec -it container_name createdb -U user_name dabase_name

COMANDO PARA VER TABLAS DENTRO DE LA CONSOLA DE POSTGRES
\dt

COMANDO PARA RESTAURAR BASE DE DATOS DESDE UN ARCHIVO BACKUP EN CONTENDOR DOCKER CORRIENDO

cat /home/albert/backup/database_name.sql | docker exec -i container_name psql -U username -d database_name
