
,c
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
docker exec -it 8d pg_dumpall --inserts -c -U postgres > dump_$(date +%Y-%m-%d_%H_%M_%S).sql

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


Page to appoint the qr medals

http:/localhost:4200/mascota-checking?medalString=andrea
https:/peludosclick.com/mascota-checking?medalString=pelusa
http:/localhost:4200/mascota-checking?medalString=chicho

insert into virgin_medals ("medal_string", "status", "register_hash") values ('pumita', 'VIRGIN', 'hash');

Shift + Alt + F

START PRISMA DOCUMENTATION
how i can create element array into relationship entitys
I understand you're asking about creating array relationships between entities in Prisma. Let me explain how to handle this.
In Prisma, you can create array relationships (one-to-many or many-to-many) between entities using relation fields. Here's how you can implement this:
One-to-Many Relationships
For a one-to-many relationship (where one entity has many related entities), you define an array field on the "one" side:

model User {
  id    Int    @id @default(autoincrement())
  posts Post[] // One user has many posts
}

model Post {
  id       Int  @id @default(autoincrement())
  author   User @relation(fields: [authorId], references: [id])
  authorId Int  // Relation scalar field
}
Many-to-Many Relationships
For many-to-many relationships, Prisma offers two approaches:
1. Implicit Many-to-Many

model User {
  id    Int    @id @default(autoincrement())
  posts Post[] // A user can have many posts
}

model Post {
  id     Int    @id @default(autoincrement())
  users  User[] // A post can have many users
}
In this case, Prisma automatically manages the relation table under the hood Fullstack App With TypeScript, PostgreSQL, Next.js, Prisma & GraphQL: Data Modeling.
2. Explicit Many-to-Many (with additional data)
If you need to store additional information about the relationship (like quantity in an order):

model Order {
  id        Int          @id @default(autoincrement())
  foodItems FoodOrders[]
}

model Food {
  id     Int          @id @default(autoincrement())
  orders FoodOrders[]
}

model FoodOrders {
  id       Int    @id @default(autoincrement())
  quantity Int?   @default(1)
  order    Order? @relation(fields: [orderId], references: [id])
  orderId  Int?
  food     Food?  @relation(fields: [foodId], references: [id])
  foodId   Int?
}
This approach is useful when you need to store additional data about the relationship Need suggestions for restaurant menu and food order.
Creating Related Records
To create records with relationships, you can use nested writes:

// Create a user with multiple posts
const user = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    posts: {
      create: [
        { title: 'This is my first post' },
        { title: 'Here comes a second post' }
      ]
    }
  }
});
For many-to-many relationships with connectOrCreate:

const result = await prisma.books.create({
  data: {
    title: "Book Title",
    author: "Author Name",
    genre: {
      connectOrCreate: [
        { create: { name: 'genre1' }, where: { name: 'genre1' } },
        { create: { name: 'genre2' }, where: { name: 'genre2' } }
      ]
    },
    user: { connect: { id: userId }}
  },
  include: {
    genre: true
  }
});
This approach allows you to either connect to existing records or create new ones if they don't exist How to handle arrays?.


ssh root@67.205.144.228

start convert files utf8

$ file yourfilename
yourfilename: UTF-8 Unicode English text
iconv -f original_charset -t utf-8 originalfile > newfile


npm install 
@angular/cdk @fortawesome/angular-fontawesome@0.13.0  
@fortawesome/fontawesome-svg-core 
@fortawesome/free-brands-svg-icons 
@fortawesome/free-solid-svg-icons