CREATE OR REPLACE FUNCTION crear_lista_si_no_existe(nombre_lista TEXT) RETURNS VOID AS $$
BEGIN
	INSERT INTO public."Lista" (nombre, "tipoLista")
	    SELECT nombre_lista, 'NORMAL'
	    WHERE NOT EXISTS (
	        SELECT 1 
	        FROM public."Lista" 
	        WHERE nombre = nombre_lista
	    );
END;
$$ LANGUAGE plpgsql;
