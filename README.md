# Pitz – Reto Técnico Full Stack

Sistema de gestión de productos (CRUD) construido con Ruby on Rails (API REST) y React + TypeScript.

---

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Ruby on Rails 7.2 (modo API) |
| Base de datos | PostgreSQL 16 |
| Soft deletes | discard |
| Frontend | React 19 + TypeScript + Vite |
| CSS | TailwindCSS 4 |
| Estado / cache | TanStack React Query 5 |
| Formularios | React Hook Form 7 |
| HTTP client | Axios |
| Tests backend | RSpec + FactoryBot + Faker |
| Tests frontend | Vitest + React Testing Library + MSW |

---

## Requisitos previos

- Ruby 3.3+
- Node 18+
- PostgreSQL 16

---

## Instalación y puesta en marcha

### Opción A — Docker (recomendado)

```bash
git clone <repo-url>
cd pitz-reto

# Levantar backend, frontend y PostgreSQL con un solo comando
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001/api/v1 |
| PostgreSQL | localhost:5432 |

En la primera ejecución hay que crear la base de datos y correr las migraciones:

```bash
docker compose exec backend rails db:create db:migrate db:seed
```

Para detener todos los servicios:

```bash
docker compose down
```

---

### Opción B — Instalación local

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd pitz-reto
```

### 2. Backend

```bash
cd backend

# Instalar dependencias
bundle install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL si es necesario

# Crear base de datos y correr migraciones
rails db:create db:migrate

# Cargar datos de ejemplo
rails db:seed

# Iniciar servidor (puerto 3001)
rails server -p 3001
```

> La API quedará disponible en `http://localhost:3001/api/v1`

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo (puerto 5173)
npm run dev
```

> La aplicación quedará disponible en `http://localhost:5173`

---

## Variables de entorno

### Backend (`backend/.env`)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=           # usuario de PostgreSQL (por defecto el usuario del sistema)
DB_PASSWORD=           # dejar vacío si no tienes contraseña
DB_NAME=pitz_development
DB_NAME_TEST=pitz_test
FRONTEND_URL=http://localhost:5173
RAILS_MAX_THREADS=5
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001/api/v1
```

---

## Tests

### Backend

```bash
cd backend

# Correr toda la suite
bundle exec rspec

# Con formato detallado
bundle exec rspec --format documentation
```

**Resultado esperado:** 62 ejemplos, 0 fallos

| Suite | Tests |
|---|---|
| Validaciones del modelo | 26 |
| Scopes (`active_products`, `inactive_products`, `by_status`, `search_by_name`) | 7 |
| Soft delete (discard / undiscard / SKU reutilizable) | 6 |
| API endpoints (index, show, create, update, destroy, restore) | 23 |

### Frontend

```bash
cd frontend

# Correr toda la suite
npm test

# Modo watch (desarrollo)
npm run test:watch

# Con reporte de cobertura
npm run test:coverage
```

**Resultado esperado:** 36 ejemplos, 0 fallos

| Suite | Tests |
|---|---|
| `services/api.test.ts` | 10 |
| `hooks/useProducts.test.tsx` | 5 |
| `components/Toast.test.tsx` | 5 |
| `components/ProductForm.test.tsx` | 16 |

---

## API Reference

Base URL: `http://localhost:3001/api/v1`

### Listar productos

```
GET /products
```

| Parámetro | Tipo | Descripción |
|---|---|---|
| `page` | integer | Número de página (default: 1) |
| `per_page` | integer | Items por página (default: 10, max: 100) |
| `search` | string | Buscar por nombre (case insensitive) |
| `status` | string | Filtrar por `active` o `inactive` |

**Respuesta:**
```json
{
  "products": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total_count": 15,
    "total_pages": 2,
    "next_page": 2,
    "prev_page": null
  }
}
```

### Obtener producto

```
GET /products/:id
```

### Crear producto

```
POST /products
Content-Type: application/json

{
  "product": {
    "name": "Laptop Pro",
    "description": "Descripción opcional",
    "price": 999.99,
    "stock": 10,
    "sku": "LAP001",
    "active": true
  }
}
```

### Actualizar producto

```
PUT /products/:id
```

### Eliminar producto (soft delete)

```
DELETE /products/:id
```

No elimina el registro de la base de datos. Setea `discarded_at` con la fecha y hora actual. El producto desaparece de todos los listados pero puede recuperarse.

### Restaurar producto eliminado

```
PUT /products/:id/restore
```

Limpia el campo `discarded_at` y hace visible el producto nuevamente. Retorna `422` si el producto no estaba eliminado.

---

## Modelo de datos

| Campo | Tipo | Requerido | Validaciones |
|---|---|---|---|
| `name` | string | Sí | mínimo 3, máximo 100 caracteres |
| `description` | text | No | máximo 1000 caracteres |
| `price` | decimal | Sí | mayor a 0 |
| `stock` | integer | Sí | mayor o igual a 0, entero |
| `sku` | string | Sí | único entre activos, solo `[A-Z0-9]` |
| `active` | boolean | Sí | default: `true` |
| `discarded_at` | datetime | — | `null` = visible, con fecha = eliminado |

---

## Decisiones técnicas

### Rails 7.2 en lugar de Rails 8.1
Rails 8.1 tiene un bug de compatibilidad con Ruby 3.3.0 en la gem `actionview` (anonymous rest parameter en bloques). Rails 7.2 es la versión LTS estable que soporta correctamente Ruby 3.3.x y tiene todas las funcionalidades requeridas.

### Paginación manual en lugar de Pagy
Pagy 43.x (versión actual) tiene una API completamente diferente a las versiones anteriores documentadas. Para evitar deuda técnica con una librería en transición, se implementó paginación manual con `.limit().offset()` directamente en un Concern reutilizable (`Paginatable`). La solución es simple, bien testeada y sin dependencias externas.

### Soft deletes con `discard` en lugar de `paranoia`
`discard` es la alternativa moderna a `paranoia`: no hace monkey-patching de ActiveRecord, expone métodos explícitos (`discard`, `undiscard`, `discarded?`) y permite mayor control. Se usa `default_scope -> { kept }` para excluir eliminados de todos los queries automáticamente. La validación de unicidad de SKU usa `conditions: -> { kept }` para permitir reutilizar el SKU de un producto eliminado.

### Concern `Paginatable`
La lógica de paginación vive en `app/controllers/concerns/paginatable.rb` en lugar de `ApplicationController`, respetando la separación de responsabilidades de Rails.

### `rescue_from` en ApplicationController
El manejo de `ActiveRecord::RecordNotFound` y `ActionController::ParameterMissing` está centralizado en `ApplicationController` con `rescue_from`, siguiendo la convención Rails en lugar de rescues inline en cada acción.

### Docker Compose para desarrollo
Tres servicios orquestados: `postgres:16`, backend Rails y frontend Vite. Los volúmenes montan el código fuente en el contenedor para que los cambios se reflejen en caliente sin reconstruir la imagen. `bundle_cache` y `node_modules` son volúmenes separados para evitar que el bind mount del host los sobreescriba. El servicio de postgres incluye un healthcheck para que el backend solo arranque cuando la base de datos está lista.

### TanStack React Query
Gestiona el cache del servidor, estados de loading/error y la invalidación automática al mutar datos. Evita estado global innecesario (Redux, Zustand) para un CRUD de esta escala.

### React Hook Form
Validación de formularios en tiempo real con muy bajo re-render. Maneja estado del formulario de forma eficiente con uncontrolled inputs, lo que mejora el rendimiento.

### TailwindCSS 4 con plugin de Vite
La nueva versión de Tailwind no requiere archivo de configuración `tailwind.config.js`. La integración via `@tailwindcss/vite` es directa y el CSS resultante (~18KB gzipped) es minimal.

### MSW (Mock Service Worker) para tests del frontend
En lugar de mockear módulos de axios/fetch, MSW intercepta las peticiones HTTP a nivel de red. Esto hace los tests más realistas y desacoplados de la implementación del cliente HTTP.

### CORS configurado por variable de entorno
`FRONTEND_URL` en el `.env` permite cambiar el origen permitido sin tocar código, facilitando el despliegue en diferentes entornos.

---

## Estructura del proyecto

```
pitz-reto/
├── docker-compose.yml                     # orquesta postgres, backend y frontend
├── docs/
│   └── openapi.yml                        # especificación OpenAPI 3.0
├── backend/
│   ├── Dockerfile
│   ├── app/
│   │   ├── controllers/
│   │   │   ├── concerns/paginatable.rb        # concern de paginación
│   │   │   ├── application_controller.rb      # rescue_from centralizado
│   │   │   └── api/v1/products_controller.rb  # CRUD + restore
│   │   └── models/
│   │       └── product.rb                     # validaciones + scopes + soft delete
│   ├── config/
│   │   ├── database.yml                       # usa variables de entorno
│   │   ├── routes.rb                          # resources + restore member route
│   │   └── initializers/cors.rb
│   ├── db/
│   │   ├── migrate/                           # products + discarded_at
│   │   └── seeds.rb                           # 15 productos de ejemplo
│   └── spec/
│       ├── factories/products.rb
│       ├── models/product_spec.rb             # 39 tests
│       └── requests/api/v1/products_spec.rb   # 23 tests
└── frontend/
    ├── Dockerfile
    └── src/
        ├── types/product.ts                   # interfaces TypeScript
        ├── services/api.ts                    # cliente Axios
        ├── hooks/useProducts.ts               # React Query hooks
        ├── components/
        │   ├── ProductList.tsx                # tabla + búsqueda + filtros + paginación
        │   ├── ProductForm.tsx                # modal crear/editar
        │   └── Toast.tsx                      # notificaciones
        └── test/
            ├── setup.ts                       # configuración global
            ├── server.ts                      # MSW server
            ├── handlers.ts                    # MSW request handlers
            ├── factories.ts                   # builders de datos de prueba
            ├── utils.tsx                      # render con providers
            ├── services/api.test.ts           # 10 tests
            ├── hooks/useProducts.test.tsx     # 5 tests
            └── components/
                ├── Toast.test.tsx             # 5 tests
                └── ProductForm.test.tsx       # 16 tests
```

---

## Mejoras futuras

Con más tiempo implementaría:

1. **Optimistic updates** — actualizar la UI antes de que el servidor responda para mejor UX percibida.
2. **Restaurar desde el frontend** — botón de "Restaurar" accesible para productos eliminados.
3. **Ordenamiento** — columnas clicables en la tabla para ordenar por nombre, precio, stock, etc.
4. **Deploy** — Railway para el backend (Rails + PostgreSQL) y Vercel para el frontend.
