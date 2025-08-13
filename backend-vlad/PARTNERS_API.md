# Partners API Documentation

Esta API permite gestionar partners (socios comerciales) que pueden ofrecer artículos, servicios, ofertas y recibir comentarios de usuarios.

## Estructura de Datos

### Partner
- **id**: ID único del partner
- **name**: Nombre del partner
- **address**: Dirección física
- **whatsapp**: Número de WhatsApp (opcional)
- **phone**: Número de teléfono (opcional)
- **description**: Descripción del partner (opcional)
- **website**: Sitio web (opcional)
- **partnerType**: Tipo de partner (VETERINARY, PET_SHOP, MINIMARKET, CAFETERIA)
- **status**: Estado del partner (ACTIVE, INACTIVE, PENDING)
- **createdAt**: Fecha de creación
- **updatedAt**: Fecha de última actualización

### Article
- **id**: ID único del artículo
- **name**: Nombre del artículo
- **description**: Descripción (opcional)
- **price**: Precio
- **image**: URL de la imagen (opcional)
- **partnerId**: ID del partner al que pertenece

### Service
- **id**: ID único del servicio
- **name**: Nombre del servicio
- **description**: Descripción (opcional)
- **price**: Precio (opcional)
- **partnerId**: ID del partner al que pertenece

### Offer
- **id**: ID único de la oferta
- **title**: Título de la oferta
- **description**: Descripción (opcional)
- **discount**: Porcentaje de descuento
- **startDate**: Fecha de inicio
- **endDate**: Fecha de fin
- **partnerId**: ID del partner al que pertenece

### Comment
- **id**: ID único del comentario
- **content**: Contenido del comentario
- **rating**: Calificación (1-5, opcional)
- **authorName**: Nombre del autor
- **authorEmail**: Email del autor (opcional)
- **partnerId**: ID del partner al que pertenece

### Catalog
- **id**: ID único del catálogo
- **name**: Nombre del catálogo
- **description**: Descripción (opcional)
- **partnerId**: ID del partner (relación 1:1)

## Endpoints

### Partners

#### Crear un partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Veterinaria Central",
  "address": "Av. Principal 123",
  "whatsapp": "+1234567890",
  "phone": "+1234567890",
  "description": "Veterinaria especializada en mascotas",
  "website": "https://veterinariacentral.com",
  "partnerType": "VETERINARY"
}
```

#### Obtener todos los partners
```http
GET /partners
```

#### Buscar partners
```http
GET /partners/search?q=veterinaria
```

#### Obtener partners por tipo
```http
GET /partners/type/VETERINARY
```

#### Obtener un partner específico
```http
GET /partners/1
```

#### Obtener estadísticas de un partner
```http
GET /partners/1/stats
```

#### Actualizar un partner
```http
PATCH /partners/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Veterinaria Central Actualizada",
  "description": "Nueva descripción"
}
```

#### Actualizar estado de un partner
```http
PATCH /partners/1/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "INACTIVE"
}
```

#### Eliminar un partner
```http
DELETE /partners/1
Authorization: Bearer <token>
```

### Articles

#### Crear un artículo
```http
POST /partners/1/articles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Collar para perro",
  "description": "Collar de cuero resistente",
  "price": 25.99,
  "image": "https://example.com/collar.jpg"
}
```

#### Obtener artículos de un partner
```http
GET /partners/1/articles
```

#### Actualizar un artículo
```http
PATCH /partners/1/articles/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 29.99
}
```

#### Eliminar un artículo
```http
DELETE /partners/1/articles/1
Authorization: Bearer <token>
```

### Services

#### Crear un servicio
```http
POST /partners/1/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Consulta veterinaria",
  "description": "Consulta general para mascotas",
  "price": 50.00
}
```

#### Obtener servicios de un partner
```http
GET /partners/1/services
```

#### Actualizar un servicio
```http
PATCH /partners/1/services/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 45.00
}
```

#### Eliminar un servicio
```http
DELETE /partners/1/services/1
Authorization: Bearer <token>
```

### Offers

#### Crear una oferta
```http
POST /partners/1/offers
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Descuento en vacunas",
  "description": "20% de descuento en todas las vacunas",
  "discount": 20.0,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}
```

#### Obtener ofertas de un partner
```http
GET /partners/1/offers
```

#### Obtener ofertas activas de un partner
```http
GET /partners/1/offers/active
```

#### Actualizar una oferta
```http
PATCH /partners/1/offers/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "discount": 25.0
}
```

#### Eliminar una oferta
```http
DELETE /partners/1/offers/1
Authorization: Bearer <token>
```

### Comments

#### Crear un comentario
```http
POST /partners/1/comments
Content-Type: application/json

{
  "content": "Excelente servicio, muy profesionales",
  "rating": 5,
  "authorName": "Juan Pérez",
  "authorEmail": "juan@example.com"
}
```

#### Obtener comentarios de un partner
```http
GET /partners/1/comments
```

#### Eliminar un comentario
```http
DELETE /partners/1/comments/1
Authorization: Bearer <token>
```

### Catalogs

#### Crear un catálogo
```http
POST /partners/1/catalog
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Catálogo Principal",
  "description": "Nuestros productos y servicios"
}
```

#### Obtener catálogo de un partner
```http
GET /partners/1/catalog
```

#### Actualizar un catálogo
```http
PATCH /partners/1/catalog
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Catálogo Actualizado",
  "description": "Nueva descripción del catálogo"
}
```

## Tipos de Partner

- **VETERINARY**: Veterinarias
- **PET_SHOP**: Tiendas de mascotas
- **MINIMARKET**: Minimercados
- **CAFETERIA**: Cafeterías

## Estados de Partner

- **ACTIVE**: Activo
- **INACTIVE**: Inactivo
- **PENDING**: Pendiente

## Autenticación

La mayoría de endpoints requieren autenticación mediante JWT token en el header `Authorization: Bearer <token>`.

Los endpoints públicos (sin autenticación) son:
- `GET /partners` - Listar partners
- `GET /partners/search` - Buscar partners
- `GET /partners/type/:type` - Partners por tipo
- `GET /partners/:id` - Ver partner específico
- `GET /partners/:id/articles` - Artículos de un partner
- `GET /partners/:id/services` - Servicios de un partner
- `GET /partners/:id/offers` - Ofertas de un partner
- `GET /partners/:id/offers/active` - Ofertas activas
- `GET /partners/:id/comments` - Comentarios de un partner
- `GET /partners/:id/catalog` - Catálogo de un partner
- `POST /partners/:id/comments` - Crear comentario

## Respuestas de Error

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Start date must be before end date",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Partner with ID 1 not found",
  "error": "Not Found"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Ejemplos de Uso

### Crear un partner veterinario completo

1. Crear el partner:
```http
POST /partners
{
  "name": "Veterinaria Happy Pets",
  "address": "Calle 123 #45-67",
  "whatsapp": "+573001234567",
  "phone": "+573001234567",
  "description": "Veterinaria especializada en perros y gatos",
  "website": "https://happypets.com",
  "partnerType": "VETERINARY"
}
```

2. Agregar artículos:
```http
POST /partners/1/articles
{
  "name": "Vacuna Triple Felina",
  "description": "Vacuna contra calicivirus, herpesvirus y panleucopenia",
  "price": 45.00,
  "image": "https://example.com/vacuna.jpg"
}
```

3. Agregar servicios:
```http
POST /partners/1/services
{
  "name": "Consulta General",
  "description": "Consulta veterinaria general para mascotas",
  "price": 35.00
}
```

4. Crear una oferta:
```http
POST /partners/1/offers
{
  "title": "Descuento en Vacunas",
  "description": "15% de descuento en todas las vacunas",
  "discount": 15.0,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}
```

5. Crear catálogo:
```http
POST /partners/1/catalog
{
  "name": "Catálogo Happy Pets",
  "description": "Productos y servicios veterinarios"
}
```

6. Un usuario puede dejar un comentario:
```http
POST /partners/1/comments
{
  "content": "Excelente atención, muy profesionales",
  "rating": 5,
  "authorName": "María García",
  "authorEmail": "maria@example.com"
}
``` 