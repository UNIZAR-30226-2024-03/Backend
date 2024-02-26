-- DROP SCHEMA playbeat;

CREATE SCHEMA playbeat AUTHORIZATION postgres;

-- DROP SEQUENCE playbeat.audio_idaudio_seq;

CREATE SEQUENCE playbeat.audio_idaudio_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE playbeat.audio_idaudio_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE playbeat.audio_idaudio_seq TO postgres;

-- DROP SEQUENCE playbeat.lista_idlista_seq;

CREATE SEQUENCE playbeat.lista_idlista_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE playbeat.lista_idlista_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE playbeat.lista_idlista_seq TO postgres;

-- DROP SEQUENCE playbeat.usuario_idusuario_seq;

CREATE SEQUENCE playbeat.usuario_idusuario_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE playbeat.usuario_idusuario_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE playbeat.usuario_idusuario_seq TO postgres;
-- playbeat.audio definition

-- Drop table

-- DROP TABLE playbeat.audio;

CREATE TABLE playbeat.audio (
	idaudio bigserial NOT NULL,
	titulo varchar NOT NULL,
	img varchar NULL,
	esprivado bool NOT NULL,
	"path" varchar NOT NULL,
	duracionseg int4 NOT NULL,
	CONSTRAINT audio_pk PRIMARY KEY (idaudio)
);

-- Permissions

ALTER TABLE playbeat.audio OWNER TO postgres;
GRANT ALL ON TABLE playbeat.audio TO postgres;


-- playbeat.etiqueta definition

-- Drop table

-- DROP TABLE playbeat.etiqueta;

CREATE TABLE playbeat.etiqueta (
	nombre varchar NOT NULL,
	esdepod bool NOT NULL,
	CONSTRAINT etiqueta_pk PRIMARY KEY (nombre, esdepod)
);

-- Permissions

ALTER TABLE playbeat.etiqueta OWNER TO postgres;
GRANT ALL ON TABLE playbeat.etiqueta TO postgres;


-- playbeat.lista definition

-- Drop table

-- DROP TABLE playbeat.lista;

CREATE TABLE playbeat.lista (
	idlista bigserial NOT NULL,
	nombre varchar NOT NULL,
	descripcion varchar NULL,
	esprivada bool NOT NULL,
	fechaultimamod timestamp NOT NULL,
	img varchar NULL,
	esalbum bool NOT NULL,
	tipo int4 NOT NULL,
	CONSTRAINT lista_pk PRIMARY KEY (idlista)
);

-- Permissions

ALTER TABLE playbeat.lista OWNER TO postgres;
GRANT ALL ON TABLE playbeat.lista TO postgres;


-- playbeat.contiene definition

-- Drop table

-- DROP TABLE playbeat.contiene;

CREATE TABLE playbeat.contiene (
	idlista int8 NOT NULL,
	idaudio int8 NOT NULL,
	CONSTRAINT contiene_pk PRIMARY KEY (idaudio, idlista),
	CONSTRAINT idaudio_fk FOREIGN KEY (idaudio) REFERENCES playbeat.audio(idaudio),
	CONSTRAINT idlista_fk FOREIGN KEY (idlista) REFERENCES playbeat.lista(idlista)
);

-- Permissions

ALTER TABLE playbeat.contiene OWNER TO postgres;
GRANT ALL ON TABLE playbeat.contiene TO postgres;


-- playbeat.tiene definition

-- Drop table

-- DROP TABLE playbeat.tiene;

CREATE TABLE playbeat.tiene (
	idaudio int4 NOT NULL,
	nombre varchar NOT NULL,
	esdepod bool NOT NULL,
	CONSTRAINT newtable_pk PRIMARY KEY (idaudio, nombre, esdepod),
	CONSTRAINT audio_fk FOREIGN KEY (idaudio) REFERENCES playbeat.audio(idaudio),
	CONSTRAINT etiqueta_fk FOREIGN KEY (nombre,esdepod) REFERENCES playbeat.etiqueta(nombre,esdepod)
);

-- Permissions

ALTER TABLE playbeat.tiene OWNER TO postgres;
GRANT ALL ON TABLE playbeat.tiene TO postgres;


-- playbeat.usuario definition

-- Drop table

-- DROP TABLE playbeat.usuario;

CREATE TABLE playbeat.usuario (
	idusuario bigserial NOT NULL,
	email varchar NOT NULL,
	nombreusuario varchar NOT NULL,
	contrasegna varchar NULL,
	img varchar NULL,
	esadmin bool NOT NULL,
	idultimoaudio int4 NULL,
	segfin int4 NULL,
	CONSTRAINT usuario_pk PRIMARY KEY (idusuario),
	CONSTRAINT usuario_fk FOREIGN KEY (idultimoaudio) REFERENCES playbeat.audio(idaudio)
);

-- Permissions

ALTER TABLE playbeat.usuario OWNER TO postgres;
GRANT ALL ON TABLE playbeat.usuario TO postgres;


-- playbeat.esautor definition

-- Drop table

-- DROP TABLE playbeat.esautor;

CREATE TABLE playbeat.esautor (
	idusuario int8 NOT NULL,
	idaudio int8 NOT NULL,
	CONSTRAINT esautor_pk PRIMARY KEY (idusuario, idaudio),
	CONSTRAINT "idUsuario_fk" FOREIGN KEY (idusuario) REFERENCES playbeat.usuario(idusuario),
	CONSTRAINT idaudio_fk FOREIGN KEY (idaudio) REFERENCES playbeat.audio(idaudio)
);

-- Permissions

ALTER TABLE playbeat.esautor OWNER TO postgres;
GRANT ALL ON TABLE playbeat.esautor TO postgres;


-- playbeat.escucha definition

-- Drop table

-- DROP TABLE playbeat.escucha;

CREATE TABLE playbeat.escucha (
	idusuario int4 NOT NULL,
	idaudio int4 NOT NULL,
	fecha timestamp NOT NULL,
	CONSTRAINT escucha_pk PRIMARY KEY (idusuario, idaudio, fecha),
	CONSTRAINT idaudio_fk FOREIGN KEY (idaudio) REFERENCES playbeat.audio(idaudio),
	CONSTRAINT idusuario_fk FOREIGN KEY (idusuario) REFERENCES playbeat.usuario(idusuario)
);

-- Permissions

ALTER TABLE playbeat.escucha OWNER TO postgres;
GRANT ALL ON TABLE playbeat.escucha TO postgres;


-- playbeat.espropietario definition

-- Drop table

-- DROP TABLE playbeat.espropietario;

CREATE TABLE playbeat.espropietario (
	idusuario int8 NOT NULL,
	idlista int8 NOT NULL,
	CONSTRAINT espropietario_pk PRIMARY KEY (idusuario, idlista),
	CONSTRAINT "idUsuario_fk" FOREIGN KEY (idusuario) REFERENCES playbeat.usuario(idusuario),
	CONSTRAINT idlista_fk FOREIGN KEY (idlista) REFERENCES playbeat.lista(idlista)
);

-- Permissions

ALTER TABLE playbeat.espropietario OWNER TO postgres;
GRANT ALL ON TABLE playbeat.espropietario TO postgres;


-- playbeat.siguelista definition

-- Drop table

-- DROP TABLE playbeat.siguelista;

CREATE TABLE playbeat.siguelista (
	idusuario int8 NOT NULL,
	idlista int8 NOT NULL,
	fultimavezescuchado timestamp NOT NULL,
	CONSTRAINT siguelista_pk PRIMARY KEY (idusuario, idlista),
	CONSTRAINT "idUsuario_fk" FOREIGN KEY (idusuario) REFERENCES playbeat.usuario(idusuario),
	CONSTRAINT idlista_fk FOREIGN KEY (idlista) REFERENCES playbeat.lista(idlista)
);

-- Permissions

ALTER TABLE playbeat.siguelista OWNER TO postgres;
GRANT ALL ON TABLE playbeat.siguelista TO postgres;


-- playbeat.sigueusuario definition

-- Drop table

-- DROP TABLE playbeat.sigueusuario;

CREATE TABLE playbeat.sigueusuario (
	idseguidor int8 NOT NULL,
	idseguido int8 NOT NULL,
	CONSTRAINT sigueusuario_pk PRIMARY KEY (idseguidor, idseguido),
	CONSTRAINT "idSeguido_fk" FOREIGN KEY (idseguido) REFERENCES playbeat.usuario(idusuario),
	CONSTRAINT "idSeguidor_fk" FOREIGN KEY (idseguidor) REFERENCES playbeat.usuario(idusuario)
);

-- Permissions

ALTER TABLE playbeat.sigueusuario OWNER TO postgres;
GRANT ALL ON TABLE playbeat.sigueusuario TO postgres;




-- Permissions

GRANT ALL ON SCHEMA playbeat TO postgres;
