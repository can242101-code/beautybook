# BeautyBook

Plataforma web de agendamiento de citas para consultorios dentales.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 + Bootstrap 5.3 |
| Backend | Laravel 12 + PHP 8.2 |
| Base de datos | PostgreSQL 16 |
| Caché | Memurai / Redis |

## Requisitos previos

- PHP 8.2 (XAMPP)
- Composer 2.x
- Node.js 22 + npm
- PostgreSQL 16 corriendo en puerto 5432
- Memurai corriendo en puerto 6379

## Cómo levantar el backend

```bash
cd beautybook-backend

# 1. Instalar dependencias
composer install

# 2. Crear base de datos en PostgreSQL
# psql -U postgres -c "CREATE DATABASE beautybook_db;"

# 3. Configurar variables de entorno
copy .env.example .env
# Editar .env: DB_PASSWORD, REDIS_CLIENT=predis, FRONTEND_URL=http://localhost:3000

# 4. Generar clave de la app
php artisan key:generate

# 5. Ejecutar migraciones y seeders
php artisan migrate:fresh --seed

# 6. Iniciar servidor
php artisan serve
```

El backend queda disponible en `http://localhost:8000`.

## Cómo levantar el frontend

```bash
cd beautybook-frontend

# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

El frontend queda disponible en `http://localhost:3000`.

## Cuentas de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Gestor (admin) | gestor@beautybook.com | Gestor1234! |
| Paciente | demo_pac@beautybook.com | Demo1234! |
| Consultorio | demo_cons@beautybook.com | Demo1234! |

## Ejecutar tests

```bash
# Backend — PHPUnit (11 tests, 47 assertions)
cd beautybook-backend
php artisan test

# Frontend — Cypress E2E
cd beautybook-frontend
npm run cypress:open
```

## Estructura del proyecto

```
artefacto/
├── beautybook-backend/   # Laravel 12 API REST
│   ├── app/
│   │   ├── Http/Controllers/Api/   # Controladores por recurso
│   │   ├── Events/                 # Observer: NuevaCitaRegistrada, CitaCancelada
│   │   ├── Listeners/              # Manejadores de eventos
│   │   ├── Repositories/           # Patrón Repository
│   │   └── Services/Notifications/ # Patrón Strategy (Email / WhatsApp)
│   ├── database/migrations/
│   └── tests/
│       ├── Feature/CitaTest.php         # CV01–CV05
│       └── Unit/MembreciaVigenciaTest.php
└── beautybook-frontend/  # Next.js 16
    ├── app/
    │   ├── paciente/     # Buscar, agendar, mis citas, perfil
    │   ├── consultorio/  # Agenda, tratamientos, horarios, estadísticas
    │   └── admin/        # Gestión de consultorios y membrecías
    ├── components/ui/    # AppModal, AppBadge, AppAlert, LoadingSpinner…
    ├── lib/
    │   ├── api.js        # Cliente HTTP centralizado con Bearer token
    │   ├── utils.js      # Utilidades de fecha compartidas
    │   └── constants.js  # ESTADO_COLOR, DIAS_ORDEN…
    └── cypress/e2e/      # Tests E2E por flujo de rol
```

## Patrones de diseño implementados

- **Observer** — `NuevaCitaRegistrada` y `CitaCancelada` disparan notificaciones automáticas
- **Strategy** — `NotificacionFactory` selecciona `EmailNotificacion` o `WhatsAppNotificacion` según el plan
- **Repository** — `BaseRepository` + 5 repositorios especializados abstraen el acceso a datos
- **Singleton** — Conexiones a PostgreSQL y Redis gestionadas por el contenedor de servicios de Laravel
