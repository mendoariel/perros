failed to get console mode for stdout: Controlador no v├ílido.
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
CREATE ROLE mendoariel;
ALTER ROLE mendoariel WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'md583d7c29c4397f2caff04cb54155c1edb';
CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;






--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 12.22 (Debian 12.22-1.pgdg120+1)
-- Dumped by pg_dump version 12.22 (Debian 12.22-1.pgdg120+1)

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

--
-- PostgreSQL database dump complete
--

--
-- Database "peludosclick" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 12.22 (Debian 12.22-1.pgdg120+1)
-- Dumped by pg_dump version 12.22 (Debian 12.22-1.pgdg120+1)

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

--
-- Name: peludosclick; Type: DATABASE; Schema: -; Owner: mendoariel
--

CREATE DATABASE peludosclick WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.utf8' LC_CTYPE = 'en_US.utf8';


ALTER DATABASE peludosclick OWNER TO mendoariel;

\connect peludosclick

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

SET default_table_access_method = heap;

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

INSERT INTO public.medals ("id","createdAt", "updatedAt", "ownerId", "status", "image", "medal_string", "pet_name", "register_hash") VALUES (1, '2025-03-04 00:25:32.841', '2025-03-04 00:32:36.069', 1, 'ENABLED', 'secrectIMG-20250301-WA0000.jpg', 'rosa_mosqueta', 'Rosa Mosqueta', 'czddiglfpeyukzsejxazd03b4a5r26wunyt5');
INSERT INTO public.medals ("id","createdAt", "updatedAt", "ownerId", "status", "image", "medal_string", "pet_name", "register_hash") VALUES (2, '2025-03-04 01:01:09.304', '2025-03-04 01:03:55.396', 2, 'ENABLED', 'secrectScreenshot_20250303-220346.Fotos.png', 'celeste', 'Silvestre', '6s2h438u4k1abfosmyfrgicd1d7dkue5qfs2');
INSERT INTO public.medals ("id","createdAt", "updatedAt", "ownerId", "status", "image", "medal_string", "pet_name", "register_hash") VALUES (8, '2025-03-08 22:58:46.631', '2025-03-08 23:05:08.909', 8, 'ENABLED', 'secrectrosy.jpg', 'apolo', 'apolo', 'uy5qkvwvpfr25ddr65l3yecfkqefcs0hulg5');
INSERT INTO public.medals ("id","createdAt", "updatedAt", "ownerId", "status", "image", "medal_string", "pet_name", "register_hash") VALUES (10, '2025-03-11 16:58:01.576', '2025-03-11 17:26:17.258', 1, 'INCOMPLETE', 'secrecttoby.jpg', 'angela', 'Angela Maria', 'k49aw8p1gmpqcsbcl7inm6qn28klkbqz7d8c');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

INSERT INTO public.users ("id", "createdAt", "updatedAt", "email", "hash", "hashedRt", "username", "role", "hashPasswordRecovery", "userStatus", "hash_to_register")  VALUES  (2, '2025-03-04 01:01:09.304', '2025-03-04 01:01:58.526', 'Ara.frazetto@gmail.com', '$2a$10$scT7hAKFNyPbsbPa3ZExGODiyL9iumZcamLADvGVviYLuuiYQuAK6', '$2a$10$V8VzO/o2VGrXGS9lz4jAcuKwv6OpijwAVJ0xUp1uva51QaTljmGVy', NULL, 'VISITOR', NULL, 'ACTIVE', '5g36ncsemusmvb0gdc3jv3cjizde02tnh6sn');
INSERT INTO public.users ("id", "createdAt", "updatedAt", "email", "hash", "hashedRt", "username", "role", "hashPasswordRecovery", "userStatus", "hash_to_register") VALUES (8, '2025-03-08 22:58:46.631', '2025-03-11 17:01:24.334', 'mendoariel@gmail.com', '$2a$10$q4jgfx2H9d/C8ZuyWN5a/O63A8515zrBobPJrk48RSbcg5hx5wi9C', NULL, NULL, 'VISITOR', NULL, 'ACTIVE', '4vqc469ixglelhaz9pbq2e8zrxk02snjp9qb');
INSERT INTO public.users ("id", "createdAt", "updatedAt", "email", "hash", "hashedRt", "username", "role", "hashPasswordRecovery", "userStatus", "hash_to_register") VALUES (1, '2025-03-04 00:25:32.841', '2025-03-11 17:10:43.967', 'mendoariel@hotmail.com', '$2a$10$S5RLh71P3TGG.jr125Hgdu.GlJ.5p5Abqd5k7JWsxu1hPb1.Fmqo6', '$2a$10$bts1CqXnEdO6gixQ5tL02uqJXWO6QU65UuJv59BEv4G8rMJZgp9xm', NULL, 'VISITOR', NULL, 'ACTIVE', '4nvdw7yw5t3omgno21roy7rk2mx6py6do5t0');


--
-- Data for Name: virgin_medals; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (1, '2025-03-04 00:22:24.146', '2025-03-04 00:31:50.41', 'REGISTERED', 'rosa_mosqueta', 'czddiglfpeyukzsejxazd03b4a5r26wunyt5');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (2, '2025-03-04 00:34:57.678', '2025-03-04 01:01:53.286', 'REGISTERED', 'celeste', '6s2h438u4k1abfosmyfrgicd1d7dkue5qfs2');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (13, '2025-03-10 15:28:05.338', NULL, 'VIRGIN', '09871hhxuw78u7n9g3kzlgoxntv2dkag8pp3', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (14, '2025-03-10 15:28:05.341', NULL, 'VIRGIN', 'ps2m5c7zuhwcfpnk6uevsafkiuxu791oxfwy', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (15, '2025-03-10 15:28:05.342', NULL, 'VIRGIN', 'kbkp5db65hhpt432mas5u88dj0iub3h6jdvt', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (16, '2025-03-10 15:28:05.348', NULL, 'VIRGIN', 'ow1zo7weznx1jcfz3u98emrx2u1n21o12yv4', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (17, '2025-03-10 15:28:05.347', NULL, 'VIRGIN', 'p33bf93kyctc1p04hygbrvcvhgzrlmf1mh4u', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (18, '2025-03-10 15:28:05.347', NULL, 'VIRGIN', 'lwdddp7p4spbzu1bor6fx8l0n1615886a30n', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (19, '2025-03-10 15:28:05.35', NULL, 'VIRGIN', 'hezyo1t1rca5scrjk1rv885m0f0im8mj4unp', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (20, '2025-03-10 15:28:05.352', NULL, 'VIRGIN', 'qr8byd98h9u93s4bievtxnbkox50wfzqfxft', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (21, '2025-03-10 15:28:05.354', NULL, 'VIRGIN', 'bhwuxlqh72t2dqxf158h48q8wpevjmxtsgqb', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (22, '2025-03-10 15:28:05.357', NULL, 'VIRGIN', 'xxlpwqu4fbslitrgykc8cxm0n7z36gy6zwid', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (24, '2025-03-10 15:28:05.359', NULL, 'VIRGIN', '58b6qilg69s22qwyhaxc0nujlo7x7mkkw7kz', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (23, '2025-03-10 15:28:05.358', NULL, 'VIRGIN', '56zywbrw8osvb6c7uc9qewspeg06kgppeafb', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (25, '2025-03-10 15:28:05.36', NULL, 'VIRGIN', 'jtb0i0ub95w7te8g6n1nekmvbn2j5oq0q7sc', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (26, '2025-03-10 15:28:05.361', NULL, 'VIRGIN', 'ag7cvvrxevh5ktcfp2wbowbe44vw3b30cv5i', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (27, '2025-03-10 15:28:05.362', NULL, 'VIRGIN', '4h3xratrux2uzpgh6ntibdgo3zyjbjwk4neh', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (28, '2025-03-10 15:28:05.363', NULL, 'VIRGIN', 's9m9978fw1q21gv7874o1f1bedano6rfr99y', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (30, '2025-03-10 15:28:05.365', NULL, 'VIRGIN', 'w2cwuheb0d8x0xyy65zbw6883x8iezzuuror', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (29, '2025-03-10 15:28:05.364', NULL, 'VIRGIN', 'wrjk3mfpnb48bn1hnfezoz4v8adisdr5rprt', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (31, '2025-03-10 15:28:05.366', NULL, 'VIRGIN', '7csaxou6y8k5d1pt3hy8glnunvswr4r1abye', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (32, '2025-03-10 15:28:05.367', NULL, 'VIRGIN', 't75kly5rf7zkngcjvka31zyltnni3nerdevy', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (33, '2025-03-10 15:28:05.369', NULL, 'VIRGIN', '47kjcx5ox3bc91f3mg7mwdolpaqigro2opsh', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (34, '2025-03-10 15:28:05.371', NULL, 'VIRGIN', 'ou31jl8fywixhg0pj4r9vkri374s47kvgces', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (35, '2025-03-10 15:28:05.373', NULL, 'VIRGIN', '8qd6az8z04sb5rce9vcpd8sw0745m0ngmw2s', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (36, '2025-03-10 15:28:05.377', NULL, 'VIRGIN', 'o86c320roj50qstp2y76x3d9slma8g7u2v3r', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (37, '2025-03-10 15:28:05.375', NULL, 'VIRGIN', 'qlp5dgnztepx96slvi2q2oo096c1u9axwiwi', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (38, '2025-03-10 15:28:05.379', NULL, 'VIRGIN', 'ziiidui2k4of8cb305zymgflrqwx73q65daw', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (39, '2025-03-10 15:28:05.38', NULL, 'VIRGIN', '5uewbvnpaumkzkjfwg5kyh9cc6j8klla8mqe', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (40, '2025-03-10 15:28:05.391', NULL, 'VIRGIN', 'bem5kkpbaxv9uhr4hmd4ztcu7pmnz9ar4rxp', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (41, '2025-03-10 15:28:05.426', NULL, 'VIRGIN', 'zj07h8bybkl4gcafzw1ex1glxpqymt4d2k22', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (42, '2025-03-10 15:28:05.436', NULL, 'VIRGIN', 'aosaxmu3oqpvraz11ib9dxvw8g1qj5cvkey8', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (43, '2025-03-10 15:28:05.438', NULL, 'VIRGIN', '0ktyn1pzav1znya6099hviqlko0v5shw8lma', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (44, '2025-03-10 15:28:05.483', NULL, 'VIRGIN', 'y2zkbs4w7y8lunwy9rcxw1uwscvsjvzatmrb', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (45, '2025-03-10 15:28:05.509', NULL, 'VIRGIN', 'ymooegj5whvhsctj1slmgr6p44il5r2bq5sc', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (46, '2025-03-10 15:28:05.583', NULL, 'VIRGIN', 'nvca6ffp0316wlzb100ygfmpcbvn3nocvlbu', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (47, '2025-03-10 15:28:05.594', NULL, 'VIRGIN', '2zl3av64gg9coditbptf27fhtxmh8joz9hqr', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (48, '2025-03-10 15:28:05.612', NULL, 'VIRGIN', '05l49wgf2t9tpbr6kdbr3pnm5ak8e76lygx2', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (49, '2025-03-10 15:28:05.621', NULL, 'VIRGIN', 'dttuyj7qnf9xg2zkhceitr7c80zfz5ls9acg', 'genesis');
INSERT INTO public.virgin_medals ("id", "createdAt", "updatedAt", "status", "medal_string", "register_hash") VALUES (50, '2025-03-11 16:35:37.891', '2025-03-11 16:57:33.413', 'REGISTER_PROCESS', 'angela', 'k49aw8p1gmpqcsbcl7inm6qn28klkbqz7d8c');


--
-- Name: medals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.medals_id_seq', 10, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: virgin_medals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.virgin_medals_id_seq', 50, true);


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
-- Name: medals medals_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.medals
    ADD CONSTRAINT "medals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 12.22 (Debian 12.22-1.pgdg120+1)
-- Dumped by pg_dump version 12.22 (Debian 12.22-1.pgdg120+1)

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

--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

