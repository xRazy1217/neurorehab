# NeuroRehab PWA

Aplicación de tele-rehabilitación fonoaudiológica para personas en etapa subaguda post-ACV.

## Stack

- **Next.js 15** — App Router + TypeScript
- **Tailwind CSS** — Estilos
- **Supabase** — Auth, PostgreSQL, Storage
- **next-pwa** — PWA / Service Worker
- **Recharts** — Gráficos de progreso
- **Vercel** — Deploy

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia `.env.local` y rellena con tus valores de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Supabase — Base de datos

Ejecuta `supabase/schema.sql` en el **SQL Editor** de tu proyecto Supabase.

### 4. Supabase — Storage buckets

Crea dos buckets desde el Dashboard de Supabase:
- `recordings` — Privado (grabaciones de audio de pacientes)
- `task-images` — Público (imágenes de ejercicios)

### 5. Crear usuario admin

Crea el primer admin manualmente desde **Supabase Dashboard → Authentication → Users → Add User**, luego ejecuta:

```sql
INSERT INTO profiles (id, role, full_name)
VALUES ('uuid-del-usuario-creado', 'admin', 'Dr. Nombre Apellido');
```

### 6. Desarrollo

```bash
npm run dev
```

### 7. Deploy en Vercel

```bash
vercel --prod
```

Recuerda agregar las variables de entorno en el panel de Vercel.

## Estructura de rutas

```
/                     → Redirect según rol
/login                → Login (ambos roles)

/app                  → Dashboard paciente
/app/tareas           → Lista de tareas
/app/tareas/[id]      → Ejercicio en curso
/app/progreso         → Gráficos de progreso
/app/perfil           → Perfil del paciente

/admin                → Dashboard admin (lista de pacientes)
/admin/pacientes/nuevo → Crear paciente
/admin/pacientes/[id]  → Detalle del paciente
/admin/pacientes/[id]/tareas → Gestión de tareas

/offline              → Página sin conexión (PWA fallback)
```

## Tipos de ejercicios

| Tipo | Descripción | Input del paciente |
|------|-------------|-------------------|
| `image_naming` | Nombrar imagen mostrada | Grabación de voz |
| `phrase_repetition` | Repetir frase reproducida | Grabación de voz |
| `visual_memory` | Memorizar imagen y seleccionar objetos | Selección múltiple |

## PWA

La app es instalable en Android e iOS. El banner de instalación aparece automáticamente en el primer acceso desde el navegador.

Los íconos deben colocarse en:
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
