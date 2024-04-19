-- Crear el trigger para _AudioToEtiquetaCancion
CREATE TRIGGER validar_tipo_audio_cancion
BEFORE INSERT ON "_AudioToEtiquetaCancion"
FOR EACH ROW
EXECUTE FUNCTION validar_tipo_audio();

-- Crear el trigger para _AudioToEtiquetaPodcast
CREATE TRIGGER validar_tipo_audio_podcast
BEFORE INSERT ON "_AudioToEtiquetaPodcast"
FOR EACH ROW
EXECUTE FUNCTION validar_tipo_audio();