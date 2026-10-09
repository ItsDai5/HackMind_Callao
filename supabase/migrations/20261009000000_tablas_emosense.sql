-- Tablas de EmoSense: usuarios y registros emocionales.

create table if not exists usuarios (
  id bigint generated always as identity primary key,
  nombre text not null,
  correo text not null unique,
  dni text not null unique check (dni ~ '^[0-9]{8}$'),
  codigo_estudiante text not null unique,
  sede text not null,
  creado_en timestamptz not null default now()
);

create table if not exists registros_emocionales (
  id bigint generated always as identity primary key,
  nombre text not null,
  codigo_estudiante text not null,
  dni text not null,
  correo_institucional text not null,
  sede text,
  fecha date not null,
  emociones jsonb not null,
  pensamiento text not null default '',
  accion text not null default '',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (dni, fecha)
);

alter table usuarios enable row level security;
alter table registros_emocionales enable row level security;
