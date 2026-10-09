#!/usr/bin/env bash
# Despliega la Edge Function guardar-registro en el proyecto de Supabase.
# Uso (desde la carpeta del repositorio): bash supabase/desplegar.sh

set -e
cd "$(dirname "$0")/.."

PROJECT_REF="jyfbomsfbadggtoosfuz"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Instalando la CLI de Supabase..."
  npm install -g supabase
fi

supabase login
supabase link --project-ref "$PROJECT_REF"
supabase functions deploy guardar-registro --no-verify-jwt

echo "Listo: la función guardar-registro quedó desplegada."
