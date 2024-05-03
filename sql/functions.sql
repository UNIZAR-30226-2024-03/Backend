CREATE OR REPLACE FUNCTION generar_listas_reproduccion() RETURNS VOID AS $$
DECLARE
    genero RECORD;
    audio_mas_escuchado RECORD;
    lista_genero_nombre TEXT;
    lista_top_nombre TEXT;
BEGIN
    -- Crear listas de reproducción basadas en géneros
    FOR genero IN SELECT nombre FROM public."EtiquetaCancion" LOOP
        -- Generar nombre de lista basado en el género
        lista_genero_nombre := 'Top ' || genero.nombre;

        -- Insertar lista de reproducción si no existe
        PERFORM crear_lista_si_no_existe(lista_genero_nombre);
       
        -- Insertar audios del género más escuchados en la lista de reproducción
        INSERT INTO public."_AudioToLista" ("A", "B")
        SELECT aec."A", (
        	SELECT "idLista" 
        	FROM public."Lista" 
        	WHERE nombre = lista_genero_nombre
        )
        FROM public."_AudioToEtiquetaCancion" AS aec
        	INNER JOIN public."Escucha" AS e ON aec."A" = e."idAudio"
        WHERE aec."B" = (
        	SELECT "idEtiqueta" 
        	FROM public."EtiquetaCancion" 
        	WHERE nombre = genero.nombre
        ) AND aec."A" = (
            SELECT "idAudio"
            FROM public."Audio"
            WHERE "esPrivada" = false
        )
        GROUP BY aec."A"
        ORDER BY COUNT(*) DESC
        LIMIT 10;

    END LOOP;
   
   
   FOR genero IN SELECT nombre FROM public."EtiquetaPodcast" LOOP
        -- Generar nombre de lista basado en el género
        lista_genero_nombre := 'Top ' || genero.nombre;

        -- Insertar lista de reproducción si no existe
        PERFORM crear_lista_si_no_existe(lista_genero_nombre);
       
        -- Insertar audios del género más escuchados en la lista de reproducción
        INSERT INTO public."_AudioToLista" ("A", "B")
        SELECT aep."A", (
        	SELECT "idLista" 
        	FROM public."Lista" 
        	WHERE nombre = lista_genero_nombre
        )
        FROM public."_AudioToEtiquetaPodcast" AS aep
        	INNER JOIN public."Escucha" AS e ON aep."A" = e."idAudio" 
        WHERE aep."B" = (
        	SELECT "idEtiqueta" 
        	FROM public."EtiquetaCancion" 
        	WHERE nombre = genero.nombre
        )
        GROUP BY aec."A"
        ORDER BY COUNT(*) DESC
        LIMIT 10;

    END LOOP;

	-- Crear lista de reproducción basada en los audios más escuchados
    -- Comprobar que son públicas.
	FOR audio_mas_escuchado IN SELECT "idAudio" FROM (
	    SELECT "idAudio", COUNT(*) as escuchas
	    FROM public."Escucha" AS e
            INNER JOIN public."Audios" AS a ON e."idAudio" = a."idAudio"
        WHERE e."idAudio" = a."idAudio" AND a."esPrivada" = false        
	    GROUP BY "idAudio"
	    ORDER BY escuchas DESC
	    LIMIT 10
	) AS subquery LOOP
	    -- Generar nombre de lista
	    lista_top_nombre := 'Top 10 Global';
	
	    -- Insertar lista de reproducción si no existe
	    PERFORM crear_lista_si_no_existe(lista_top_nombre);
	
	    -- Insertar audios más escuchados en la lista de reproducción
	    INSERT INTO public."_AudioToLista" ("A", "B")
	    VALUES (audio_mas_escuchado."idAudio", 
		   (SELECT "idLista" 
		  	FROM public."Lista" 
		  	WHERE nombre = lista_top_nombre)
		);
	
	END LOOP;
END;
$$ LANGUAGE plpgsql;





-- Por defecto las listas son publicas. ¡ Añadir propiertario e imagen, fecha !
CREATE OR REPLACE FUNCTION crear_lista_si_no_existe(nombre_lista TEXT) RETURNS VOID AS $$
BEGIN
	INSERT INTO public."Lista" (nombre, "tipoLista") 
	    SELECT nombre_lista, 'NORMAL' -- Comprobar que tipo de lista es
	    WHERE NOT EXISTS (
	        SELECT 1 
	        FROM public."Lista" 
	        WHERE nombre = nombre_lista
	    );
END;
$$ LANGUAGE plpgsql;	




select generar_listas_reproduccion();








-- Función que se desencadena con la llamada de un trigger y válida si la asignación de etiquetas
-- es correcta o no.
CREATE OR REPLACE FUNCTION validar_tipo_audio()
RETURNS TRIGGER AS $$
DECLARE
    es_podcast BOOLEAN;
BEGIN
    -- Obtener el valor de esPodcast para el audio correspondiente
    SELECT "esPodcast" INTO es_podcast FROM "Audio" WHERE "idAudio" = NEW."A";

    IF es_podcast THEN
        -- El audio es un podcast, la etiqueta debe insertarse en _AudioToEtiquetaPodcast
        IF TG_TABLE_NAME <> '_AudioToEtiquetaPodcast' THEN
            RAISE EXCEPTION 'El audio es un podcast, debe insertarse en _AudioToEtiquetaPodcast';
        END IF;
    ELSE
        -- El audio no es un podcast, la etiqueta debe insertarse en _AudioToEtiquetaCancion
        IF TG_TABLE_NAME <> '_AudioToEtiquetaCancion' THEN
            RAISE EXCEPTION 'El audio no es un podcast, debe insertarse en _AudioToEtiquetaCancion';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



