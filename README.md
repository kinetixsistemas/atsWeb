# ATS Web

Plataforma de optimización curricular con análisis ATS e inteligencia artificial.

## Stack

| Capa       | Tecnología                              |
| ---------- | --------------------------------------- |
| Frontend   | Angular 21 + TypeScript + Tailwind CSS  |
| Backend    | FastAPI + Python 3.12                   |
| Base Datos | PostgreSQL (Supabase)                   |
| Auth       | Supabase Auth (JWT, Google OAuth)       |
| Storage    | Supabase Storage                        |
| IA         | Groq (LLaMA 3.3 70B)                    |

## Estructura

```
atsweb/
├── frontend/          # Angular SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/        # Componentes de página (home, login, register, dashboard, ats, etc.)
│   │   │   ├── core/         # Servicios, guards, interceptors, interfaces
│   │   │   │   ├── services/  # AuthService, AtsService, AnalysisService
│   │   │   │   ├── guards/    # authGuard (protección de rutas)
│   │   │   │   ├── interceptor/ # HTTP interceptor (JWT automático)
│   │   │   │   └── interfaces/ # Tipos TypeScript
│   │   │   └── shared/       # Componentes reutilizables (navbar, footer, etc.)
│   │   └── index.html        # CSP configurado para localhost:8000
│   ├── angular.json
│   └── package.json
│
├── backend/           # FastAPI REST API
│   ├── app/
│   │   ├── api/v1/          # Endpoints (analysis, cv-extractions, templates, etc.)
│   │   ├── core/            # Config, security (cliente Supabase)
│   │   ├── schemas/         # Pydantic models
│   │   └── services/        # cv_parser (ATS sin IA), ai_service (Groq)
│   ├── main.py
│   ├── supabase_schema.sql  # DDL completo + RLS + triggers
│   └── requirements.txt
│
└── README.md
```

## Frontend (Angular 21)

Aplicación SPA standalone con lazy loading, signals, y Supabase Auth.

### Inicio rápido

```bash
cd frontend
npm install
ng serve
# Abre http://localhost:4200
```

### Auth

- Registro con email + contraseña
- Inicio de sesión con email/contraseña
- Google OAuth (requiere configuración en Supabase Dashboard)
- Sesión persistente vía PKCE
- Interceptor HTTP que adjunta JWT automáticamente

### Páginas

| Ruta           | Componente               | Descripción                       |
| -------------- | ------------------------ | --------------------------------- |
| `/`            | HomePageComponent        | Landing page                      |
| `/register`    | RegistrePageComponent    | Registro con indicador fortaleza  |
| `/login`       | LoginPageComponent       | Inicio de sesión                  |
| `/dashboard`   | DashboardPageComponent   | Panel principal                   |
| `/ats`         | AtsPageComponent         | Análisis ATS de CV                |
| `/plantillas`  | PlantillasPageComponent  | Plantillas de CV                  |
| `/configuracion` | ConfiguracionPageComponent | Ajustes de usuario              |

### Servicios principales

- **AuthService** (`core/services/auth.service.ts`): Signals para `currentUser`, métodos `signUp`, `signIn`, `signInWithGoogle`, `signOut`, `getSessionToken`
- **AtsService** (`core/services/ats.Service.ts`): `extractCvData(file)`, `analyzeCv(file, jobDesc)` con JWT automático vía interceptor
- **AnalysisService** (`core/services/analysis.service.ts`): Historial de análisis

## Backend (FastAPI)

API REST con parser ATS heurístico y análisis opcional por IA.

### Inicio rápido

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 main.py
# Servidor en http://localhost:8000
```

### Endpoints

| Método | Ruta                              | Auth | Descripción                   |
| ------ | --------------------------------- | ---- | ----------------------------- |
| POST   | `/api/v1/cv-extractions/extract`  | Opcional | Extraer datos del CV     |
| GET    | `/api/v1/cv-extractions/history`  | Sí   | Historial de extracciones     |
| POST   | `/api/v1/analyze-file`            | Sí   | Análisis completo con IA      |
| GET    | `/api/v1/analysis/history`        | Sí   | Historial de análisis         |
| POST   | `/api/v1/register`                | Sí   | Crear perfil de usuario       |
| GET    | `/api/v1/profile`                 | Sí   | Perfil del usuario            |
| GET    | `/api/v1/templates`               | Sí   | Listar plantillas             |
| GET    | `/api/v1/subscriptions`           | Sí   | Listar planes de suscripción  |

### Parser ATS (sin IA)

El módulo `services/cv_parser.py` extrae de forma heurística:

- Datos personales (nombre, email, teléfono, ubicación, LinkedIn)
- Resumen profesional
- Experiencia laboral (puesto, empresa, fechas, logros cuantificables)
- Educación (título, institución, fechas)
- Habilidades técnicas
- Certificaciones
- Idiomas
- Puntuación ATS (0-100) con issues de estructura

## Base de Datos (Supabase)

Ejecutar `backend/supabase_schema.sql` en el SQL Editor de Supabase para crear:

- `analyses` — Análisis con IA
- `cv_extractions` — Extracciones del parser local (JSONB)
- `user_profiles` — Perfiles con trigger auto-creación
- `user_subscriptions` — Planes de suscripción por usuario
- `templates` — Plantillas de CV
- `subscription_plans` — Planes disponibles

## Variables de Entorno

```env
# backend/.env
GROQ_API_KEY=gsk_...
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  # service_role key
SUPABASE_ANON_KEY=sb_publishable_...  # anon key
```

## Licencia

MIT
