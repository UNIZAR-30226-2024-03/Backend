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
        lista_genero_nombre := 'Top ' || genero.nombre || ' Songs';

        -- Insertar lista de reproducción si no existe
        -- Utilizamos PERFORM para ejecutar la función sin necesidad de retornar un valor.
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
        )
        GROUP BY aec."A"
        ORDER BY COUNT(*) DESC
        LIMIT 50;

    END LOOP;

	-- Crear lista de reproducción basada en los audios más escuchados
	FOR audio_mas_escuchado IN SELECT "idAudio" FROM (
	    SELECT "idAudio", COUNT(*) as escuchas
	    FROM public."Escucha"
	    GROUP BY "idAudio"
	    ORDER BY escuchas DESC
	    LIMIT 50
	) AS subquery LOOP
	    -- Generar nombre de lista
	    lista_top_nombre := 'Top 10 Most Played';
	
	    -- Insertar lista de reproducción si no existe
        -- Utilizamos PERFORM para ejecutar la función sin necesidad de retornar un valor.
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

