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
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: Silvestre1993
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO "Silvestre1993";

--
-- Name: medals; Type: TABLE; Schema: public; Owner: Silvestre1993
--

CREATE TABLE public.medals (
    id integer NOT NULL,
    status public."MedalState" NOT NULL,
    image text,
    description text,
    medal_string text NOT NULL,
    pet_name text NOT NULL,
    register_hash text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    owner_id integer NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    email text NOT NULL,
    hash text NOT NULL,
    username text,
    role public."Role" NOT NULL,
    hash_to_register text NOT NULL,
    phonenumber text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    hash_password_recovery text,
    hashed_rt text,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_status public."UserStatus" NOT NULL
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
    status public."MedalState" NOT NULL,
    medal_string text NOT NULL,
    register_hash text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone
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
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2423a370-7668-4fad-a7e8-702c45d6bffd	90a3d9f693c726e738af3f27942597d1090837c767f08a3d0c64c0e79ae10085	2025-05-27 18:15:25.330832+00	20250212125507_add_status_registered_for_medals	\N	\N	2025-05-27 18:15:25.324134+00	1
9352bddc-3552-468c-b4cd-c100774f557b	fb14918d28facaeaaced783304f7f3990dbd6b3ecb878b04598684118dcbef65	2025-05-27 18:15:24.98743+00	20240523202948_first	\N	\N	2025-05-27 18:15:24.965525+00	1
56cbdf78-4b8b-451c-ba9a-c5c8bedc75d0	bb1c851264c2c75e4178c62823fbdf35d057ab84f4728043f1fcb4bc168427a0	2025-05-27 18:15:25.114384+00	20250205222948_update	\N	\N	2025-05-27 18:15:25.108434+00	1
b73cb6a2-5d04-4b4b-bf36-f000ae06de57	af7bc931cf585214d2edf46be64d1bcdf413b38f82bffcc6b029495ab2117fd9	2025-05-27 18:15:24.99634+00	20240524135120_add_username	\N	\N	2025-05-27 18:15:24.989711+00	1
63dc82fe-051d-4c1a-823e-7bebbe1afc1c	1662fdc87e508924c7d85c684076a44dbe860488d9d4884fc2a283f1d52333d3	2025-05-27 18:15:25.005607+00	20240603180619_role_enum	\N	\N	2025-05-27 18:15:24.99806+00	1
a2da4313-9a7d-4cc8-8f77-27af5049e894	0b729b6bc23b71080fce0754a58337b3254f66186809a3cfa3c26b00e4ece558	2025-05-27 18:15:25.237444+00	20250210132518_new	\N	\N	2025-05-27 18:15:25.232024+00	1
6615920f-1a64-48c0-890b-59b0fad167ee	0178969a40f0d3d36e996bd1dce011ec7478dc6021226911ff6109b5d56089e7	2025-05-27 18:15:25.012984+00	20240604194136_change_superpower	\N	\N	2025-05-27 18:15:25.007595+00	1
223b952d-1ebf-4ebb-ae27-e20a151005cc	79a1103d2ed60f3f3126f86bbfd8a83ab6158561615224400231005c3871b64e	2025-05-27 18:15:25.133547+00	20250206125527_new_migration	\N	\N	2025-05-27 18:15:25.116026+00	1
868b430c-956f-480d-b28e-2a89ee868e1f	2f251faa7ed276e2abece1cba3ca00605d1abcf659576c4bb8d0f2140fc55b47	2025-05-27 18:15:25.020647+00	20240625163121_add_hash_password_recovery	\N	\N	2025-05-27 18:15:25.015425+00	1
9eb45fc5-7ef9-4155-97ae-fbca03a68e1c	1a671b1e1d64b829cc0380c9ad6e7ffc91779af4ac51d6fb5bf28719e0e4db6a	2025-05-27 18:15:25.037869+00	20250203195901_create_medals_table	\N	\N	2025-05-27 18:15:25.022777+00	1
d932da32-1578-4500-9793-5a221d52043e	f4eea05bd42700a5ddb71b9367495463889c4c926b6bf9c363a2cc5f8a9bf416	2025-05-27 18:15:25.047099+00	20250203200852_fix_medal_table	\N	\N	2025-05-27 18:15:25.03992+00	1
6ab9eb6e-42de-442d-a007-ee63c4c2dd5f	ccebed371765ea9aa8d19e8e1096bff94c4eb4fa6b03e548f71de990dea3c53c	2025-05-27 18:15:25.149637+00	20250207131538_create_relationship	\N	\N	2025-05-27 18:15:25.135908+00	1
301d259b-2beb-4cef-b35f-adca579c2ae8	4419ed7b149fd85bec442cfd2e5465165c097280466eb784a5de7080157d73b4	2025-05-27 18:15:25.055236+00	20250205154515_add_hash_register_into_table_medal	\N	\N	2025-05-27 18:15:25.048824+00	1
c5db2831-b143-411b-a0c6-029eef5dbe8d	c7f38867468994672f9b8650c6a2723df86d2077c3bfe31062fd35f01ffe81a5	2025-05-27 18:15:25.062616+00	20250205175150_add_a_status_register_process	\N	\N	2025-05-27 18:15:25.05744+00	1
85bc4704-c74e-45d0-b94d-9fbd4c1409d7	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-05-27 18:15:25.069271+00	20250205213228_migrate_to_fix	\N	\N	2025-05-27 18:15:25.064905+00	1
12d0434b-5c19-4134-9d98-4a3a9984ba61	4be05d75cc16ce90f1ebda6ea12dc74bfb8af5bcf866a70416a337bc2d65eb7d	2025-05-27 18:15:25.157968+00	20250207134701_relationship_2	\N	\N	2025-05-27 18:15:25.151581+00	1
20748de2-7cc9-4285-b8af-7bfaa10a33e1	7cc733cb96be5cf3660f81fe84f30b973aefc0196164e761df0d25d24eafdbb4	2025-05-27 18:15:25.090208+00	20250205220458_	\N	\N	2025-05-27 18:15:25.071095+00	1
af2f03b3-ee11-4e6c-b98c-4181ad3143ba	fba3fdedffcebcb440baa0c0a757fd8245353ca357016516311f5e2b64151dc4	2025-05-27 18:15:25.098986+00	20250205220807_new	\N	\N	2025-05-27 18:15:25.092862+00	1
7ba799c0-2b82-4292-b01f-edaf5aa1c4ef	6accebd3bed00887f78a9fdcfff4f7670b047f6b2a77bee6f118a9a9afeda7a5	2025-05-27 18:15:25.25559+00	20250210153117_use_user_table	\N	\N	2025-05-27 18:15:25.23945+00	1
8069692b-3fc0-4521-9eb4-7cf807a9add5	c6cedeb28c17bff2a99f615aaa08ff4e49046a71f2c6af2a8366a3b36154e07f	2025-05-27 18:15:25.10627+00	20250205222901_more_changes	\N	\N	2025-05-27 18:15:25.100836+00	1
31cd3d00-ca19-4eab-9124-2273d2887880	f4d7aab64ed356eb2d010e4cf9de4015b2990ee1a93e816c95a25badfcfbb5d5	2025-05-27 18:15:25.178202+00	20250207141115_new_migration	\N	\N	2025-05-27 18:15:25.160296+00	1
199551fb-6566-453c-9256-f71184fd0da4	1988b7102925ae459f3b5ffe022c57b1c13466215c2a89b63edc4f254330b5da	2025-05-27 18:15:25.193135+00	20250207164913_	\N	\N	2025-05-27 18:15:25.18127+00	1
0f8a0b07-0a3f-4cd3-9237-80cd0bf8199b	935fbaec6cd4b9381d043544bcbfa7023bc55ea2f6d89bd813d0d4201a0a100f	2025-05-27 18:15:25.213096+00	20250207225857_new	\N	\N	2025-05-27 18:15:25.195302+00	1
8b265c04-2bcb-4b26-b366-c41e49716a14	d0c279bd9bfa23c16e4df0e56dae2fd70b3f8f8b462fb06d88fae6d00b6dffa7	2025-05-27 18:15:25.267442+00	20250210154702_change_name_state	\N	\N	2025-05-27 18:15:25.258255+00	1
ba522fa2-487a-405f-a6be-5537c2ddfbe2	92bb2fb38a341a41821489d105057d603abf67e2efbc43e7f7778cd98c6facbd	2025-05-27 18:15:25.222901+00	20250207235203_user_status	\N	\N	2025-05-27 18:15:25.216876+00	1
800e105c-42c9-4c3f-8995-4f3b064de3da	c9f9a023c7db127a3a3c2eb9832e2a7d855ffd8abea74dad65d5a9181561cf4e	2025-05-27 18:15:25.230091+00	20250208000558_name_pet_add	\N	\N	2025-05-27 18:15:25.224712+00	1
06c5e085-a1a1-499f-8e49-1335cf3e1a46	1747df81adb58e612a2a35d560f1e776902529971a4d073396e541306534511a	2025-05-27 18:15:25.34205+00	20250212152437_name_pet	\N	\N	2025-05-27 18:15:25.335951+00	1
9e9c8c63-2c64-4a31-ad30-14d2b8f41730	ccbc7a792b5f909a0069813d2963fd1375f9fb9c052b7a2d7a78c00ac44fb02a	2025-05-27 18:15:25.278207+00	20250210171208_use_user_table	\N	\N	2025-05-27 18:15:25.270271+00	1
1d7cdb64-1f75-4e85-be1b-5140c30614c7	ef7a3e1e3546e9635e290e87f000ad0bed7d35b417c6b4b4c03bc19e57f75902	2025-05-27 18:15:25.320635+00	20250211164257_tuesday_11_migration	\N	\N	2025-05-27 18:15:25.280927+00	1
b761596f-6421-4412-af9f-edc17c80254c	27a9b546fa4fac8d4c2db069fc910fd886f8c4fe3e33842594ae9f710e985ea5	2025-05-27 18:15:25.376116+00	20250311182708_add_phone_and_description	\N	\N	2025-05-27 18:15:25.360953+00	1
f32d070e-d435-449e-84c1-7566d002cf19	01348597f415540d15308f2a043308fbcf49613445643fc6421d627cf0a2f8d2	2025-05-27 18:15:25.349854+00	20250222212635_update_optional	\N	\N	2025-05-27 18:15:25.344042+00	1
3f660949-1a66-48f0-ab43-c9690a4eb27c	fcde0a0bcde85b44462f1650a4a1360f6090b684e5fae98bcab95b93c1b2b533	2025-05-27 18:29:42.25528+00	20250527182942_maps_names	\N	\N	2025-05-27 18:29:42.195602+00	1
76ec1d82-ee53-4106-8dc9-9029dc5b7492	8f78bc2a35fe922fb8e14a6bda599877085e75a914ed3e086e1ddf5e59b10e8e	2025-05-27 18:15:25.358283+00	20250222215600_images_fiel_into_medals	\N	\N	2025-05-27 18:15:25.352145+00	1
a24723f7-e92e-488e-becb-1ffe851a72bd	f22d85a61ed01ac17ecbe7a3556053bb58960f166ec912f93b84f0df5fbe4bda	2025-05-27 18:15:25.387381+00	20250311184006_optional_description_of_the_medal	\N	\N	2025-05-27 18:15:25.378308+00	1
\.


--
-- Data for Name: medals; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

COPY public.medals (id, status, image, description, medal_string, pet_name, register_hash, created_at, owner_id, updated_at) FROM stdin;
2	ENABLED	secrectScreenshot_20250303-220346.Fotos.png	Gato macho adulto color vaquita	celeste	Silvestre	6s2h438u4k1abfosmyfrgicd1d7dkue5qfs2	2025-03-04 01:01:09.304	2	2025-03-04 01:03:55.396
19	ENABLED	202504272122-vbragjdej5mvez.jpg	Hola me llamo Ciro Jofré!!!\nSi me encuentras por favor, llamar a mi papá Daniel y mi mamá Elva. Ellos me van a estar buscando 	zj07h8bybkl4gcafzw1ex1glxpqymt4d2k22	Ciro	genesis	2025-04-27 01:58:55.038	19	2025-04-27 02:05:57.509
12	ENABLED	pamela.png	Vivo en cuarta sección soy hembra adulta, castrada	aosaxmu3oqpvraz11ib9dxvw8g1qj5cvkey8	Pamela	genesis	2025-04-08 13:40:25.082	12	2025-04-08 13:40:25.082
15	INCOMPLETE	20250409173722-9l1n676qan87cv.jpg	Gata adopatada	5uewbvnpaumkzkjfwg5kyh9cc6j8klla8mqe	Sofia	genesis	2025-04-09 17:33:04.394	15	2025-04-09 17:45:18.345
14	ENABLED	2025040913011-mrbjepdlbeo3pd.jpg	Perro mediano pelo color gris blanco y marrón claro  le falta uno ojo. 	o86c320roj50qstp2y76x3d9slma8g7u2v3r	Aukan	genesis	2025-04-09 12:56:17.652	14	2025-04-09 19:09:18.264
16	ENABLED	20250409224327-ew6izcj0c85r8g.jpg	Hembra adulta, castrada tamaño grande.	bem5kkpbaxv9uhr4hmd4ztcu7pmnz9ar4rxp	NIna	genesis	2025-04-09 22:32:40.19	16	2025-04-09 22:45:54.317
17	ENABLED	20250411232930-jjjjszap054tq0.jpg	Caniche chico con manchas negras	t75kly5rf7zkngcjvka31zyltnni3nerdevy	Champucito	genesis	2025-04-11 23:23:08.727	17	2025-04-11 23:29:32.15
18	ENABLED	20250423235710-7c3zi591vatjhg.jpg	Perro macho, con un solo ojito, color marrón con blanco,	qlp5dgnztepx96slvi2q2oo096c1u9axwiwi	Ramon	genesis	2025-04-23 23:53:42.708	18	2025-04-23 23:59:23.376
20	ENABLED	20250503224150-2bw85kf008ktem.png	Perra tamaño mediano vive en Drummond 	7eo1ts2pjcnm2yr1xnzs9t7p7zdocn5wub5u	Panchita	second-round	2025-05-03 22:40:13.268	14	2025-05-03 22:42:32.07
1	ENABLED	secrectIMG-20250301-WA0000.jpg	Vivo en el barrio Supe	yu0yz4rs6vr1h3l1jjnbgfm5idemx5j77vk1	Rosa Mosqueta	czddiglfpeyukzsejxazd03b4a5r26wunyt5	2025-03-04 00:25:32.841	1	2025-04-08 13:03:14.628
10	ENABLED	20250609123438-qryfxjcb7uqykc.jpg	Gata adoptada esterilizada es de tamaño pequeña 	iz7vizo6q3umdlste9oi8fapfb8023hk5g8a	Canela	resina-first-round	2025-06-09 12:31:54.673	1	2025-06-09 12:31:54.673
4	ENABLED	20250601172813-we792dn03ldb8s.jpg	Hola, soy Pamela. Cariñosa y tranquila. Tengo rulos y collar marrón. Si me encontrás, avisá a mi humano. ¡Gracias!	y5ppbb0ai9xvqptygr0siq3edpviz7mh1bnm	Pamela	first-round-ezequiel	2025-06-01 17:27:11.512	22	2025-06-01 17:27:11.512
5	ENABLED	2025060118391-qhxu0ugd18af2b.jpg	Soy un perrito perdido ayudame a encontrar a mí familia 	7elfvrp69eexyqviweafrrckcgp9wj9ao0mn	Robin	first-round-ezequiel	2025-06-01 18:35:32.617	23	2025-06-01 18:35:32.617
6	INCOMPLETE	\N	\N	hprhrun603h6aqfv6mqn8h5y8wmy5aga0gpc	Pumita	first-round-ezequiel	2025-06-02 01:21:48.05	2	2025-06-02 01:21:48.05
9	ENABLED	20250604215538-4mhutp8p8x1ftz.jpg	Canche toy blanco,hembra ,pequeño	47kjcx5ox3bc91f3mg7mwdolpaqigro2opsh	Luli	genesis	2025-06-04 21:51:29.264	26	2025-06-04 21:51:29.264
11	REGISTER_PROCESS	\N	\N	yqcvw6b4iq465cnu6t3ryazctg8xelc8l13w	Pantuflo	first-round-ezequiel	2025-06-15 20:36:06.282	27	2025-06-15 20:36:06.282
13	REGISTER_PROCESS	\N	\N	5xcdhecp0s63j14nsompg2yyleyupfbh5e2o	Lola	second-round	2025-06-20 15:20:37.553	29	2025-06-20 15:20:37.553
25	ENABLED	20250715224549-l0ikxgu04gv9br.jpg	Paraguay 838	tv208i4vwk3nejhbbozq8swmqky5910hz3ct	Eva 	first-round-ezequiel	2025-07-15 22:39:30.799	35	2025-07-15 22:39:30.799
21	ENABLED	2025062404139-fkwg0838rzmc6w.jpg	Gato vaquita de la cuarta seccion	pumita93	Pumita	test	2025-06-24 00:30:46.723	1	2025-06-24 00:30:46.723
22	ENABLED	2025062404627-1s9m4eivt1qwob.jpg	Gato macho de la cuarta sección 	iemofap8ial462ymmjjwz8af9vma2nv0ct14	Pantera	first-round-ezequiel	2025-06-24 00:45:05.199	32	2025-06-24 00:45:05.199
26	ENABLED	2025071715447-rsqge4jfuvi321.jpg	Caniche de 5 años.Blanca 5 kg aproximado	10f1kbmemzpxzrt32qt63ab8xlur5crbbymr	Moon	resina-first-round	2025-07-17 01:51:19.498	36	2025-07-17 01:51:19.498
23	ENABLED	2025070423629-36gfwpdqlwyl8c.jpg	Alta ,Pelaje negro con marrón y blanco en la sona del pecho \n Orejas larga \nY a veces se hace la renga levanta la patita trasera derecha	rosa_mosqueta	Negra	czddiglfpeyukzsejxazd03b4a5r26wunyt5	2025-07-04 02:21:54.338	33	2025-07-04 02:21:54.338
27	ENABLED	20250731142538-j30jyy5eioy4yz.jpg	El gato vaquita mas lindo del mundo!	8fvzqpeng5ikcgyugm7083z5oxn64orc970l	Chicho	first-round-ezequiel	2025-07-31 14:23:39.264	32	2025-07-31 14:23:39.264
24	ENABLED	2025071441424-res691k2iuuwi6.jpg	Perro macho de raza salchicha, color marrón 	862sqexgamm0c5j1s218cz14sdyrtky9uuwo	Lio	first-round-ezequiel	2025-07-14 04:12:13.075	34	2025-07-14 04:12:13.075
29	REGISTER_PROCESS	\N	\N	fmz4khq2wpmzbp46uj7zw1e9fow3tqrfh1b1	NIna	first-round-ezequiel	2025-08-10 20:19:40.411	38	2025-08-10 20:19:40.411
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

COPY public.users (id, email, hash, username, role, hash_to_register, phonenumber, created_at, hash_password_recovery, hashed_rt, updated_at, user_status) FROM stdin;
12	susanapalomo2001@yahoo.com.ar	$2a$10$0kdoi/Q0JZBJQIRNjPRZ1urdEGxnrnT2pzixkoD4DdaGocpOixwL6	\N	VISITOR	register_hash	2616686339	2025-04-08 13:36:46.863	\N	\N	2025-04-08 13:36:46.863	ACTIVE
16	vivirromano@hotmail.com	$2a$10$WlsdoppIw265J75dHZjGAu7f2vo3Vg0ZqeMuWBrmAmbZKNXJUXEJK	\N	VISITOR	2u6o0prb58rgav965avf6044wrgi6evieg9n	2615455677	2025-04-09 22:32:40.19	\N	$2a$10$qiHME.jv8vkmrUpuljhdjOzi8.Uhzs4P.t/9VwurZHvQyD.ttE9pC	2025-04-09 22:45:54.311	ACTIVE
17	marbonanno@yahoo.com.ar	$2a$10$m2pJnZp3Mu2LasIHHnK4Hem9AJclxn7EIawiC.6DdZkTeKIhu7jw6	\N	VISITOR	i0bap6sovixqeh8dz15mojj3xwoquq1qbgpb	2613208888	2025-04-11 23:23:08.727	\N	$2a$10$YJXYYPUQfIEJ7VzC8jOyouyAxQQi62wS7omQrxLlShI2DH6RD3d3a	2025-04-11 23:26:47.259	ACTIVE
15	albertdesarrolloweb@gmail.com	$2a$10$Lw/LtdHwNWv3lery8pDBCudB3tP.F8atT3fcVGJg2Yb1XZaqPlTsu	\N	VISITOR	2if2vcpyxwnat7x96428f0vzo3ifg939m61e	2615597977	2025-04-09 17:33:04.394	\N	$2a$10$8Ljeq3eyBUp9GVBYwIgv5.Rhan5egG7JHXss2aiGFBkgOH3NpAsJS	2025-04-09 17:45:18.342	ACTIVE
18	casanovaluciana35@gmail.com	$2a$10$SHQVPQ2U/t0QxID6zaJMAOJXWLUNTxlKuRA4YSmAFfQsQcay12glC	\N	VISITOR	pbsqlsqw4gamledqreoffcimh3non621dz52	2616990028	2025-04-23 23:53:42.708	\N	$2a$10$3XyQVpLfuqZmNCBjc4OrJ.5ReTlWn435vXpk.63Zfy0Jf0bCchJDm	2025-04-23 23:59:23.374	ACTIVE
14	analiabelenarce@gmail.com	$2a$10$UOhYM25pobyUzeIOoPe3H.hp2WXu.G44Ojs5KcuFIfHW1cCkM7Hoy	\N	VISITOR	yed1wciyhg9pu80re2nwil9qhl3moob54y57	2616686337	2025-04-09 12:56:17.652	\N	$2a$10$/Cr16XnujXvJKveEyPnvAuFCQAjh659.B.SbrYRqOiAKzKwXzuwLG	2025-04-09 19:09:18.261	ACTIVE
19	elvamza64@gmail.com	$2a$10$ROQpbNVfVyY6bGzpounRT.X8uTKaKBHOsbRsMAAe3QlhR.qxvZa4W	\N	VISITOR	xcfd7zoduuvtlig56yrk7tdavwnprnncxemg	2616778872	2025-04-27 01:58:55.038	\N	$2a$10$L12N4yr6xeaVrK2YEwUt7eG7QB5J6.x21TSdc9cmTLx.kZcy/t/Py	2025-04-27 02:05:57.506	ACTIVE
22	dnarce@gmail.com	$2a$10$M8Pr/pRBhcUPxsz94QVE1u5KgOdsR8V/M9E3vDNghrePG/jh9kkVq	\N	VISITOR	opyx2a9bw7d4m7qvbmhnqehw68l3x44h654v	2616686332	2025-06-01 17:27:11.512	\N	$2a$10$VExWiPqnPIS4pw5.J1PmiOfDcXiiH6ZiSXzDrntQ6xy7Bj2FAGHW6	2025-06-01 17:27:11.512	ACTIVE
23	jasminguardia1005@gmail.com	$2a$10$.jnU348qlwh6UZNNqGBJBe2fq01bsPeFOsASLqr3aaNvfcKSI/Bq2	\N	VISITOR	d9fj0xx8qy5wbsx6fhwhqj4b0n4mvups0yiu	2644699022	2025-06-01 18:35:32.617	\N	$2a$10$P.mmjstW3jNBWIi/j87PIuNg.gbrBhGI9i.xmWZ3mxH.ik0vOrws6	2025-06-01 18:35:32.617	ACTIVE
26	miriambc54@gmail.com	$2a$10$FbeFArphFD4JsDhstYlC/O7SPsfc7NzxCig0Wo/B8QiP4.2p3PPpu	\N	VISITOR	ljhfidxtwom9zx6bed9jr5d6yv9rc4hn651p	2615193220	2025-06-04 21:51:29.264	\N	$2a$10$1.NlOzP2QcKpfwXhxnpuEOeSWiGJKUCtXprX67oZyzOnbxYiGDeN6	2025-06-04 21:51:29.264	ACTIVE
2	ara.frazetto@gmail.com	$2a$10$scT7hAKFNyPbsbPa3ZExGODiyL9iumZcamLADvGVviYLuuiYQuAK6	\N	VISITOR	5g36ncsemusmvb0gdc3jv3cjizde02tnh6sn	2615597976	2025-03-04 01:01:09.304	\N	$2a$10$V8VzO/o2VGrXGS9lz4jAcuKwv6OpijwAVJ0xUp1uva51QaTljmGVy	2025-03-20 23:21:09.37	ACTIVE
27	renzogreslebin@gmail.com	$2a$10$Y9QloBrxFignxqEj4ZWnrOea2dVUIr0MiSNSFbS22maWtXUSnakYG	\N	VISITOR	60re9vj62jkr28j5nbfbzo8d3y52ww2hx7aq	\N	2025-06-15 20:36:06.282	\N	\N	2025-06-15 20:36:06.282	PENDING
29	roodrii.rb@gmail.com	$2a$10$0rZl.66FiA79mxus4bVjoeTUe4kpIeZ27HdcA9I6V/CZTPx26tRGa	\N	VISITOR	ts3xotkey22nn9je6u5120km7oodm11vivdx	\N	2025-06-20 15:20:37.553	\N	\N	2025-06-20 15:20:37.553	PENDING
38	vivirromano@gmail.com	$2a$10$aJa8jHEt24hfU.sEu3AafeM86iCOn/Sk2.BQF0IYnL6Sc5WZpAlsO	\N	VISITOR	bdw9i2dfi0oopnij9vknlmc9aipqdhz4goiv	\N	2025-08-10 20:19:40.411	\N	\N	2025-08-10 20:19:40.411	PENDING
1	mendoariel2@hotmail.com	$2a$10$S5RLh71P3TGG.jr125Hgdu.GlJ.5p5Abqd5k7JWsxu1hPb1.Fmqo6	\N	VISITOR	4nvdw7yw5t3omgno21roy7rk2mx6py6do5t0	2615597977	2025-03-04 00:25:32.841	\N	$2a$10$JluZ0nDSLyiEcoiRf/PONuz4QOE..S83aD.8nYMNJ0L8XBsgufbq.	2025-04-08 13:05:45.315	ACTIVE
36	malejandravidela@gmail.com	$2a$10$noIuADpty24CNC7GAvvcSee6YwBXYNKwO4yQH6t3kvs9SnWa0aeeW	\N	VISITOR	xnixnm9pzvq6pdkjjipikkzmrz88etfw1irr	2664756473	2025-07-17 01:51:19.498	\N	\N	2025-07-17 01:51:19.498	ACTIVE
34	guardiacaro1@gmail.com	$2a$10$mU3RH.YQRxLrmBNpZb2.a.R19hd4cADSAJBsz6fDzwuZmPa3RCea.	\N	VISITOR	flsafviqs4rzdrcg4vpk60uhynyse5x3nlel	2644865955	2025-07-14 04:12:13.075	\N	$2a$10$jyKJEIrA7Vh75ycOHemRUel8.n1JtHVJLxFAmaXaZ2VBaIy7RbBOy	2025-07-14 04:12:13.075	ACTIVE
33	elizabethjuarezej3123567@gmail.com	$2a$10$9Bqs03HAgz5ApdudA10pHeE6Cgtq5sBasOK44KOW9DxY41QzemjQa	\N	VISITOR	s2wlqy008vxzxzrcaq1vs3bny6jfj35nrqhd	2617102015	2025-07-04 02:21:54.338	\N	$2a$10$.lDMhrJKR01c8btuKNZ2BOqQG7/kDoTt6XD3MXtB/BOK2yBoZ9amu	2025-07-04 02:21:54.338	ACTIVE
35	alejandroh10@gmail.com	$2a$10$AA.jEjoL8Yay2ry8mNi/0OIsWuS9PHulGcDjiO0wVN1i7SWowC.0O	\N	VISITOR	mi7ko3p9b90hk9siwp05tlfmxvotde4l526k	2615262096	2025-07-15 22:39:30.799	\N	$2a$10$itewl1P/xttqSh/FBvafIu.IKKfg7bfpmOJnbuTLqfNeI33MjT5Ii	2025-07-15 22:39:30.799	ACTIVE
32	mendoariel@hotmail.com	$2a$10$0p13c3QxWdmlLpRTnTwoMefTlkvyV7KHyv2gDMude0ufTxuw1OiTy	\N	VISITOR	7nvhh3tvrb7cpznvvfywbc0imxy6095xod5e	2615597977	2025-06-24 00:45:05.199	\N	$2a$10$8SK4Rw6WmvrYRS5Os5wwv.2W8T8IvyDtWs1ZZVfbURzD3ccth4yIC	2025-06-24 00:45:05.199	ACTIVE
\.


--
-- Data for Name: virgin_medals; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

COPY public.virgin_medals (id, status, medal_string, register_hash, created_at, updated_at) FROM stdin;
1	ENABLED	yu0yz4rs6vr1h3l1jjnbgfm5idemx5j77vk1	first-round-ezequiel	2025-05-27 18:46:47.805	\N
3	VIRGIN	09871hhxuw78u7n9g3kzlgoxntv2dkag8pp3	genesis	2025-05-27 18:46:47.805	\N
4	VIRGIN	ps2m5c7zuhwcfpnk6uevsafkiuxu791oxfwy	genesis	2025-05-27 18:46:47.805	\N
5	VIRGIN	kbkp5db65hhpt432mas5u88dj0iub3h6jdvt	genesis	2025-05-27 18:46:47.805	\N
6	VIRGIN	ow1zo7weznx1jcfz3u98emrx2u1n21o12yv4	genesis	2025-05-27 18:46:47.805	\N
7	VIRGIN	lwdddp7p4spbzu1bor6fx8l0n1615886a30n	genesis	2025-05-27 18:46:47.805	\N
8	VIRGIN	hezyo1t1rca5scrjk1rv885m0f0im8mj4unp	genesis	2025-05-27 18:46:47.805	\N
9	VIRGIN	qr8byd98h9u93s4bievtxnbkox50wfzqfxft	genesis	2025-05-27 18:46:47.805	\N
10	VIRGIN	bhwuxlqh72t2dqxf158h48q8wpevjmxtsgqb	genesis	2025-05-27 18:46:47.805	\N
11	VIRGIN	xxlpwqu4fbslitrgykc8cxm0n7z36gy6zwid	genesis	2025-05-27 18:46:47.805	\N
12	VIRGIN	58b6qilg69s22qwyhaxc0nujlo7x7mkkw7kz	genesis	2025-05-27 18:46:47.805	\N
13	VIRGIN	56zywbrw8osvb6c7uc9qewspeg06kgppeafb	genesis	2025-05-27 18:46:47.805	\N
14	VIRGIN	jtb0i0ub95w7te8g6n1nekmvbn2j5oq0q7sc	genesis	2025-05-27 18:46:47.805	\N
15	VIRGIN	ag7cvvrxevh5ktcfp2wbowbe44vw3b30cv5i	genesis	2025-05-27 18:46:47.805	\N
16	VIRGIN	4h3xratrux2uzpgh6ntibdgo3zyjbjwk4neh	genesis	2025-05-27 18:46:47.805	\N
17	VIRGIN	s9m9978fw1q21gv7874o1f1bedano6rfr99y	genesis	2025-05-27 18:46:47.805	\N
18	VIRGIN	w2cwuheb0d8x0xyy65zbw6883x8iezzuuror	genesis	2025-05-27 18:46:47.805	\N
19	VIRGIN	wrjk3mfpnb48bn1hnfezoz4v8adisdr5rprt	genesis	2025-05-27 18:46:47.805	\N
20	VIRGIN	7csaxou6y8k5d1pt3hy8glnunvswr4r1abye	genesis	2025-05-27 18:46:47.805	\N
22	VIRGIN	ou31jl8fywixhg0pj4r9vkri374s47kvgces	genesis	2025-05-27 18:46:47.805	\N
23	VIRGIN	8qd6az8z04sb5rce9vcpd8sw0745m0ngmw2s	genesis	2025-05-27 18:46:47.805	\N
24	VIRGIN	ziiidui2k4of8cb305zymgflrqwx73q65daw	genesis	2025-05-27 18:46:47.805	\N
25	VIRGIN	0ktyn1pzav1znya6099hviqlko0v5shw8lma	genesis	2025-05-27 18:46:47.805	\N
26	VIRGIN	ymooegj5whvhsctj1slmgr6p44il5r2bq5sc	genesis	2025-05-27 18:46:47.805	\N
27	VIRGIN	nvca6ffp0316wlzb100ygfmpcbvn3nocvlbu	genesis	2025-05-27 18:46:47.805	\N
28	VIRGIN	2zl3av64gg9coditbptf27fhtxmh8joz9hqr	genesis	2025-05-27 18:46:47.805	\N
29	VIRGIN	05l49wgf2t9tpbr6kdbr3pnm5ak8e76lygx2	genesis	2025-05-27 18:46:47.805	\N
30	VIRGIN	dttuyj7qnf9xg2zkhceitr7c80zfz5ls9acg	genesis	2025-05-27 18:46:47.805	\N
31	ENABLED	celeste	6s2h438u4k1abfosmyfrgicd1d7dkue5qfs2	2025-05-27 18:46:47.805	\N
32	VIRGIN	th9w8qllmix0jr540tzdcnqy6mr81pcb8cyh	third-round	2025-05-27 18:46:47.805	\N
33	VIRGIN	v5vp0v5a8bhycvdhaqbgwg64j6uvq52mbpxa	third-round	2025-05-27 18:46:47.805	\N
34	VIRGIN	2b6zqpcvqfrezf25kg6880wylce9gcoad38m	third-round	2025-05-27 18:46:47.805	\N
35	VIRGIN	ncscpgvnj8osugdg1w3m94y99espap85q7dv	third-round	2025-05-27 18:46:47.805	\N
36	ENABLED	qlp5dgnztepx96slvi2q2oo096c1u9axwiwi	genesis	2025-05-27 18:46:47.805	\N
37	VIRGIN	54jbfmqnjzv8jxlv17bteq7cbg0ovzep2gj6	third-round	2025-05-27 18:46:47.805	\N
38	VIRGIN	yln8917kdv8hkx8pvhzjd1hmk7tdukmfmmwx	third-round	2025-05-27 18:46:47.805	\N
39	ENABLED	aosaxmu3oqpvraz11ib9dxvw8g1qj5cvkey8	genesis	2025-05-27 18:46:47.805	\N
40	VIRGIN	4hybcu6dhut5e1pzuwoqtb4oj2c3sxfhu72g	third-round	2025-05-27 18:46:47.805	\N
41	ENABLED	zj07h8bybkl4gcafzw1ex1glxpqymt4d2k22	genesis	2025-05-27 18:46:47.805	\N
42	VIRGIN	ny2831g5yvo8xcqrak1htswa4cu2db714nxk	third-round	2025-05-27 18:46:47.805	\N
43	VIRGIN	ngsshzzh79krk0q7d6wcfvivqgijfmj2p9oz	third-round	2025-05-27 18:46:47.805	\N
44	REGISTERED	5uewbvnpaumkzkjfwg5kyh9cc6j8klla8mqe	genesis	2025-05-27 18:46:47.805	\N
45	ENABLED	o86c320roj50qstp2y76x3d9slma8g7u2v3r	genesis	2025-05-27 18:46:47.805	\N
46	VIRGIN	0qo23iip72ff4idvyz103hqvhqgphmlos9p4	third-round	2025-05-27 18:46:47.805	\N
47	ENABLED	7eo1ts2pjcnm2yr1xnzs9t7p7zdocn5wub5u	second-round	2025-05-27 18:46:47.805	\N
48	ENABLED	bem5kkpbaxv9uhr4hmd4ztcu7pmnz9ar4rxp	genesis	2025-05-27 18:46:47.805	\N
49	ENABLED	t75kly5rf7zkngcjvka31zyltnni3nerdevy	genesis	2025-05-27 18:46:47.805	\N
50	VIRGIN	otner5nee6d70zv6zoqkipugkem11ovgjp6z	second-round	2025-05-27 18:46:47.805	\N
51	VIRGIN	m7x0xuyy3vl3rhigsh4jaxz4errfc14sro5e	second-round	2025-05-27 18:46:47.805	\N
52	VIRGIN	oziqeh739sdp2au8rbcc9t8hhauou1j9eqp3	second-round	2025-05-27 18:46:47.805	\N
53	VIRGIN	0hb6e9ii7i21ccjap1owt1u3q8ymdhf1inz5	second-round	2025-05-27 18:46:47.805	\N
55	VIRGIN	q29iqqebymebwum37awa0yn9fykr0995axfd	second-round	2025-05-27 18:46:47.805	\N
56	VIRGIN	w4y7rud4zhlymgveqwxbqnf7bpk4w54w6j7n	second-round	2025-05-27 18:46:47.805	\N
57	VIRGIN	vtzphmfvf81u8fazwa92vb45cmzgye4wd2bk	second-round	2025-05-27 18:46:47.805	\N
58	VIRGIN	7qm6uxw0gqwzbswr6wnooituso9se6an05qr	second-round	2025-05-27 18:46:47.805	\N
59	VIRGIN	zqq9riq3ni7ibaihfhi3w8hkl6sdq9c9t175	second-round	2025-05-27 18:46:47.805	\N
60	VIRGIN	52qdl122bd6hzfcii5mqjxhqfp2gut1othbw	second-round	2025-05-27 18:46:47.805	\N
61	VIRGIN	tdbz29ephjwqllk155xvdw8l1uxzwcspeme8	third-round	2025-05-27 18:46:47.805	\N
62	VIRGIN	kteirqgvtxo2pdssg2uepctfl0fm7gtsf5gq	third-round	2025-05-27 18:46:47.805	\N
63	VIRGIN	n3bttcz0pxsjz8kidlqzbqrzdv3xu0zdgvnq	third-round	2025-05-27 18:46:47.805	\N
64	VIRGIN	6pyb2cbuvqlrmhcahyw49aydumko3k5tvxzj	third-round	2025-05-27 18:46:47.805	\N
65	REGISTERED	y2zkbs4w7y8lunwy9rcxw1uwscvsjvzatmrb	genesis	2025-05-27 18:46:47.805	\N
66	VIRGIN	ujs8y93kn95w56zrwntydmc7s0z5x7ov2bvt	third-round	2025-05-27 18:46:47.805	\N
67	VIRGIN	doc0hn8516yoevwirjpam5xefkoh4g26asc7	third-round	2025-05-27 18:46:47.805	\N
68	VIRGIN	1sxn09wh6q5mp5au8uiva1wjevugtp1g413t	resina-first-round	2025-05-27 18:46:47.805	\N
69	VIRGIN	ozsx8z1sdvehhx0lrwpyypqelpkyrxz484g1	resina-first-round	2025-05-27 18:46:47.805	\N
70	VIRGIN	3x0fy6rj7fg7a7qq7l5cupd52zq12nhyn9ux	resina-first-round	2025-05-27 18:46:47.805	\N
71	VIRGIN	p7k49kxdwo89c6fbs8dhyng7xxyqd2en0lht	resina-first-round	2025-05-27 18:46:47.805	\N
72	VIRGIN	9kvo0wwjq3sz5hdsb260w3xyuox9p6e9m1eh	resina-first-round	2025-05-27 18:46:47.805	\N
73	VIRGIN	7gkxdbr2hy57u6uoabp48yr5nxh3nuxmtcng	resina-first-round	2025-05-27 18:46:47.805	\N
74	VIRGIN	3qkgsvgso5q29e4phvsxqery116h6b7kla1a	resina-first-round	2025-05-27 18:46:47.805	\N
76	VIRGIN	r96jd0k0uwbwrwk5emepqsiw0pz7yw689pc9	resina-first-round	2025-05-27 18:46:47.805	\N
77	VIRGIN	k9mjim6xzqjis4zl0013unft5w252t0x0rwr	resina-first-round	2025-05-27 18:46:47.805	\N
78	VIRGIN	4s2yq77o578g7th4gescqbjab3w9fn94phus	resina-first-round	2025-05-27 18:46:47.805	\N
79	VIRGIN	m0mt4cultkrze5h7rjx76z89elc3rnrghiz5	resina-first-round	2025-05-27 18:46:47.805	\N
80	VIRGIN	whkf363uz5oe3kfxvptrhgf2pv5kzzh9qb9b	resina-first-round	2025-05-27 18:46:47.805	\N
81	VIRGIN	rit4jb67nbv4votd3uo99g3g68j9ylci0hw3	resina-first-round	2025-05-27 18:46:47.805	\N
82	VIRGIN	gj2uaatpqajrbxylrgmokqid2586z6ypq5i2	resina-first-round	2025-05-27 18:46:47.805	\N
83	VIRGIN	ix040e63dqkhrwkftrbxasbcf0x7hqyarv50	resina-first-round	2025-05-27 18:46:47.805	\N
84	VIRGIN	0g9njd48y4fdb6dsjda7zxrm8qfsjvz5vtuy	resina-first-round	2025-05-27 18:46:47.805	\N
85	VIRGIN	zqir3kw2y22386drg1xoxa05muxswzovgscl	resina-first-round	2025-05-27 18:46:47.805	\N
2	ENABLED	rosa_mosqueta	czddiglfpeyukzsejxazd03b4a5r26wunyt5	2025-05-27 18:46:47.805	\N
75	ENABLED	10f1kbmemzpxzrt32qt63ab8xlur5crbbymr	resina-first-round	2025-05-27 18:46:47.805	\N
86	VIRGIN	jk3hwfks4mh4oiz8mr8quauho497rfwypzja	resina-first-round	2025-05-27 18:46:47.805	\N
87	VIRGIN	imqt9dj6e35kkq9gz7pputmszpjy79a70egy	resina-first-round	2025-05-27 18:46:47.805	\N
88	VIRGIN	tuluwip02xng593tzssyvol17cl86nxf6i1l	resina-first-round	2025-05-27 18:46:47.805	\N
89	VIRGIN	sjuuinjologmsh3ipasyesdmp0mp1ds47kf8	resina-first-round	2025-05-27 18:46:47.805	\N
90	VIRGIN	b8nncbijnd76m66wbs2s87rb6crq7erd9yu9	resina-first-round	2025-05-27 18:46:47.805	\N
91	VIRGIN	cakhgh8e0jc4y2fqaqkyy7dk2xzyr9y4xrt1	resina-first-round	2025-05-27 18:46:47.805	\N
92	VIRGIN	dgdxinhsscko4rhg6d0p83ssvg2qlhgdtglu	resina-first-round	2025-05-27 18:46:47.805	\N
93	VIRGIN	sb9t5aye76vuhs5fm3ozrglmfqwk6pr6ycy2	resina-first-round	2025-05-27 18:46:47.805	\N
94	VIRGIN	42coasa5j7045f97xlq2qkpkfvoc4nnrbww2	resina-first-round	2025-05-27 18:46:47.805	\N
95	VIRGIN	botxrn5zpci9ksfzfketpq9n1ruz2xft5flo	resina-first-round	2025-05-27 18:46:47.805	\N
96	VIRGIN	k64abtknnt6zwta5c6pc4jefmi7smosrkesv	resina-first-round	2025-05-27 18:46:47.805	\N
98	VIRGIN	e0n2bre3yokiadgdoyjzy0e534e0n8ngo4vf	first-round-ezequiel	2025-05-27 18:46:47.805	\N
99	VIRGIN	95lwg5jdd6yic6wvfd2qfb20dddpyllqkqhi	first-round-ezequiel	2025-05-27 18:46:47.805	\N
100	VIRGIN	6kpiejn632a6oill0k4dpw5lakwmwyr1u7fg	first-round-ezequiel	2025-05-27 18:46:47.805	\N
101	VIRGIN	e38q5bcacdo5m1cjw10hmesnavg8vryyzupi	first-round-ezequiel	2025-05-27 18:46:47.805	\N
102	VIRGIN	fr54wzox2r8vu8vx5jchw9hhq9hk4xpma9qu	first-round-ezequiel	2025-05-27 18:46:47.805	\N
103	VIRGIN	vsljmh75fmjh82v2eyxoj4okkrnrz8fow5w7	first-round-ezequiel	2025-05-27 18:46:47.805	\N
106	VIRGIN	xqo1ilnfl8499p17r73v6mo8mydcyjizw3vb	first-round-ezequiel	2025-05-27 18:46:47.805	\N
107	VIRGIN	g2kp6hnf70nxnhei1gb0s6h1ay3vst5dgjnq	first-round-ezequiel	2025-05-27 18:46:47.805	\N
110	VIRGIN	is1sppg83g52yikhqlf18fd9ovyax0ptgqsl	first-round-ezequiel	2025-05-27 18:46:47.805	\N
111	VIRGIN	9oi5xpqm5ugawx7ax967zxdgnoyllu7s4mvs	first-round-ezequiel	2025-05-27 18:46:47.805	\N
112	VIRGIN	jb53dflrevtn8eelsqx0707aeag7xa9dh5ie	first-round-ezequiel	2025-05-27 18:46:47.805	\N
114	VIRGIN	5myzbg9cxa753umoucwopz6npfek6z29gp2h	first-round-ezequiel	2025-05-27 18:46:47.805	\N
115	VIRGIN	qg2jg3jzb1ifkf4b449wp4eu7oxo1qxuthqf	first-round-ezequiel	2025-05-27 18:46:47.805	\N
116	VIRGIN	r5ol34oiamerm1xs7n9ie69mkql7z7816rr3	first-round-ezequiel	2025-05-27 18:46:47.805	\N
117	VIRGIN	s7hda8i1fow29tr9s5hbli06l4yrl7uecrta	first-round-ezequiel	2025-05-27 18:46:47.805	\N
118	VIRGIN	qemqp27mjjfgadplwp8ug6gai5xlvbm4k2fi	first-round-ezequiel	2025-05-27 18:46:47.805	\N
119	VIRGIN	llvkjjenswirvtuc0aln4yag1pihep6v1hwe	first-round-ezequiel	2025-05-27 18:46:47.805	\N
120	VIRGIN	5644pmk71v3j2b2vr9k8wqsgiv44fnkh91uo	first-round-ezequiel	2025-05-27 18:46:47.805	\N
121	VIRGIN	uiwphld8kdananadqufajx2a5i1fxp03c9l9	first-round-ezequiel	2025-05-27 18:46:47.805	\N
122	VIRGIN	ibwxkztiugs37r7l1f4ow0oqtl33eoyv9r68	first-round-ezequiel	2025-05-27 18:46:47.805	\N
123	VIRGIN	g8lxdb7evadez6wm7n8mz8aemnxb8l1hmm71	first-round-ezequiel	2025-05-27 18:46:47.805	\N
125	VIRGIN	myfwg3wygl0dq78ydo0nkpwkpvvoosctaz84	first-round-ezequiel	2025-05-27 18:46:47.805	\N
126	VIRGIN	net7hofh9au2c1haeswgtpwcjlc4g0l7dptf	first-round-ezequiel	2025-05-27 18:46:47.805	\N
127	VIRGIN	odubil7wft1iqft92kfee9dq7dnyjpzkq9w8	first-round-ezequiel	2025-05-27 18:46:47.805	\N
128	VIRGIN	snr3uqpah0cx83ji8jiavqeeuewitqs61nv2	first-round-ezequiel	2025-05-27 18:46:47.805	\N
129	VIRGIN	217avlyglmsd6o650gypbat7tef84osl37t9	first-round-ezequiel	2025-05-27 18:46:47.805	\N
130	VIRGIN	9zbkeuqtr3uqs40qj56qmy1k2iyhl0x379k5	first-round-ezequiel	2025-05-27 18:46:47.805	\N
131	VIRGIN	zq5oc0qcuv376f1n23e0zcwsbos5hsnrsg73	first-round-ezequiel	2025-05-27 18:46:47.805	\N
132	VIRGIN	jms6hytpkd6x55jyde4uphp4z3uits1l3icr	first-round-ezequiel	2025-05-27 18:46:47.805	\N
133	VIRGIN	kuikw5qw883hszc3e0z3m8ipdikuxmtc07w4	first-round-ezequiel	2025-05-27 18:46:47.805	\N
134	VIRGIN	7ws5y9s43blct63dyg2f0mc98f9qloh6gwb1	first-round-ezequiel	2025-05-27 18:46:47.805	\N
135	VIRGIN	mkute7iq1dt8qvrewbay11nbv6s0wc27nkab	first-round-ezequiel	2025-05-27 18:46:47.805	\N
136	VIRGIN	t3pymaps0puwiuodvxiqswf3al44b3bnpyde	first-round-ezequiel	2025-05-27 18:46:47.805	\N
137	VIRGIN	qtvyg88ivnfpj0eeh5027kselhwkblfm9z28	first-round-ezequiel	2025-05-27 18:46:47.805	\N
138	VIRGIN	v1pgdke4d4tfymug6w3aqp1ztl2k7kx2m8h6	first-round-ezequiel	2025-05-27 18:46:47.805	\N
139	VIRGIN	u20qjp4e4qidy4vd6h160wqjjuz3gprrd6nf	first-round-ezequiel	2025-05-27 18:46:47.805	\N
140	VIRGIN	h0n5islez3qhfqj143yiiw9rg38500cbdl2r	first-round-ezequiel	2025-05-27 18:46:47.805	\N
141	VIRGIN	rvfewvbh295wwhjioai9h2sp7gy6o4crpu82	first-round-ezequiel	2025-05-27 18:46:47.805	\N
143	VIRGIN	anfkyawjhg6f1mgk3vomo1ixuu6loh79ws6d	first-round-ezequiel	2025-05-27 18:46:47.805	\N
144	VIRGIN	n0q1cmb7qnbm15fim1ab3dysgnf8j63i5owx	first-round-ezequiel	2025-05-27 18:46:47.805	\N
145	VIRGIN	caavczv5mqsi7dfjsexte1bn0orljpwacg7v	first-round-ezequiel	2025-05-27 18:46:47.805	\N
146	VIRGIN	akqsz0spu2hryytc011vk90qo0dljo32p7ul	first-round-ezequiel	2025-05-27 18:46:47.805	\N
147	VIRGIN	vkhk6nl5mhpgk4km3o5a571w90oka4sf2yvf	first-round-ezequiel	2025-05-27 18:46:47.805	\N
148	VIRGIN	a5116amguma41upv3yy0b06ogtzezs00p2zu	first-round-ezequiel	2025-05-27 18:46:47.805	\N
149	VIRGIN	0c7mdm1aojj4m3gplmsbdpzy8vskotsnvadx	first-round-ezequiel	2025-05-27 18:46:47.805	\N
150	VIRGIN	z8bdza7cxsduyndg5b0trm40z6zsqmi44k73	first-round-ezequiel	2025-05-27 18:46:47.805	\N
151	VIRGIN	4id653ekgzebxwaflmd3fby6t69q06hlzqik	first-round-ezequiel	2025-05-27 18:46:47.805	\N
152	VIRGIN	qyalsrk3zmgwtkmfx0w8odz16i250jiuf0ag	first-round-ezequiel	2025-05-27 18:46:47.805	\N
153	VIRGIN	vivx7ot4l3flevou6wv88z71hgjl6t14nc3w	first-round-ezequiel	2025-05-27 18:46:47.805	\N
156	VIRGIN	35f3wa9fprojgbrjnh5q983huotovpfkt6ay	first-round-ezequiel	2025-05-27 18:46:47.805	\N
157	VIRGIN	njrtvmgzgruwfa8j6teg3skbzxn5bfqnjae0	first-round-ezequiel	2025-05-27 18:46:47.805	\N
158	VIRGIN	381p5a4yw9ht64kh5rtt9bq75qflt5yxsq3j	first-round-ezequiel	2025-05-27 18:46:47.805	\N
159	VIRGIN	h7jhp4ep1g2mjiod81qclh3tysjndqmmhyjs	first-round-ezequiel	2025-05-27 18:46:47.805	\N
160	VIRGIN	ithphvfa85j4pp9awz3e14wntruqnv3ycnli	first-round-ezequiel	2025-05-27 18:46:47.805	\N
161	VIRGIN	h5hw9895ukupqotucugu78z5pmpu2yu02ufl	first-round-ezequiel	2025-05-27 18:46:47.805	\N
109	VIRGIN	qa2ebxeralrso6ys0nwwrb4a1hhqpyyd3d6l	first-round-ezequiel	2025-05-27 18:46:47.805	\N
113	ENABLED	7elfvrp69eexyqviweafrrckcgp9wj9ao0mn	first-round-ezequiel	2025-05-27 18:46:47.805	\N
104	REGISTERED	hprhrun603h6aqfv6mqn8h5y8wmy5aga0gpc	first-round-ezequiel	2025-05-27 18:46:47.805	\N
97	ENABLED	iz7vizo6q3umdlste9oi8fapfb8023hk5g8a	resina-first-round	2025-05-27 18:46:47.805	\N
163	VIRGIN	dn797hjozcatkgrz0lks0gw6cfc7nd65avv4	first-round-ezequiel	2025-05-27 18:46:47.805	\N
164	VIRGIN	x5y2sfkd6egwxxooafedzjx4pk6a0zlk550h	first-round-ezequiel	2025-05-27 18:46:47.805	\N
154	ENABLED	862sqexgamm0c5j1s218cz14sdyrtky9uuwo	first-round-ezequiel	2025-05-27 18:46:47.805	\N
108	ENABLED	tv208i4vwk3nejhbbozq8swmqky5910hz3ct	first-round-ezequiel	2025-05-27 18:46:47.805	\N
105	ENABLED	8fvzqpeng5ikcgyugm7083z5oxn64orc970l	first-round-ezequiel	2025-05-27 18:46:47.805	\N
165	VIRGIN	aizq2jtal5wbdyomg1xcn4cebkioqwn0r5ow	first-round-ezequiel	2025-05-27 18:46:47.805	\N
166	VIRGIN	3lpx20affzvu46ei0ud56n724zvx711llyh5	first-round-ezequiel	2025-05-27 18:46:47.805	\N
167	VIRGIN	2ocrsezcrg59bfgrxvjoc1jvn3z1dr3rbfep	first-round-ezequiel	2025-05-27 18:46:47.805	\N
168	VIRGIN	cns18h1xl19gkw3pumzf9ct9knve8qxy06n7	first-round-ezequiel	2025-05-27 18:46:47.805	\N
169	VIRGIN	fpuyb0hnh7xpv2f19va3902uwt63wbjxheqj	first-round-ezequiel	2025-05-27 18:46:47.805	\N
170	VIRGIN	b0ltcrji1rm9c1vkxj45ieoy5k8gv42qmjfr	first-round-ezequiel	2025-05-27 18:46:47.805	\N
171	VIRGIN	9zz0qnad6vdhxqh7xesohkn5d7lcfvmmgo1m	first-round-ezequiel	2025-05-27 18:46:47.805	\N
172	VIRGIN	ge762zcbmnry53bzwghtrsb8uo248smya0yz	first-round-ezequiel	2025-05-27 18:46:47.805	\N
173	VIRGIN	22fheo7o5awbtqvm3hzk6ccyo8gp9sr9ueyw	first-round-ezequiel	2025-05-27 18:46:47.805	\N
174	VIRGIN	upgde6iivu4fstr4r1zjnwr12wac8jgqit36	first-round-ezequiel	2025-05-27 18:46:47.805	\N
175	VIRGIN	27kqih4cie9rplzsb2qew979mhv3jjuzd1or	first-round-ezequiel	2025-05-27 18:46:47.805	\N
176	VIRGIN	9jvievmzqggx21lxzpko8d37gwxczb245l2f	first-round-ezequiel	2025-05-27 18:46:47.805	\N
177	VIRGIN	8bbgyxk7oslnr7qmw3m354881nidfvqr7h0g	first-round-ezequiel	2025-05-27 18:46:47.805	\N
178	VIRGIN	zqc1cd3zsy3b15wfuq2ntraln2thwov9ccke	first-round-ezequiel	2025-05-27 18:46:47.805	\N
179	VIRGIN	mw0au0w6333dpirxfyitr48clisstxbquckg	first-round-ezequiel	2025-05-27 18:46:47.805	\N
180	VIRGIN	rt969iqq6f1v7rl0n5bktumg04b8kneb0326	first-round-ezequiel	2025-05-27 18:46:47.805	\N
181	VIRGIN	eujjeysvbau5ddqgetuajd320fvzoohzxr0u	first-round-ezequiel	2025-05-27 18:46:47.805	\N
182	VIRGIN	jipe12vsg6vgq9ayffnkhumhu0o4f9grf2f8	first-round-ezequiel	2025-05-27 18:46:47.805	\N
183	VIRGIN	rfv1a0t3d0bj2919regwy9mqcubxg74rcndi	first-round-ezequiel	2025-05-27 18:46:47.805	\N
184	VIRGIN	kjcdrzimsin8r82n19iopxmcr57q0is5ozj2	first-round-ezequiel	2025-05-27 18:46:47.805	\N
185	VIRGIN	rcijq5p4kgpzaxjclcd3waighee038m2lure	first-round-ezequiel	2025-05-27 18:46:47.805	\N
186	VIRGIN	h2tbwfay2r82l71zf6aim26enbhuxe730obw	first-round-ezequiel	2025-05-27 18:46:47.805	\N
187	VIRGIN	b1d6jvwb2fbqvl5t60hn5gpxqms6ilwhqgds	first-round-ezequiel	2025-05-27 18:46:47.805	\N
188	VIRGIN	smj107dcvs0p9hxd6802hd7cuto68882xyta	first-round-ezequiel	2025-05-27 18:46:47.805	\N
189	VIRGIN	fv5s14khkikr80naer7qalivntos239z60tv	first-round-ezequiel	2025-05-27 18:46:47.805	\N
190	VIRGIN	y2xexnts6ggdu9itybtw2gdpokkgi1ruuc03	first-round-ezequiel	2025-05-27 18:46:47.805	\N
191	VIRGIN	gzmb3ogzacc635obntuij0scugy8sj6nddji	first-round-ezequiel	2025-05-27 18:46:47.805	\N
192	VIRGIN	69iid692gf4jyt39vfus0w7jru91nbmnb9ds	first-round-ezequiel	2025-05-27 18:46:47.805	\N
193	VIRGIN	czrlvn28opnt7cg8p0vut164ndqorrr20b6q	first-round-ezequiel	2025-05-27 18:46:47.805	\N
194	VIRGIN	mfwwtnmm8ocpqda0cm0sewyx9nhwpkghza1e	first-round-ezequiel	2025-05-27 18:46:47.805	\N
195	VIRGIN	svgz4mdv7ac8m0zryhhlld5xr3hnsxguis1f	first-round-ezequiel	2025-05-27 18:46:47.805	\N
196	VIRGIN	gosc9hafwoiif8e3xtns8h75x252552e9avg	first-round-ezequiel	2025-05-27 18:46:47.805	\N
197	VIRGIN	xk1xgxj4rz12w7dbuzmqkkxjbmynji1ohxic	first-round-ezequiel	2025-05-27 18:46:47.805	\N
198	VIRGIN	jjldev2qs0wj15l0dfb375rid13qb5ishwrc	first-round-ezequiel	2025-05-27 18:46:47.805	\N
199	VIRGIN	wxlpgeya64i4cc0i0x4k48ft2xki3tjs5mr9	first-round-ezequiel	2025-05-27 18:46:47.805	\N
200	VIRGIN	xz7kla83fzpfmn6klk71skcnweduc4ok7uik	first-round-ezequiel	2025-05-27 18:46:47.805	\N
201	VIRGIN	1uod55l4p3od1zki2utoixv74qfpax2pscd6	first-round-ezequiel	2025-05-27 18:46:47.805	\N
202	VIRGIN	k91uze4huz63hzgduq2iph7v25wzky6bgacq	first-round-ezequiel	2025-05-27 18:46:47.805	\N
203	VIRGIN	ew7x5vg9ztwdoy80wkfn5383671zeowkk3up	first-round-ezequiel	2025-05-27 18:46:47.805	\N
204	VIRGIN	qzy6yh70jnydslrvyg6bkglc7q4uizgjwt8s	first-round-ezequiel	2025-05-27 18:46:47.805	\N
205	VIRGIN	eypu5jbslrcqal08lg4thqwgm4ahrwly7s98	first-round-ezequiel	2025-05-27 18:46:47.805	\N
206	VIRGIN	r4f7a4h9e1jmc5ajdnl1vc3fdluiwhdjy479	first-round-ezequiel	2025-05-27 18:46:47.805	\N
207	VIRGIN	eo7oh8ooexlx6983gyxazyl2i66c9xsfuj90	first-round-ezequiel	2025-05-27 18:46:47.805	\N
208	VIRGIN	s8uypvv4l88o9wem4ur8283rdc455lgx2mz5	first-round-ezequiel	2025-05-27 18:46:47.805	\N
209	VIRGIN	akku580z9ga1f3961zyvmgqymd4cyqmkdakz	first-round-ezequiel	2025-05-27 18:46:47.805	\N
210	VIRGIN	zo73cybdpwv6wc737piqhx35u9idmkpyfigt	first-round-ezequiel	2025-05-27 18:46:47.805	\N
211	VIRGIN	cucnq94r9vcwisatsz0jx9qgqk0un4s1la82	first-round-ezequiel	2025-05-27 18:46:47.805	\N
212	VIRGIN	4ifgk0r5ml559klot6bjhr1mo4cbzie8fbaw	first-round-ezequiel	2025-05-27 18:46:47.805	\N
213	VIRGIN	wllk9bvnrgwejxe6u5xt15t4btvg0buvub5a	first-round-ezequiel	2025-05-27 18:46:47.805	\N
214	VIRGIN	h4bgwjvjbw8hrhdczviv5lczn36vbzvfhtbn	first-round-ezequiel	2025-05-27 18:46:47.805	\N
215	VIRGIN	5cphrjl6mbncw94z3lerudu0rvbh8uoryci7	first-round-ezequiel	2025-05-27 18:46:47.805	\N
216	VIRGIN	mrl5fxbh0rxde4n44czv49k6by9qariek9xx	first-round-ezequiel	2025-05-27 18:46:47.805	\N
217	VIRGIN	jqm4iu3nxiioy3x73vnv8k4b05csex9sriib	first-round-ezequiel	2025-05-27 18:46:47.805	\N
218	VIRGIN	t916wyv3qjsr213rcvon14gyyvtskeuyku0t	first-round-ezequiel	2025-05-27 18:46:47.805	\N
219	VIRGIN	7ptha34opgs6ljx46igiii9eqxnvyvd0t6qg	first-round-ezequiel	2025-05-27 18:46:47.805	\N
220	VIRGIN	a8d8j80xyhqw6k18kzvr31l8nxc9kv717yp9	first-round-ezequiel	2025-05-27 18:46:47.805	\N
221	VIRGIN	y29knwu78s2ewrm4q5kixho3na5wmcgahg0s	first-round-ezequiel	2025-05-27 18:46:47.805	\N
222	VIRGIN	qq3rzgrdjn93t6wjqxyysxy1tvy6m3ljrjpd	first-round-ezequiel	2025-05-27 18:46:47.805	\N
223	VIRGIN	vktqiklmi92jmtywu0kf5tc89wj5wrdht3h6	first-round-ezequiel	2025-05-27 18:46:47.805	\N
224	VIRGIN	dtdt4a4fi7uk1zfq711m5uvzt1eks28pyazj	first-round-ezequiel	2025-05-27 18:46:47.805	\N
225	VIRGIN	2ootz6d7j57x3vhfme7ejquoxnywgsmridau	first-round-ezequiel	2025-05-27 18:46:47.805	\N
226	VIRGIN	mp6z5oy4jc2kd7h2o3594zcj2agyyi8bsbkf	first-round-ezequiel	2025-05-27 18:46:47.805	\N
227	VIRGIN	pcifnhjif74qnh9f3s8wibxbrnobed4k2xme	first-round-ezequiel	2025-05-27 18:46:47.805	\N
228	VIRGIN	n4a5v00vuv3hi3rn3fkqulsc1idrvs79htdb	first-round-ezequiel	2025-05-27 18:46:47.805	\N
229	VIRGIN	dz0lmc8bi7ahq7uaeu62tibdfn1pp3yvhhdt	first-round-ezequiel	2025-05-27 18:46:47.805	\N
230	VIRGIN	4us9y6r4uhn1dcql5xaxf2mwia3u98fic0tu	first-round-ezequiel	2025-05-27 18:46:47.805	\N
231	VIRGIN	248txx72tu15zkfvutglj0tgvv1mvoje0bm5	first-round-ezequiel	2025-05-27 18:46:47.805	\N
232	VIRGIN	ffuzj80dzo3iof1zolv8yo3k5am2x6mb9nk0	first-round-ezequiel	2025-05-27 18:46:47.805	\N
233	VIRGIN	f7vlkmorco06jdztglv5m6pyrbsrqt7pt5ie	first-round-ezequiel	2025-05-27 18:46:47.805	\N
234	VIRGIN	gngez2on2t4n6u38bbnv9ipx0yy2xviverz3	first-round-ezequiel	2025-05-27 18:46:47.805	\N
235	VIRGIN	rtgup5blba0uwiwk2vvczudo2rs5wyts4d9x	first-round-ezequiel	2025-05-27 18:46:47.805	\N
236	VIRGIN	cjaplk6sdpzv8i0f6py5pvubyl73146c47is	first-round-ezequiel	2025-05-27 18:46:47.805	\N
237	VIRGIN	1iexkd5b5uxueff18zlkfzmstjnjc7v7w6cx	first-round-ezequiel	2025-05-27 18:46:47.805	\N
238	VIRGIN	0uq5xnqhl83cwdgkcbqn3inlgmi0a5g747so	first-round-ezequiel	2025-05-27 18:46:47.805	\N
239	VIRGIN	e9iqz03j4x8xzga13b8kw0gy45lzviesf3jk	first-round-ezequiel	2025-05-27 18:46:47.805	\N
240	VIRGIN	541ihoyz11fti8rpecxrmsouhebqfgx7r9e4	first-round-ezequiel	2025-05-27 18:46:47.805	\N
241	VIRGIN	8cfvwk4s349x163dhma8ai6ye8lar54rv7sk	first-round-ezequiel	2025-05-27 18:46:47.805	\N
242	VIRGIN	c9nddb73e3i5t6vxah6jjfwb1iopzsaqvl8w	first-round-ezequiel	2025-05-27 18:46:47.805	\N
243	VIRGIN	06xt1rk42mwaz73d64gf90igj6kqexncs1fl	first-round-ezequiel	2025-05-27 18:46:47.805	\N
244	VIRGIN	wxwogswj3tjfrize0x7convi40p0k3ctd1w1	first-round-ezequiel	2025-05-27 18:46:47.805	\N
245	VIRGIN	faj2o0ldcuci7il5b8qyoieg7r5gprfh1e2i	first-round-ezequiel	2025-05-27 18:46:47.805	\N
246	VIRGIN	6jerye36drebfp6sab1j1vfwr743ew9mqee7	first-round-ezequiel	2025-05-27 18:46:47.805	\N
247	VIRGIN	a0r8zzuxb8wd3zfwa58xtruh5byo56qgbcuz	first-round-ezequiel	2025-05-27 18:46:47.805	\N
248	VIRGIN	8me89vlu7gwybjd6pix551memg2gksb3uaj5	first-round-ezequiel	2025-05-27 18:46:47.805	\N
249	VIRGIN	20ltpl1irt7jrpzjj14pozzq0b3xsihvkqzc	first-round-ezequiel	2025-05-27 18:46:47.805	\N
250	VIRGIN	ac01q5tr003fdmkp8hhgqtz2eonuxaxvmll2	first-round-ezequiel	2025-05-27 18:46:47.805	\N
251	VIRGIN	3j8ng21aotbq6048jbi45mufc0jiktrq8c1x	first-round-ezequiel	2025-05-27 18:46:47.805	\N
252	VIRGIN	1gikyfyzakess4dgi9c6655clqcemd2ua6kx	first-round-ezequiel	2025-05-27 18:46:47.805	\N
254	VIRGIN	s4n118121trapk35qak1vtt2aqf08n57evvr	first-round-ezequiel	2025-05-27 18:46:47.805	\N
255	VIRGIN	ipo71i9izda8d0t8qfctrcxr5wuady0ywsk3	first-round-ezequiel	2025-05-27 18:46:47.805	\N
256	VIRGIN	05nyrm2v76cpeq5srwe1z44e9mqr34lbdr70	first-round-ezequiel	2025-05-27 18:46:47.805	\N
257	VIRGIN	6r5w7tvbhhhw08pj9bvq5y1236arvafu47gd	first-round-ezequiel	2025-05-27 18:46:47.805	\N
258	VIRGIN	16ej1m69od1bpb9bl3xt8hupm1wr0e49vam5	first-round-ezequiel	2025-05-27 18:46:47.805	\N
259	VIRGIN	gw96bh6jaf7zc2jhx6d1u7su6v0upb32csqi	first-round-ezequiel	2025-05-27 18:46:47.805	\N
260	VIRGIN	ihjo26kbk9zbvq4x0juoa20j583m4vyy8isr	first-round-ezequiel	2025-05-27 18:46:47.805	\N
261	VIRGIN	mzuoz832rq02up3viq259yu7cmneku6a9ji7	first-round-ezequiel	2025-05-27 18:46:47.805	\N
262	VIRGIN	6s1749mxp3clo1d4yea9jkx8tfnepde9yudf	first-round-ezequiel	2025-05-27 18:46:47.805	\N
263	VIRGIN	7412a87sb2rfw7ppoevjvf5totxc77e7rgvu	first-round-ezequiel	2025-05-27 18:46:47.805	\N
264	VIRGIN	avez3bcbbq1lpt251a3my2szm4nbsu4caftw	first-round-ezequiel	2025-05-27 18:46:47.805	\N
265	VIRGIN	g5fcib6vjgr1hv3y6ix08obuo1xqeo3io44o	first-round-ezequiel	2025-05-27 18:46:47.805	\N
266	VIRGIN	pwz4os346o00ikgshunp8inn1kpq7u4ytlc1	first-round-ezequiel	2025-05-27 18:46:47.805	\N
267	VIRGIN	c1pfut4cqz2ofto39ozexzcdug44de4zit15	first-round-ezequiel	2025-05-27 18:46:47.805	\N
268	VIRGIN	gvy16s4wzqbumg4etze1hx5uy1nuwt1rlg4n	first-round-ezequiel	2025-05-27 18:46:47.805	\N
269	VIRGIN	84p52ptzybuvjpw6aj9y9ru47jtx64l80axq	first-round-ezequiel	2025-05-27 18:46:47.805	\N
270	VIRGIN	2po9b46r97uadhid4dgl2gr26qim5flh9mso	first-round-ezequiel	2025-05-27 18:46:47.805	\N
271	VIRGIN	b9c56rj5wxgaishlt3lj9a9e42zvkhp7nmfy	first-round-ezequiel	2025-05-27 18:46:47.805	\N
272	VIRGIN	wc9m7hws8i9iy5yilxtgbbh2wglozz84uqax	first-round-ezequiel	2025-05-27 18:46:47.805	\N
273	VIRGIN	xtv9si3e7l24uvor63qqe5rb8gzh0abu85jq	first-round-ezequiel	2025-05-27 18:46:47.805	\N
274	VIRGIN	pds2d9cvemxqqao2zwminjv2kb98q2u3pymw	first-round-ezequiel	2025-05-27 18:46:47.805	\N
275	VIRGIN	gpmss0zolk7fl2uk6e9w7cvzqv8fcnrctq7v	first-round-ezequiel	2025-05-27 18:46:47.805	\N
276	VIRGIN	ckch1yb3wi8fdgyzfm8s11l59v24y7hvu170	first-round-ezequiel	2025-05-27 18:46:47.805	\N
277	VIRGIN	0ifsapcfg89gx7hgxlm4hehrvfgg175qfbo6	first-round-ezequiel	2025-05-27 18:46:47.805	\N
278	VIRGIN	6o6ijc0m8anzyy3wkhkykg72nj2lvb9qwevc	first-round-ezequiel	2025-05-27 18:46:47.805	\N
279	VIRGIN	4t0d70s149gybw81t4taw6vho937jpeaxsf8	first-round-ezequiel	2025-05-27 18:46:47.805	\N
280	VIRGIN	xsah4qa4jnoouettga3rqeh7yttk5ee7538j	first-round-ezequiel	2025-05-27 18:46:47.805	\N
281	VIRGIN	d02857r4jjiqu1rqsnd781zj2k6q33my1za8	first-round-ezequiel	2025-05-27 18:46:47.805	\N
282	VIRGIN	6shyy5ewkmr8ynf7rjayjfd9b7xnzmhqo0ts	first-round-ezequiel	2025-05-27 18:46:47.805	\N
283	VIRGIN	riaq06q7jacdubjyjpeki2zoabx8owglofxc	first-round-ezequiel	2025-05-27 18:46:47.805	\N
284	VIRGIN	ou3aawrf9kjunwmvs0vcctfvw7j1wl8j20gr	first-round-ezequiel	2025-05-27 18:46:47.805	\N
285	VIRGIN	2bwotxcfu2ctqhwmjr3jx25ut23k45y328lf	first-round-ezequiel	2025-05-27 18:46:47.805	\N
287	VIRGIN	ietvmgbdch03dh5zdvdtvr4li2okxnriwsyj	first-round-ezequiel	2025-05-27 18:46:47.805	\N
288	VIRGIN	r2ja5m1njyj7zxm7r4irh71q224aurj8iqmx	first-round-ezequiel	2025-05-27 18:46:47.805	\N
289	VIRGIN	2xxotxzdytfxnuftagjc5lttaheig4ntd8zq	first-round-ezequiel	2025-05-27 18:46:47.805	\N
290	VIRGIN	31s30sniz0c42f9tp2zi40etofwrs8pvjxed	first-round-ezequiel	2025-05-27 18:46:47.805	\N
291	VIRGIN	zy0nfwzixcau7el32tw4i3ajwhtlw5cb9f2x	first-round-ezequiel	2025-05-27 18:46:47.805	\N
292	VIRGIN	digdfb6nb9io32kboylksuzscctxhm5rwg7t	first-round-ezequiel	2025-05-27 18:46:47.805	\N
293	VIRGIN	t4xf3nk6cz1kavfvux7ha8s0ex9o9gs5zz1o	first-round-ezequiel	2025-05-27 18:46:47.805	\N
294	VIRGIN	98mh94ywbxqvagmzisyzjzm6zn9a5i3sddbl	first-round-ezequiel	2025-05-27 18:46:47.805	\N
295	VIRGIN	nitm0mg7ubfcvz72u6ovzb7zoowbfluy6t1z	first-round-ezequiel	2025-05-27 18:46:47.805	\N
296	VIRGIN	p9zqsfm01603jlzjhio9ys0fp3a6nof94i3s	first-round-ezequiel	2025-05-27 18:46:47.805	\N
297	VIRGIN	p33bf93kyctc1p04hygbrvcvhgzrlmf1mh4u	genesis	2025-05-27 18:46:47.805	\N
155	ENABLED	y5ppbb0ai9xvqptygr0siq3edpviz7mh1bnm	first-round-ezequiel	2025-05-27 18:46:47.805	\N
21	ENABLED	47kjcx5ox3bc91f3mg7mwdolpaqigro2opsh	genesis	2025-05-27 18:46:47.805	\N
142	REGISTER_PROCESS	yqcvw6b4iq465cnu6t3ryazctg8xelc8l13w	first-round-ezequiel	2025-05-27 18:46:47.805	\N
54	REGISTER_PROCESS	5xcdhecp0s63j14nsompg2yyleyupfbh5e2o	second-round	2025-05-27 18:46:47.805	\N
299	VIRGIN	66e8ef49cdb63daea46dde6a9c99451b85a2	one-medal-from-dashboard	2025-07-25 21:37:29.383	\N
300	VIRGIN	b3cd71bf20bb12e1ebf1388731f35a2bfec5	green-resina-with-middle-layer	2025-07-26 16:34:41.426	\N
298	ENABLED	pumita93	test	2025-06-24 00:18:36.208	\N
301	VIRGIN	3c18a3d9ce7eaec31f1cd6725b6c67c1c2b3	green-resina-with-middle-layer	2025-07-26 16:34:41.438	\N
302	VIRGIN	df1aa44ab19ebc2be49c9b1470d562bfec17	green-resina-with-middle-layer	2025-07-26 16:34:41.445	\N
162	ENABLED	iemofap8ial462ymmjjwz8af9vma2nv0ct14	first-round-ezequiel	2025-05-27 18:46:47.805	\N
303	VIRGIN	cc49f55573c177967382fc2019354da8ebd2	green-resina-with-middle-layer	2025-07-26 16:34:41.451	\N
304	VIRGIN	0aa51aff21f791a05b5e2379dd43f7ecb021	green-resina-with-middle-layer	2025-07-26 16:34:41.457	\N
305	VIRGIN	302212c0b20b881a088911753113563bc64f	green-resina-with-middle-layer	2025-07-26 16:34:41.462	\N
306	VIRGIN	0d023e94e8164d1c5bc5fe770a542172c7ab	green-resina-with-middle-layer	2025-07-26 16:34:41.47	\N
307	VIRGIN	145e457150f7fdbb87e53438ea20d86da495	green-resina-with-middle-layer	2025-07-26 16:34:41.475	\N
308	VIRGIN	c34d98c8107906f4f65405a049c5c5742e72	green-resina-with-middle-layer	2025-07-26 16:34:41.48	\N
286	REGISTER_PROCESS	fmz4khq2wpmzbp46uj7zw1e9fow3tqrfh1b1	first-round-ezequiel	2025-05-27 18:46:47.805	\N
253	VIRGIN	tamdm4n00q5byg685f1f7pzyqdtawjbmgj9f	first-round-ezequiel	2025-05-27 18:46:47.805	\N
309	VIRGIN	d73b72d326abb2c08d8d2f96c217efad1384	green-resina-with-middle-layer	2025-07-26 16:34:41.485	\N
310	VIRGIN	88ddf23f3b23702a63049ad4ff9cb8147a1f	green-resina-with-middle-layer	2025-07-26 16:34:41.492	\N
311	VIRGIN	aa9acd68edd925e74676028c09aff9e5c051	green-resina-with-middle-layer	2025-07-26 16:34:41.498	\N
312	VIRGIN	f9043170d1f4de8bcd2e068d773b65518fb3	first-medal-double-layer-resina	2025-07-28 19:11:29.297	\N
313	VIRGIN	e4007c42c523ecaf6d75fefa1073f4ebaf65	first-medal-double-layer-resina	2025-07-28 19:11:29.313	\N
314	VIRGIN	ce7e9c1fdbcb0e7979d9e8d8fbb41da2eb3e	first-medal-double-layer-resina	2025-07-28 19:11:29.323	\N
315	VIRGIN	afe4cea364ccb59b09a475e17f55a74595ad	first-medal-double-layer-resina	2025-07-28 19:11:29.329	\N
124	VIRGIN	ejfndl0urs380i8iekun3yey576mvsgw28m3	first-round-ezequiel	2025-05-27 18:46:47.805	\N
\.


--
-- Name: medals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.medals_id_seq', 29, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.users_id_seq', 38, true);


--
-- Name: virgin_medals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.virgin_medals_id_seq', 315, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


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
-- Name: medals medals_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.medals
    ADD CONSTRAINT medals_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

