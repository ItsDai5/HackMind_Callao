-- Tabla de usuarios de EmoSense.
-- Ejecutar en el SQL Editor del proyecto de Supabase.

create table if not exists usuarios (
  id bigint generated always as identity primary key,
  nombre text not null,
  correo text not null unique,
  dni text not null unique check (dni ~ '^[0-9]{8}$'),
  codigo_estudiante text not null unique,
  sede text not null,
  creado_en timestamptz not null default now()
);

-- Sin políticas públicas: la clave publicable no puede leer ni escribir.
alter table usuarios enable row level security;
