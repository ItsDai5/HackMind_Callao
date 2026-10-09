-- Tabla de registros emocionales de EmoSense.
-- Ejecutar una vez en el SQL Editor del proyecto de Supabase.

create table if not exists registros_emocionales (
  id bigint generated always as identity primary key,
  nombre text not null,
  codigo_estudiante text not null,
  dni text not null,
  correo_institucional text not null,
  sede text,
  fecha date not null,
  emociones jsonb not null,            -- [{"emocion": "Tristeza", "intensidad": 0-10}, ...]
  pensamiento text not null default '',
  accion text not null default '',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  -- Un solo registro por estudiante y por día (igual que en la app).
  unique (dni, fecha)
);

-- Seguridad: sin políticas públicas, la clave publicable no puede leer ni escribir.
-- Solo la Edge Function (clave de servicio) inserta y consulta.
alter table registros_emocionales enable row level security;
