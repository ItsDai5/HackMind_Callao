-- Guarda el hash SHA-256 de la contraseña del estudiante (nunca la contraseña en texto plano).
alter table usuarios add column if not exists clave_hash text;
