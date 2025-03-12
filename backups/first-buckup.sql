--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE "Silvestre1993";
ALTER ROLE "Silvestre1993" WITH SUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'md55aabe6be0f95458f9dc93790c8521465';
CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;






--
-- Database creation
--

CREATE DATABASE peludosclick WITH TEMPLATE = template0 OWNER = postgres;
REVOKE CONNECT,TEMPORARY ON DATABASE template1 FROM PUBLIC;
GRANT CONNECT ON DATABASE template1 TO PUBLIC;


\connect peludosclick

SET default_transaction_read_only = off;

--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4 (Debian 10.4-2.pgdg90+1)
-- Dumped by pg_dump version 10.4 (Debian 10.4-2.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: MedalState; Type: TYPE; Schema: public; Owner: Silvestre1993
--

CREATE TYPE public."MedalState" AS ENUM (
    'VIRGIN',
    'ENABLED',
    'DISABLED',
    'DEAD',
    'REGISTER_PROCESS',
    'PENDING_CONFIRMATION',
    'INCOMPLETE',
    'REGISTERED'
);


ALTER TYPE public."MedalState" OWNER TO "Silvestre1993";

--
-- Name: Role; Type: TYPE; Schema: public; Owner: Silvestre1993
--

CREATE TYPE public."Role" AS ENUM (
    'VISITOR',
    'FRIAS_EDITOR',
    'REGISTER'
);


ALTER TYPE public."Role" OWNER TO "Silvestre1993";

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: Silvestre1993
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'PENDING',
    'DISABLED'
);


ALTER TYPE public."UserStatus" OWNER TO "Silvestre1993";

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: medals; Type: TABLE; Schema: public; Owner: Silvestre1993
--

CREATE TABLE public.medals (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ownerId" integer NOT NULL,
    status public."MedalState" NOT NULL,
    image text,
    medal_string text NOT NULL,
    pet_name text NOT NULL,
    register_hash text NOT NULL
);


ALTER TABLE public.medals OWNER TO "Silvestre1993";

--
-- Name: medals_id_seq; Type: SEQUENCE; Schema: public; Owner: Silvestre1993
--

CREATE SEQUENCE public.medals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.medals_id_seq OWNER TO "Silvestre1993";

--
-- Name: medals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Silvestre1993
--

ALTER SEQUENCE public.medals_id_seq OWNED BY public.medals.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: Silvestre1993
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email text NOT NULL,
    hash text NOT NULL,
    "hashedRt" text,
    username text,
    role public."Role" NOT NULL,
    "hashPasswordRecovery" text,
    "userStatus" public."UserStatus" NOT NULL,
    hash_to_register text NOT NULL
);


ALTER TABLE public.users OWNER TO "Silvestre1993";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: Silvestre1993
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO "Silvestre1993";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Silvestre1993
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: virgin_medals; Type: TABLE; Schema: public; Owner: Silvestre1993
--

CREATE TABLE public.virgin_medals (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone,
    status public."MedalState" NOT NULL,
    medal_string text NOT NULL,
    register_hash text NOT NULL
);


ALTER TABLE public.virgin_medals OWNER TO "Silvestre1993";

--
-- Name: virgin_medals_id_seq; Type: SEQUENCE; Schema: public; Owner: Silvestre1993
--

CREATE SEQUENCE public.virgin_medals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.virgin_medals_id_seq OWNER TO "Silvestre1993";

--
-- Name: virgin_medals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Silvestre1993
--

ALTER SEQUENCE public.virgin_medals_id_seq OWNED BY public.virgin_medals.id;


--
-- Name: medals id; Type: DEFAULT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.medals ALTER COLUMN id SET DEFAULT nextval('public.medals_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: virgin_medals id; Type: DEFAULT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.virgin_medals ALTER COLUMN id SET DEFAULT nextval('public.virgin_medals_id_seq'::regclass);


--
-- Data for Name: medals; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

COPY public.medals (id, "createdAt", "updatedAt", "ownerId", status, image, medal_string, pet_name, register_hash) FROM stdin;
1	2025-03-04 00:25:32.841	2025-03-04 00:32:36.069	1	ENABLED	secrectIMG-20250301-WA0000.jpg	rosa_mosqueta	Rosa Mosqueta	czddiglfpeyukzsejxazd03b4a5r26wunyt5
2	2025-03-04 01:01:09.304	2025-03-04 01:03:55.396	2	ENABLED	secrectScreenshot_20250303-220346.Fotos.png	celeste	Silvestre	6s2h438u4k1abfosmyfrgicd1d7dkue5qfs2
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

COPY public.users (id, "createdAt", "updatedAt", email, hash, "hashedRt", username, role, "hashPasswordRecovery", "userStatus", hash_to_register) FROM stdin;
1	2025-03-04 00:25:32.841	2025-03-04 00:37:24.108	mendoariel@hotmail.com	$2a$10$S5RLh71P3TGG.jr125Hgdu.GlJ.5p5Abqd5k7JWsxu1hPb1.Fmqo6	\N	\N	VISITOR	\N	ACTIVE	4nvdw7yw5t3omgno21roy7rk2mx6py6do5t0
2	2025-03-04 01:01:09.304	2025-03-04 01:01:58.526	Ara.frazetto@gmail.com	$2a$10$scT7hAKFNyPbsbPa3ZExGODiyL9iumZcamLADvGVviYLuuiYQuAK6	$2a$10$V8VzO/o2VGrXGS9lz4jAcuKwv6OpijwAVJ0xUp1uva51QaTljmGVy	\N	VISITOR	\N	ACTIVE	5g36ncsemusmvb0gdc3jv3cjizde02tnh6sn
\.


--
-- Data for Name: virgin_medals; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

COPY public.virgin_medals (id, "createdAt", "updatedAt", status, medal_string, register_hash) FROM stdin;
1	2025-03-04 00:22:24.146	2025-03-04 00:31:50.41	REGISTERED	rosa_mosqueta	czddiglfpeyukzsejxazd03b4a5r26wunyt5
2	2025-03-04 00:34:57.678	2025-03-04 01:01:53.286	REGISTERED	celeste	6s2h438u4k1abfosmyfrgicd1d7dkue5qfs2
\.


--
-- Name: medals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.medals_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: virgin_medals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.virgin_medals_id_seq', 2, true);


--
-- Name: medals medals_pkey; Type: CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.medals
    ADD CONSTRAINT medals_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: virgin_medals virgin_medals_pkey; Type: CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.virgin_medals
    ADD CONSTRAINT virgin_medals_pkey PRIMARY KEY (id);


--
-- Name: medals_medal_string_key; Type: INDEX; Schema: public; Owner: Silvestre1993
--

CREATE UNIQUE INDEX medals_medal_string_key ON public.medals USING btree (medal_string);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: Silvestre1993
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: virgin_medals_medal_string_key; Type: INDEX; Schema: public; Owner: Silvestre1993
--

CREATE UNIQUE INDEX virgin_medals_medal_string_key ON public.virgin_medals USING btree (medal_string);


--
-- Name: virgin_medals_register_hash_key; Type: INDEX; Schema: public; Owner: Silvestre1993
--

CREATE UNIQUE INDEX virgin_medals_register_hash_key ON public.virgin_medals USING btree (register_hash);


--
-- Name: medals medals_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.medals
    ADD CONSTRAINT "medals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\connect postgres

SET default_transaction_read_only = off;

--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4 (Debian 10.4-2.pgdg90+1)
-- Dumped by pg_dump version 10.4 (Debian 10.4-2.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- PostgreSQL database dump complete
--

\connect template1

SET default_transaction_read_only = off;

--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4 (Debian 10.4-2.pgdg90+1)
-- Dumped by pg_dump version 10.4 (Debian 10.4-2.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE template1; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE template1 IS 'default template for new databases';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

