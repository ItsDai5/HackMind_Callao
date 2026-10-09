// Edge Function: recibe datos de la app y los guarda en Supabase con la clave
// de servicio (solo en el servidor).
//  - tipo "usuario": guarda el estudiante en la tabla usuarios.
//  - cualquier otro caso: guarda el registro del día en registros_emocionales.
import { createClient } from "npm:@supabase/supabase-js@2";

const cabeceras = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respuesta(cuerpo: unknown, estado = 200) {
  return new Response(JSON.stringify(cuerpo), { status: estado, headers: cabeceras });
}

function esTexto(valor: unknown, maximo: number) {
  return typeof valor === "string" && valor.length <= maximo;
}

function validarUsuario(datos: any): string | null {
  if (!esTexto(datos.nombre, 120) || !datos.nombre.trim()) return "Nombre inválido";
  if (!esTexto(datos.correo, 120) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) return "Correo inválido";
  if (!esTexto(datos.codigo, 20) || !datos.codigo.trim()) return "Código inválido";
  if (typeof datos.dni !== "string" || !/^\d{8}$/.test(datos.dni)) return "DNI inválido";
  if (!esTexto(datos.sede, 60) || !datos.sede) return "Sede inválida";
  if (typeof datos.claveHash !== "string" || !/^[0-9a-f]{64}$/.test(datos.claveHash)) return "Clave inválida";
  return null;
}

function validarRegistro(datos: any): string | null {
  const errorUsuario = validarUsuario(datos);
  if (errorUsuario) return errorUsuario;
  if (typeof datos.fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) return "Fecha inválida";
  if (!Array.isArray(datos.emociones) || datos.emociones.length > 16) return "Emociones inválidas";
  for (const e of datos.emociones) {
    if (!e || !esTexto(e.emocion, 60) || !Number.isInteger(e.intensidad) || e.intensidad < 0 || e.intensidad > 10) {
      return "Emoción o intensidad inválida";
    }
  }
  if (!esTexto(datos.pensamiento, 5000) || !esTexto(datos.accion, 5000)) return "Texto demasiado largo";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cabeceras });
  if (req.method !== "POST") return respuesta({ error: "Método no permitido" }, 405);

  let datos: any;
  try {
    datos = await req.json();
  } catch {
    return respuesta({ error: "JSON inválido" }, 400);
  }

  if (!datos || typeof datos !== "object") return respuesta({ error: "Datos inválidos" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (datos.tipo === "usuario") {
    const error = validarUsuario(datos);
    if (error) return respuesta({ error }, 400);

    const { error: errorBD } = await supabase.from("usuarios").upsert(
      {
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        dni: datos.dni,
        codigo_estudiante: datos.codigo.trim(),
        sede: datos.sede,
        clave_hash: datos.claveHash,
      },
      { onConflict: "dni" },
    );

    if (errorBD) return respuesta({ error: errorBD.message }, 500);
    return respuesta({ ok: true });
  }

  const error = validarRegistro(datos);
  if (error) return respuesta({ error }, 400);

  const { error: errorBD } = await supabase.from("registros_emocionales").upsert(
    {
      nombre: datos.nombre.trim(),
      codigo_estudiante: datos.codigo.trim(),
      dni: datos.dni,
      correo_institucional: datos.correo.trim(),
      sede: datos.sede,
      fecha: datos.fecha,
      emociones: datos.emociones,
      pensamiento: datos.pensamiento,
      accion: datos.accion,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "dni,fecha" },
  );

  if (errorBD) return respuesta({ error: errorBD.message }, 500);
  return respuesta({ ok: true });
});
