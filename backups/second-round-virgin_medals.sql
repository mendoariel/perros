--
-- PostgreSQL database dump
--

-- Dumped from database version 12.22 (Debian 12.22-1.pgdg120+1)
-- Dumped by pg_dump version 12.4

-- Started on 2025-04-15 20:22:46 UTC

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
-- TOC entry 210 (class 1259 OID 26213)
-- Name: export_virgin_medal_second_round; Type: TABLE; Schema: public; Owner: mendoariel
--

CREATE TABLE public.export_virgin_medal_second_round (
    id integer,
    "createdAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone,
    status public."MedalState",
    medal_string text,
    register_hash text
);


ALTER TABLE public.export_virgin_medal_second_round OWNER TO mendoariel;

--
-- TOC entry 3006 (class 0 OID 26213)
-- Dependencies: 210
-- Data for Name: export_virgin_medal_second_round; Type: TABLE DATA; Schema: public; Owner: mendoariel
--

INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.607', NULL, 'VIRGIN', 'otner5nee6d70zv6zoqkipugkem11ovgjp6z', 'second-round');
INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.609', NULL, 'VIRGIN', 'm7x0xuyy3vl3rhigsh4jaxz4errfc14sro5e', 'second-round');
INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.611', NULL, 'VIRGIN', 'oziqeh739sdp2au8rbcc9t8hhauou1j9eqp3', 'second-round');
INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.612', NULL, 'VIRGIN', '0hb6e9ii7i21ccjap1owt1u3q8ymdhf1inz5', 'second-round');
INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.613', NULL, 'VIRGIN', '5xcdhecp0s63j14nsompg2yyleyupfbh5e2o', 'second-round');
INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.614', NULL, 'VIRGIN', 'q29iqqebymebwum37awa0yn9fykr0995axfd', 'second-round');
INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.616', NULL, 'VIRGIN', 'w4y7rud4zhlymgveqwxbqnf7bpk4w54w6j7n', 'second-round');
INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.617', NULL, 'VIRGIN', '7eo1ts2pjcnm2yr1xnzs9t7p7zdocn5wub5u', 'second-round');
INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.62', NULL, 'VIRGIN', 'vtzphmfvf81u8fazwa92vb45cmzgye4wd2bk', 'second-round');
INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.619', NULL, 'VIRGIN', '7qm6uxw0gqwzbswr6wnooituso9se6an05qr', 'second-round');
INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.621', NULL, 'VIRGIN', 'zqq9riq3ni7ibaihfhi3w8hkl6sdq9c9t175', 'second-round');
INSERT INTO public.virgin_medals ("createdAt", "updatedAt", status, medal_string, register_hash) VALUES ('2025-03-26 15:11:39.624', NULL, 'VIRGIN', '52qdl122bd6hzfcii5mqjxhqfp2gut1othbw', 'second-round');


-- Completed on 2025-04-15 20:22:46 UTC

--
-- PostgreSQL database dump complete
--

