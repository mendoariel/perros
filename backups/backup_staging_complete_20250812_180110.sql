--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: staging_migrations; Type: TABLE; Schema: public; Owner: staging_user
--

CREATE TABLE public.staging_migrations (
    id integer NOT NULL,
    migration_name character varying(255) NOT NULL,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'applied'::character varying,
    notes text
);


ALTER TABLE public.staging_migrations OWNER TO staging_user;

--
-- Name: staging_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: staging_user
--

CREATE SEQUENCE public.staging_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.staging_migrations_id_seq OWNER TO staging_user;

--
-- Name: staging_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: staging_user
--

ALTER SEQUENCE public.staging_migrations_id_seq OWNED BY public.staging_migrations.id;


--
-- Name: staging_migrations id; Type: DEFAULT; Schema: public; Owner: staging_user
--

ALTER TABLE ONLY public.staging_migrations ALTER COLUMN id SET DEFAULT nextval('public.staging_migrations_id_seq'::regclass);


--
-- Data for Name: staging_migrations; Type: TABLE DATA; Schema: public; Owner: staging_user
--

COPY public.staging_migrations (id, migration_name, applied_at, status, notes) FROM stdin;
1	init-staging-db	2025-08-12 20:46:26.10649	applied	Base de datos de staging inicializada
\.


--
-- Name: staging_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: staging_user
--

SELECT pg_catalog.setval('public.staging_migrations_id_seq', 1, true);


--
-- Name: staging_migrations staging_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: staging_user
--

ALTER TABLE ONLY public.staging_migrations
    ADD CONSTRAINT staging_migrations_pkey PRIMARY KEY (id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO staging_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: staging_user
--

ALTER DEFAULT PRIVILEGES FOR ROLE staging_user IN SCHEMA public GRANT ALL ON SEQUENCES  TO staging_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: staging_user
--

ALTER DEFAULT PRIVILEGES FOR ROLE staging_user IN SCHEMA public GRANT ALL ON TABLES  TO staging_user;


--
-- PostgreSQL database dump complete
--

