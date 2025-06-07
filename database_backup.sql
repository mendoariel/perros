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
-- Name: MedalState; Type: TYPE; Schema: public; Owner: mendoariel
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


ALTER TYPE public."MedalState" OWNER TO mendoariel;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: mendoariel
--

CREATE TYPE public."Role" AS ENUM (
    'VISITOR',
    'FRIAS_EDITOR',
    'REGISTER'
);


ALTER TYPE public."Role" OWNER TO mendoariel;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: mendoariel
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'PENDING',
    'DISABLED'
);


ALTER TYPE public."UserStatus" OWNER TO mendoariel;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: mendoariel
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


ALTER TABLE public._prisma_migrations OWNER TO mendoariel;

--
-- Name: medals; Type: TABLE; Schema: public; Owner: mendoariel
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


ALTER TABLE public.medals OWNER TO mendoariel;

--
-- Name: medals_id_seq; Type: SEQUENCE; Schema: public; Owner: mendoariel
--

CREATE SEQUENCE public.medals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.medals_id_seq OWNER TO mendoariel;

--
-- Name: medals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mendoariel
--

ALTER SEQUENCE public.medals_id_seq OWNED BY public.medals.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: mendoariel
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


ALTER TABLE public.users OWNER TO mendoariel;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: mendoariel
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO mendoariel;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mendoariel
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: virgin_medals; Type: TABLE; Schema: public; Owner: mendoariel
--

CREATE TABLE public.virgin_medals (
    id integer NOT NULL,
    status public."MedalState" NOT NULL,
    medal_string text NOT NULL,
    register_hash text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone
);


ALTER TABLE public.virgin_medals OWNER TO mendoariel;

--
-- Name: virgin_medals_id_seq; Type: SEQUENCE; Schema: public; Owner: mendoariel
--

CREATE SEQUENCE public.virgin_medals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.virgin_medals_id_seq OWNER TO mendoariel;

--
-- Name: virgin_medals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mendoariel
--

ALTER SEQUENCE public.virgin_medals_id_seq OWNED BY public.virgin_medals.id;


--
-- Name: medals id; Type: DEFAULT; Schema: public; Owner: mendoariel
--

ALTER TABLE ONLY public.medals ALTER COLUMN id SET DEFAULT nextval('public.medals_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: mendoariel
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: virgin_medals id; Type: DEFAULT; Schema: public; Owner: mendoariel
--

ALTER TABLE ONLY public.virgin_medals ALTER COLUMN id SET DEFAULT nextval('public.virgin_medals_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: mendoariel
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
92162c20-fd44-4233-be1c-4ba1fa8b7734	90a3d9f693c726e738af3f27942597d1090837c767f08a3d0c64c0e79ae10085	2025-06-07 01:32:42.694784+00	20250212125507_add_status_registered_for_medals	\N	\N	2025-06-07 01:32:42.691317+00	1
98cc9268-7530-4aa7-99a2-eefa2ada927b	fb14918d28facaeaaced783304f7f3990dbd6b3ecb878b04598684118dcbef65	2025-06-07 01:32:42.376728+00	20240523202948_first	\N	\N	2025-06-07 01:32:42.349969+00	1
07394e2d-d471-4b7a-a10a-6876f783ecca	bb1c851264c2c75e4178c62823fbdf35d057ab84f4728043f1fcb4bc168427a0	2025-06-07 01:32:42.534145+00	20250205222948_update	\N	\N	2025-06-07 01:32:42.525624+00	1
3ab0fc2a-df9f-4b74-a522-2e6f1c2be250	af7bc931cf585214d2edf46be64d1bcdf413b38f82bffcc6b029495ab2117fd9	2025-06-07 01:32:42.388092+00	20240524135120_add_username	\N	\N	2025-06-07 01:32:42.379663+00	1
e03c2704-87fe-4399-8b5c-5539024a75fe	1662fdc87e508924c7d85c684076a44dbe860488d9d4884fc2a283f1d52333d3	2025-06-07 01:32:42.399661+00	20240603180619_role_enum	\N	\N	2025-06-07 01:32:42.391308+00	1
df7f262c-2d71-466d-b547-d6527dec9eb3	0b729b6bc23b71080fce0754a58337b3254f66186809a3cfa3c26b00e4ece558	2025-06-07 01:32:42.638485+00	20250210132518_new	\N	\N	2025-06-07 01:32:42.633953+00	1
36ebd93a-509d-4f75-882b-0ad535ce4f24	0178969a40f0d3d36e996bd1dce011ec7478dc6021226911ff6109b5d56089e7	2025-06-07 01:32:42.41275+00	20240604194136_change_superpower	\N	\N	2025-06-07 01:32:42.402371+00	1
91bbecd0-4fd3-4e14-b7ab-da4784c592b9	79a1103d2ed60f3f3126f86bbfd8a83ab6158561615224400231005c3871b64e	2025-06-07 01:32:42.54863+00	20250206125527_new_migration	\N	\N	2025-06-07 01:32:42.536474+00	1
50b74b68-3b8a-4556-a070-fcfdb0fc3237	2f251faa7ed276e2abece1cba3ca00605d1abcf659576c4bb8d0f2140fc55b47	2025-06-07 01:32:42.423705+00	20240625163121_add_hash_password_recovery	\N	\N	2025-06-07 01:32:42.417031+00	1
82bf203c-fa58-4c2c-b42d-ebcacc27697e	1a671b1e1d64b829cc0380c9ad6e7ffc91779af4ac51d6fb5bf28719e0e4db6a	2025-06-07 01:32:42.43956+00	20250203195901_create_medals_table	\N	\N	2025-06-07 01:32:42.42737+00	1
61fdc246-98b9-4fec-a6ba-51da01c1eb7c	f4eea05bd42700a5ddb71b9367495463889c4c926b6bf9c363a2cc5f8a9bf416	2025-06-07 01:32:42.448229+00	20250203200852_fix_medal_table	\N	\N	2025-06-07 01:32:42.44166+00	1
30be3035-2369-496e-8e04-2becae58253e	ccebed371765ea9aa8d19e8e1096bff94c4eb4fa6b03e548f71de990dea3c53c	2025-06-07 01:32:42.560692+00	20250207131538_create_relationship	\N	\N	2025-06-07 01:32:42.550445+00	1
aabc38f7-6cf9-4eec-aed4-4c1f3f1b24ea	4419ed7b149fd85bec442cfd2e5465165c097280466eb784a5de7080157d73b4	2025-06-07 01:32:42.456093+00	20250205154515_add_hash_register_into_table_medal	\N	\N	2025-06-07 01:32:42.450361+00	1
46c950bd-2877-4ea8-8cdb-ff89949f9ab6	c7f38867468994672f9b8650c6a2723df86d2077c3bfe31062fd35f01ffe81a5	2025-06-07 01:32:42.463863+00	20250205175150_add_a_status_register_process	\N	\N	2025-06-07 01:32:42.458508+00	1
fe5d8b46-6345-49e9-b4f6-b4decb0c4539	122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec	2025-06-07 01:32:42.469917+00	20250205213228_migrate_to_fix	\N	\N	2025-06-07 01:32:42.465471+00	1
ba1da530-8a45-4d99-8ac3-b871d0f8d872	4be05d75cc16ce90f1ebda6ea12dc74bfb8af5bcf866a70416a337bc2d65eb7d	2025-06-07 01:32:42.570383+00	20250207134701_relationship_2	\N	\N	2025-06-07 01:32:42.564157+00	1
538b01b4-df6b-4d6c-9fd2-ba21c014a035	7cc733cb96be5cf3660f81fe84f30b973aefc0196164e761df0d25d24eafdbb4	2025-06-07 01:32:42.499349+00	20250205220458_	\N	\N	2025-06-07 01:32:42.471692+00	1
0c0f3662-8042-4b86-8b6e-3dbd83e57976	fba3fdedffcebcb440baa0c0a757fd8245353ca357016516311f5e2b64151dc4	2025-06-07 01:32:42.513011+00	20250205220807_new	\N	\N	2025-06-07 01:32:42.505459+00	1
a82bb9ae-d4f7-4bca-9fd8-87fcaa7fb500	6accebd3bed00887f78a9fdcfff4f7670b047f6b2a77bee6f118a9a9afeda7a5	2025-06-07 01:32:42.647687+00	20250210153117_use_user_table	\N	\N	2025-06-07 01:32:42.6405+00	1
1471b458-2662-4c68-98f3-0b97385fc3bb	c6cedeb28c17bff2a99f615aaa08ff4e49046a71f2c6af2a8366a3b36154e07f	2025-06-07 01:32:42.523359+00	20250205222901_more_changes	\N	\N	2025-06-07 01:32:42.516157+00	1
ae6be816-4778-45bd-b8f1-2201f9494bae	f4d7aab64ed356eb2d010e4cf9de4015b2990ee1a93e816c95a25badfcfbb5d5	2025-06-07 01:32:42.588914+00	20250207141115_new_migration	\N	\N	2025-06-07 01:32:42.573198+00	1
e8dafb5f-fdc7-4d9b-b2a0-299a937a9464	1988b7102925ae459f3b5ffe022c57b1c13466215c2a89b63edc4f254330b5da	2025-06-07 01:32:42.600772+00	20250207164913_	\N	\N	2025-06-07 01:32:42.59056+00	1
92dcfe8c-e2c3-4c59-8f09-32e84aade2bd	935fbaec6cd4b9381d043544bcbfa7023bc55ea2f6d89bd813d0d4201a0a100f	2025-06-07 01:32:42.617317+00	20250207225857_new	\N	\N	2025-06-07 01:32:42.60322+00	1
0dd6643f-4325-4814-a008-1938d5f0cb6f	d0c279bd9bfa23c16e4df0e56dae2fd70b3f8f8b462fb06d88fae6d00b6dffa7	2025-06-07 01:32:42.656025+00	20250210154702_change_name_state	\N	\N	2025-06-07 01:32:42.649694+00	1
b7886edb-6cf4-455c-b53b-f0277fb634d4	92bb2fb38a341a41821489d105057d603abf67e2efbc43e7f7778cd98c6facbd	2025-06-07 01:32:42.625082+00	20250207235203_user_status	\N	\N	2025-06-07 01:32:42.619855+00	1
fa8de04c-a83b-4854-809e-0b36b754d087	c9f9a023c7db127a3a3c2eb9832e2a7d855ffd8abea74dad65d5a9181561cf4e	2025-06-07 01:32:42.632376+00	20250208000558_name_pet_add	\N	\N	2025-06-07 01:32:42.62755+00	1
1881e66f-5e15-4fae-aa08-471f8d13f718	1747df81adb58e612a2a35d560f1e776902529971a4d073396e541306534511a	2025-06-07 01:32:42.70102+00	20250212152437_name_pet	\N	\N	2025-06-07 01:32:42.696773+00	1
d2dab870-aa89-47dc-abb5-12fa01f3cf65	ccbc7a792b5f909a0069813d2963fd1375f9fb9c052b7a2d7a78c00ac44fb02a	2025-06-07 01:32:42.663422+00	20250210171208_use_user_table	\N	\N	2025-06-07 01:32:42.65777+00	1
85eeae57-8e91-49ef-a687-84a88576042c	ef7a3e1e3546e9635e290e87f000ad0bed7d35b417c6b4b4c03bc19e57f75902	2025-06-07 01:32:42.687804+00	20250211164257_tuesday_11_migration	\N	\N	2025-06-07 01:32:42.666422+00	1
1b99d4dc-ecb3-4a14-b3b2-8e4db488fadd	27a9b546fa4fac8d4c2db069fc910fd886f8c4fe3e33842594ae9f710e985ea5	2025-06-07 01:32:42.723256+00	20250311182708_add_phone_and_description	\N	\N	2025-06-07 01:32:42.71584+00	1
06805362-aaf7-43fc-b137-9e11b9a32ff9	01348597f415540d15308f2a043308fbcf49613445643fc6421d627cf0a2f8d2	2025-06-07 01:32:42.706403+00	20250222212635_update_optional	\N	\N	2025-06-07 01:32:42.703345+00	1
44398214-1a7d-4bdd-8c62-0f84a13585b3	fcde0a0bcde85b44462f1650a4a1360f6090b684e5fae98bcab95b93c1b2b533	2025-06-07 01:32:42.73894+00	20250527182942_maps_names	\N	\N	2025-06-07 01:32:42.731771+00	1
9539197f-5e98-494b-b8fc-01b479a22f8d	8f78bc2a35fe922fb8e14a6bda599877085e75a914ed3e086e1ddf5e59b10e8e	2025-06-07 01:32:42.712745+00	20250222215600_images_fiel_into_medals	\N	\N	2025-06-07 01:32:42.708978+00	1
7fbf5e14-3326-4de6-8ea8-3c54d50e9520	f22d85a61ed01ac17ecbe7a3556053bb58960f166ec912f93b84f0df5fbe4bda	2025-06-07 01:32:42.728763+00	20250311184006_optional_description_of_the_medal	\N	\N	2025-06-07 01:32:42.725009+00	1
\.


--
-- Data for Name: medals; Type: TABLE DATA; Schema: public; Owner: mendoariel
--

COPY public.medals (id, status, image, description, medal_string, pet_name, register_hash, created_at, owner_id, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: mendoariel
--

COPY public.users (id, email, hash, username, role, hash_to_register, phonenumber, created_at, hash_password_recovery, hashed_rt, updated_at, user_status) FROM stdin;
\.


--
-- Data for Name: virgin_medals; Type: TABLE DATA; Schema: public; Owner: mendoariel
--

COPY public.virgin_medals (id, status, medal_string, register_hash, created_at, updated_at) FROM stdin;
\.


--
-- Name: medals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mendoariel
--

SELECT pg_catalog.setval('public.medals_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mendoariel
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: virgin_medals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: mendoariel
--

SELECT pg_catalog.setval('public.virgin_medals_id_seq', 1, false);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: mendoariel
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: medals medals_pkey; Type: CONSTRAINT; Schema: public; Owner: mendoariel
--

ALTER TABLE ONLY public.medals
    ADD CONSTRAINT medals_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: mendoariel
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: virgin_medals virgin_medals_pkey; Type: CONSTRAINT; Schema: public; Owner: mendoariel
--

ALTER TABLE ONLY public.virgin_medals
    ADD CONSTRAINT virgin_medals_pkey PRIMARY KEY (id);


--
-- Name: medals_medal_string_key; Type: INDEX; Schema: public; Owner: mendoariel
--

CREATE UNIQUE INDEX medals_medal_string_key ON public.medals USING btree (medal_string);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: mendoariel
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: virgin_medals_medal_string_key; Type: INDEX; Schema: public; Owner: mendoariel
--

CREATE UNIQUE INDEX virgin_medals_medal_string_key ON public.virgin_medals USING btree (medal_string);


--
-- Name: medals medals_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mendoariel
--

ALTER TABLE ONLY public.medals
    ADD CONSTRAINT medals_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

