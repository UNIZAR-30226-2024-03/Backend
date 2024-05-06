-- Primero hay que habilitar la extension pg_cron.
-- Después se instala la caracterisitca.
CREATE EXTENSION pg_cron SCHEMA pg_catalog;
-- Ejecutamos la función todos los dias a las 23:00
SELECT cron.schedule('0 23 * * *', 'SELECT generar_listas_reproduccion()');