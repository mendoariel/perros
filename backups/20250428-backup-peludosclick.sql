--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4 (Debian 10.4-2.pgdg90+1)
-- Dumped by pg_dump version 12.4

-- Started on 2025-04-28 19:58:52 UTC

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
-- TOC entry 511 (class 1247 OID 16387)
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
-- TOC entry 514 (class 1247 OID 16404)
-- Name: Role; Type: TYPE; Schema: public; Owner: Silvestre1993
--

CREATE TYPE public."Role" AS ENUM (
    'VISITOR',
    'FRIAS_EDITOR',
    'REGISTER'
);


ALTER TYPE public."Role" OWNER TO "Silvestre1993";

--
-- TOC entry 596 (class 1247 OID 16412)
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: Silvestre1993
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'PENDING',
    'DISABLED'
);


ALTER TYPE public."UserStatus" OWNER TO "Silvestre1993";

SET default_tablespace = '';

--
-- TOC entry 196 (class 1259 OID 16419)
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
-- TOC entry 197 (class 1259 OID 16427)
-- Name: medals; Type: TABLE; Schema: public; Owner: Silvestre1993
--

CREATE TABLE public.medals (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ownerId" integer NOT NULL,
    status public."MedalState" NOT NULL,
    image text,
    description text,
    medal_string text NOT NULL,
    pet_name text NOT NULL,
    register_hash text NOT NULL
);


ALTER TABLE public.medals OWNER TO "Silvestre1993";

--
-- TOC entry 198 (class 1259 OID 16435)
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
-- TOC entry 2909 (class 0 OID 0)
-- Dependencies: 198
-- Name: medals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Silvestre1993
--

ALTER SEQUENCE public.medals_id_seq OWNED BY public.medals.id;


--
-- TOC entry 199 (class 1259 OID 16437)
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
    hash_to_register text NOT NULL,
    phonenumber text
);


ALTER TABLE public.users OWNER TO "Silvestre1993";

--
-- TOC entry 200 (class 1259 OID 16445)
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
-- TOC entry 2910 (class 0 OID 0)
-- Dependencies: 200
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Silvestre1993
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 201 (class 1259 OID 16447)
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
-- TOC entry 202 (class 1259 OID 16454)
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
-- TOC entry 2911 (class 0 OID 0)
-- Dependencies: 202
-- Name: virgin_medals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Silvestre1993
--

ALTER SEQUENCE public.virgin_medals_id_seq OWNED BY public.virgin_medals.id;


--
-- TOC entry 2758 (class 2604 OID 16478)
-- Name: medals id; Type: DEFAULT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.medals ALTER COLUMN id SET DEFAULT nextval('public.medals_id_seq'::regclass);


--
-- TOC entry 2761 (class 2604 OID 16479)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 2763 (class 2604 OID 16480)
-- Name: virgin_medals id; Type: DEFAULT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.virgin_medals ALTER COLUMN id SET DEFAULT nextval('public.virgin_medals_id_seq'::regclass);


--
-- TOC entry 2897 (class 0 OID 16419)
-- Dependencies: 196
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

INSERT INTO public._prisma_migrations VALUES ('41ef7d7a-e2ad-4cf1-9e90-6c5fbe539b1b', 'e4dc2e7923f88bd05bc0b80859d5603eeae8f22d2e3d7cc4e541622f365c87ca', '2025-03-11 18:26:50.38469+00', '20250212125507_add_status_registered_for_medals', NULL, NULL, '2025-03-11 18:26:50.375797+00', 1);
INSERT INTO public._prisma_migrations VALUES ('e80ec86e-822f-4cc0-b1ed-a31e5fd9108d', '0f5fe52e5b4e4e09826457806407c4930a7e68d33ed4dafa6e6d3fdbb8da101a', '2025-03-11 18:26:49.648448+00', '20240523202948_first', NULL, NULL, '2025-03-11 18:26:49.615103+00', 1);
INSERT INTO public._prisma_migrations VALUES ('b93ce63b-a306-4923-9902-333c998fbe1c', 'c9f7bb1edc78fa1d18b98b27be73c2d4b93a109f8f7b1cd675159a865298d6a2', '2025-03-11 18:26:49.963298+00', '20250205222948_update', NULL, NULL, '2025-03-11 18:26:49.952099+00', 1);
INSERT INTO public._prisma_migrations VALUES ('ded42f91-e1d8-45c5-9c14-d7233f113dd5', 'd462e403b8c4a7ab0b12fa23a9623bb9b88e92c25b0470f6d05f4aae444f576e', '2025-03-11 18:26:49.669548+00', '20240524135120_add_username', NULL, NULL, '2025-03-11 18:26:49.656902+00', 1);
INSERT INTO public._prisma_migrations VALUES ('1ae067fd-edec-4c6f-b476-249c5fc4ebb7', '20f87d8630bd6f59c6ee1243c486f42d13d20b8f9b9509c6a390df94c92264fb', '2025-03-11 18:26:49.693443+00', '20240603180619_role_enum', NULL, NULL, '2025-03-11 18:26:49.679925+00', 1);
INSERT INTO public._prisma_migrations VALUES ('465d0aa7-1770-43ce-a211-4e0bddd516b8', 'c1f99934b076da76496ab70b4e2bc6e6661c696e88a9eb4c18e65061d9f87f3a', '2025-03-11 18:26:50.170223+00', '20250210132518_new', NULL, NULL, '2025-03-11 18:26:50.16335+00', 1);
INSERT INTO public._prisma_migrations VALUES ('fe087416-4e0d-480b-be37-7a83ed633f6f', '30e7b2e6af0e3fc7572731f587c32d674ab0195b5257faf4a16fafb3bd50e0c1', '2025-03-11 18:26:49.724293+00', '20240604194136_change_superpower', NULL, NULL, '2025-03-11 18:26:49.710544+00', 1);
INSERT INTO public._prisma_migrations VALUES ('5d0d4921-7f94-4f83-b579-763d5ac5b4e2', '145dae3b351e8851a28061cf2cdf1367c85d22d80c7b09b535c13de6ce8d6c43', '2025-03-11 18:26:50.001589+00', '20250206125527_new_migration', NULL, NULL, '2025-03-11 18:26:49.972642+00', 1);
INSERT INTO public._prisma_migrations VALUES ('07ea8bf4-7add-4086-85ac-896180e06ce4', '998c61cd1c97e3517ed889a1a43167e451d6a8005b0353feb694cb125adc2c30', '2025-03-11 18:26:49.750233+00', '20240625163121_add_hash_password_recovery', NULL, NULL, '2025-03-11 18:26:49.740497+00', 1);
INSERT INTO public._prisma_migrations VALUES ('4032697b-2067-49aa-8cd6-9c80e991c2ff', '709dd600716baf7be99c35351491a64892af32236729555355f78d2aa3f7fe38', '2025-03-11 18:26:49.790656+00', '20250203195901_create_medals_table', NULL, NULL, '2025-03-11 18:26:49.765983+00', 1);
INSERT INTO public._prisma_migrations VALUES ('6ec5caa9-0eb0-4e0e-b758-ec3a27b0dc4d', 'ed5ca9cfac750098cb9535a054fe972157304241289e523bf69c5823d7f816c2', '2025-03-11 18:26:49.816981+00', '20250203200852_fix_medal_table', NULL, NULL, '2025-03-11 18:26:49.801561+00', 1);
INSERT INTO public._prisma_migrations VALUES ('56f0f0d0-e711-4ffe-907e-a2a5b508d4d7', 'd1dde96bbaf11345d0d8d2738f0790e31b2f6fda0af980d9f4982484a17d3f62', '2025-03-11 18:26:50.021929+00', '20250207131538_create_relationship', NULL, NULL, '2025-03-11 18:26:50.007286+00', 1);
INSERT INTO public._prisma_migrations VALUES ('2c070705-1272-47cb-91ff-df468990b922', '14b281eed199b5f9857033ff6ed5d5be498490d5f42248b572700cbeeb03b413', '2025-03-11 18:26:49.839172+00', '20250205154515_add_hash_register_into_table_medal', NULL, NULL, '2025-03-11 18:26:49.827562+00', 1);
INSERT INTO public._prisma_migrations VALUES ('b75c558d-e80f-450a-8e7f-30e4f32464ee', '82e10a158c563021cc28eba2c28a710adc6b205ec6836ccdf446737729d32b29', '2025-03-11 18:26:49.861053+00', '20250205175150_add_a_status_register_process', NULL, NULL, '2025-03-11 18:26:49.849771+00', 1);
INSERT INTO public._prisma_migrations VALUES ('64362814-ea87-4393-8c80-c842cb2a4846', '122d743a0403e77ad7e0ed9447f5b8826f2fbdbc55612d936eff004dd13c2eec', '2025-03-11 18:26:49.881362+00', '20250205213228_migrate_to_fix', NULL, NULL, '2025-03-11 18:26:49.872648+00', 1);
INSERT INTO public._prisma_migrations VALUES ('264e639c-0dd3-447b-a78c-13c247284a9d', '820e3fd2d0c8bf306c1701b5358e9c6dbe211b8732f71ebd28617643bb84cb4d', '2025-03-11 18:26:50.038514+00', '20250207134701_relationship_2', NULL, NULL, '2025-03-11 18:26:50.02967+00', 1);
INSERT INTO public._prisma_migrations VALUES ('3282a483-4c2a-4ddc-ab66-c7e6af93956c', 'de1f34db7688e6a8e247e41c70d659957646f945c3e19f2d8126bf8ff0677034', '2025-03-11 18:26:49.908788+00', '20250205220458_', NULL, NULL, '2025-03-11 18:26:49.890458+00', 1);
INSERT INTO public._prisma_migrations VALUES ('4b352ae6-5ef0-4e64-a229-5be11041de35', '878be35c74a33f78d52ad4d233efa2524c6c1fe795679723ac4ecf5b99cd7737', '2025-03-11 18:26:49.923917+00', '20250205220807_new', NULL, NULL, '2025-03-11 18:26:49.915435+00', 1);
INSERT INTO public._prisma_migrations VALUES ('62abc74f-142b-4783-bd10-c19b72c94460', '431cc4d710da6a863f8a335e73d80a5e43a9bd8cf852f98ed0de8799d4421da4', '2025-03-11 18:26:50.20608+00', '20250210153117_use_user_table', NULL, NULL, '2025-03-11 18:26:50.176831+00', 1);
INSERT INTO public._prisma_migrations VALUES ('ed7fc347-dd71-42a5-bf76-80ee2b4fffac', '356febd53eb3d96ef8fd97231e02fe3f46d0550365258b80924422cce24883f5', '2025-03-11 18:26:49.940751+00', '20250205222901_more_changes', NULL, NULL, '2025-03-11 18:26:49.930156+00', 1);
INSERT INTO public._prisma_migrations VALUES ('d72e0705-4cde-49c6-9424-7b429731248f', '41e0a66d79744698d1be06e11c9c1491801ab2398d8c91236783466c76d16fc1', '2025-03-11 18:26:50.06882+00', '20250207141115_new_migration', NULL, NULL, '2025-03-11 18:26:50.045009+00', 1);
INSERT INTO public._prisma_migrations VALUES ('b44e8681-6b14-4c0f-ad5e-b063e5e81f8d', 'c7baa6754bf39fb376bed40c56712756fdc30a8c5eff12dde4b234bf8450522a', '2025-03-11 18:26:50.094662+00', '20250207164913_', NULL, NULL, '2025-03-11 18:26:50.075263+00', 1);
INSERT INTO public._prisma_migrations VALUES ('564b3982-7f9d-4200-94b0-8c257008d5e2', '3f104ae44d7fd709e0d366e284b5ff4ed83e9789406a78e6b3474a4713632d22', '2025-03-11 18:26:50.126543+00', '20250207225857_new', NULL, NULL, '2025-03-11 18:26:50.101136+00', 1);
INSERT INTO public._prisma_migrations VALUES ('fe360145-d15f-4dfe-8f0e-184c85a172c9', 'e9c73ffcaef818c7e83b4d51d8a849e4fe688b7517e6f7c74436aea5dfa8f8cd', '2025-03-11 18:26:50.252491+00', '20250210154702_change_name_state', NULL, NULL, '2025-03-11 18:26:50.23278+00', 1);
INSERT INTO public._prisma_migrations VALUES ('d8a97b4f-ce85-449a-b781-9d37c85e057a', '054e14c466b1e8fdc2a5600f07ac1ad5421e4b7ee29742ce7e68bbe6b1fa700c', '2025-03-11 18:26:50.144045+00', '20250207235203_user_status', NULL, NULL, '2025-03-11 18:26:50.135117+00', 1);
INSERT INTO public._prisma_migrations VALUES ('17038ee7-3436-4602-8c79-64e6e9c14597', 'c2afddf11532679d597ed1939cf113b5477c334055964c9bf43a64491cd6b89e', '2025-03-11 18:26:50.157731+00', '20250208000558_name_pet_add', NULL, NULL, '2025-03-11 18:26:50.150485+00', 1);
INSERT INTO public._prisma_migrations VALUES ('a03e0599-45e2-4cc2-84a3-d09ed9e8c041', '14f981c392c53d7a1f1a9a07aec82369399f812e2e55c8489285ecfc888a4df2', '2025-03-11 18:26:50.404005+00', '20250212152437_name_pet', NULL, NULL, '2025-03-11 18:26:50.394547+00', 1);
INSERT INTO public._prisma_migrations VALUES ('9a7c11ed-cba0-436a-a3a6-1272a1105e36', '8d381838ba5668bca6199520fadc126483d583e375f07dcffe3b2937800eb37f', '2025-03-11 18:26:50.287264+00', '20250210171208_use_user_table', NULL, NULL, '2025-03-11 18:26:50.271029+00', 1);
INSERT INTO public._prisma_migrations VALUES ('2560dd9b-164d-48d6-8365-dd79a6b26766', '095760147bd08ac9cb22489f544dbe3749e623f5d2b29faa34e1d00c604c8ede', '2025-03-11 18:26:50.366992+00', '20250211164257_tuesday_11_migration', NULL, NULL, '2025-03-11 18:26:50.306285+00', 1);
INSERT INTO public._prisma_migrations VALUES ('f39626ea-2a74-4db9-852f-dece05ee713a', '27a9b546fa4fac8d4c2db069fc910fd886f8c4fe3e33842594ae9f710e985ea5', '2025-03-11 18:27:08.610617+00', '20250311182708_add_phone_and_description', NULL, NULL, '2025-03-11 18:27:08.587625+00', 1);
INSERT INTO public._prisma_migrations VALUES ('9eaad3e0-11de-498c-8527-56816dfe9ed8', 'df77ee8453dc6e44e1c398542f365adac422e55320ea78e6bb1c5043980f0030', '2025-03-11 18:26:50.423265+00', '20250222212635_update_optional', NULL, NULL, '2025-03-11 18:26:50.413669+00', 1);
INSERT INTO public._prisma_migrations VALUES ('9e5c6d0f-1535-458f-9424-50d5122a17c0', 'f0670c0f144a3e66bf11a00a217a7926160ca5892a7ceb48802ecdc43a618c55', '2025-03-11 18:26:50.442688+00', '20250222215600_images_fiel_into_medals', NULL, NULL, '2025-03-11 18:26:50.432414+00', 1);
INSERT INTO public._prisma_migrations VALUES ('182dfd26-c078-4ccc-a113-182a90197ab2', 'f22d85a61ed01ac17ecbe7a3556053bb58960f166ec912f93b84f0df5fbe4bda', '2025-03-11 18:40:06.695854+00', '20250311184006_optional_description_of_the_medal', NULL, NULL, '2025-03-11 18:40:06.685735+00', 1);


--
-- TOC entry 2898 (class 0 OID 16427)
-- Dependencies: 197
-- Data for Name: medals; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

INSERT INTO public.medals VALUES (1, '2025-03-04 00:25:32.841', '2025-04-08 13:03:14.628', 1, 'ENABLED', 'secrectIMG-20250301-WA0000.jpg', 'Vivo en el barrio Supe', 'rosa_mosqueta', 'Rosa Mosqueta', 'czddiglfpeyukzsejxazd03b4a5r26wunyt5');
INSERT INTO public.medals VALUES (2, '2025-03-04 01:01:09.304', '2025-03-04 01:03:55.396', 2, 'ENABLED', 'secrectScreenshot_20250303-220346.Fotos.png', 'Gato macho adulto color vaquita', 'celeste', 'Silvestre', '6s2h438u4k1abfosmyfrgicd1d7dkue5qfs2');
INSERT INTO public.medals VALUES (13, '2025-04-08 16:33:06.449', '2025-04-08 16:35:59.661', 13, 'ENABLED', '20250408163534-fp5unpiqo8h780.jpg', 'Gata adulta castrada ', 'p33bf93kyctc1p04hygbrvcvhgzrlmf1mh4u', 'Pilar', 'genesis');
INSERT INTO public.medals VALUES (19, '2025-04-27 01:58:55.038', '2025-04-27 02:05:57.509', 19, 'ENABLED', '202504272122-vbragjdej5mvez.jpg', 'Hola me llamo Ciro Jofré!!!
Si me encuentras por favor, llamar a mi papá Daniel y mi mamá Elva. Ellos me van a estar buscando ', 'zj07h8bybkl4gcafzw1ex1glxpqymt4d2k22', 'Ciro', 'genesis');
INSERT INTO public.medals VALUES (12, '2025-04-08 13:40:25.082', '2025-04-08 13:40:25.082', 12, 'ENABLED', 'pamela.png', 'Vivo en cuarta sección soy hembra adulta, castrada', 'aosaxmu3oqpvraz11ib9dxvw8g1qj5cvkey8', 'Pamela', 'genesis');
INSERT INTO public.medals VALUES (15, '2025-04-09 17:33:04.394', '2025-04-09 17:45:18.345', 15, 'INCOMPLETE', '20250409173722-9l1n676qan87cv.jpg', 'Gata adopatada', '5uewbvnpaumkzkjfwg5kyh9cc6j8klla8mqe', 'Sofia', 'genesis');
INSERT INTO public.medals VALUES (14, '2025-04-09 12:56:17.652', '2025-04-09 19:09:18.264', 14, 'ENABLED', '2025040913011-mrbjepdlbeo3pd.jpg', 'Perro mediano pelo color gris blanco y marrón claro  le falta uno ojo. ', 'o86c320roj50qstp2y76x3d9slma8g7u2v3r', 'Aukan', 'genesis');
INSERT INTO public.medals VALUES (16, '2025-04-09 22:32:40.19', '2025-04-09 22:45:54.317', 16, 'ENABLED', '20250409224327-ew6izcj0c85r8g.jpg', 'Hembra adulta, castrada tamaño grande.', 'bem5kkpbaxv9uhr4hmd4ztcu7pmnz9ar4rxp', 'NIna', 'genesis');
INSERT INTO public.medals VALUES (17, '2025-04-11 23:23:08.727', '2025-04-11 23:29:32.15', 17, 'ENABLED', '20250411232930-jjjjszap054tq0.jpg', 'Caniche chico con manchas negras', 't75kly5rf7zkngcjvka31zyltnni3nerdevy', 'Champucito', 'genesis');
INSERT INTO public.medals VALUES (18, '2025-04-23 23:53:42.708', '2025-04-23 23:59:23.376', 18, 'ENABLED', '20250423235710-7c3zi591vatjhg.jpg', 'Perro macho, con un solo ojito, color marrón con blanco,', 'qlp5dgnztepx96slvi2q2oo096c1u9axwiwi', 'Ramon', 'genesis');


--
-- TOC entry 2900 (class 0 OID 16437)
-- Dependencies: 199
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

INSERT INTO public.users VALUES (2, '2025-03-04 01:01:09.304', '2025-03-20 23:21:09.37', 'Ara.frazetto@gmail.com', '$2a$10$scT7hAKFNyPbsbPa3ZExGODiyL9iumZcamLADvGVviYLuuiYQuAK6', '$2a$10$V8VzO/o2VGrXGS9lz4jAcuKwv6OpijwAVJ0xUp1uva51QaTljmGVy', NULL, 'VISITOR', NULL, 'ACTIVE', '5g36ncsemusmvb0gdc3jv3cjizde02tnh6sn', '2615597976');
INSERT INTO public.users VALUES (1, '2025-03-04 00:25:32.841', '2025-04-08 13:05:45.315', 'mendoariel@hotmail.com', '$2a$10$S5RLh71P3TGG.jr125Hgdu.GlJ.5p5Abqd5k7JWsxu1hPb1.Fmqo6', NULL, NULL, 'VISITOR', NULL, 'ACTIVE', '4nvdw7yw5t3omgno21roy7rk2mx6py6do5t0', '2615597977');
INSERT INTO public.users VALUES (12, '2025-04-08 13:36:46.863', '2025-04-08 13:36:46.863', 'susanapalomo2001@yahoo.com.ar', '$2a$10$0kdoi/Q0JZBJQIRNjPRZ1urdEGxnrnT2pzixkoD4DdaGocpOixwL6', NULL, NULL, 'VISITOR', NULL, 'ACTIVE', 'register_hash', '2616686339');
INSERT INTO public.users VALUES (16, '2025-04-09 22:32:40.19', '2025-04-09 22:45:54.311', 'vivirromano@hotmail.com', '$2a$10$WlsdoppIw265J75dHZjGAu7f2vo3Vg0ZqeMuWBrmAmbZKNXJUXEJK', '$2a$10$qiHME.jv8vkmrUpuljhdjOzi8.Uhzs4P.t/9VwurZHvQyD.ttE9pC', NULL, 'VISITOR', NULL, 'ACTIVE', '2u6o0prb58rgav965avf6044wrgi6evieg9n', '2615455677');
INSERT INTO public.users VALUES (13, '2025-04-08 16:33:06.449', '2025-04-08 16:36:07.229', 'mendoariel@gmail.com', '$2a$10$r4jvc8zDdgf/u/ucYSGMXufbV..eIWz02Zmx7HQ0oZWaz9GkLGz9S', NULL, NULL, 'VISITOR', NULL, 'ACTIVE', 'n2gs26mw6gkd3t2v1q4bab2tj8he3n2lw5bk', '2615597977');
INSERT INTO public.users VALUES (17, '2025-04-11 23:23:08.727', '2025-04-11 23:26:47.259', 'marbonanno@yahoo.com.ar', '$2a$10$m2pJnZp3Mu2LasIHHnK4Hem9AJclxn7EIawiC.6DdZkTeKIhu7jw6', '$2a$10$YJXYYPUQfIEJ7VzC8jOyouyAxQQi62wS7omQrxLlShI2DH6RD3d3a', NULL, 'VISITOR', NULL, 'ACTIVE', 'i0bap6sovixqeh8dz15mojj3xwoquq1qbgpb', '2613208888');
INSERT INTO public.users VALUES (15, '2025-04-09 17:33:04.394', '2025-04-09 17:45:18.342', 'albertdesarrolloweb@gmail.com', '$2a$10$Lw/LtdHwNWv3lery8pDBCudB3tP.F8atT3fcVGJg2Yb1XZaqPlTsu', '$2a$10$8Ljeq3eyBUp9GVBYwIgv5.Rhan5egG7JHXss2aiGFBkgOH3NpAsJS', NULL, 'VISITOR', NULL, 'ACTIVE', '2if2vcpyxwnat7x96428f0vzo3ifg939m61e', '2615597977');
INSERT INTO public.users VALUES (18, '2025-04-23 23:53:42.708', '2025-04-23 23:59:23.374', 'casanovaluciana35@gmail.com', '$2a$10$SHQVPQ2U/t0QxID6zaJMAOJXWLUNTxlKuRA4YSmAFfQsQcay12glC', '$2a$10$3XyQVpLfuqZmNCBjc4OrJ.5ReTlWn435vXpk.63Zfy0Jf0bCchJDm', NULL, 'VISITOR', NULL, 'ACTIVE', 'pbsqlsqw4gamledqreoffcimh3non621dz52', '2616990028');
INSERT INTO public.users VALUES (14, '2025-04-09 12:56:17.652', '2025-04-09 19:09:18.261', 'analiabelenarce@gmail.com', '$2a$10$UOhYM25pobyUzeIOoPe3H.hp2WXu.G44Ojs5KcuFIfHW1cCkM7Hoy', '$2a$10$/Cr16XnujXvJKveEyPnvAuFCQAjh659.B.SbrYRqOiAKzKwXzuwLG', NULL, 'VISITOR', NULL, 'ACTIVE', 'yed1wciyhg9pu80re2nwil9qhl3moob54y57', '2616686337');
INSERT INTO public.users VALUES (19, '2025-04-27 01:58:55.038', '2025-04-27 02:05:57.506', 'elvamza64@gmail.com', '$2a$10$ROQpbNVfVyY6bGzpounRT.X8uTKaKBHOsbRsMAAe3QlhR.qxvZa4W', '$2a$10$L12N4yr6xeaVrK2YEwUt7eG7QB5J6.x21TSdc9cmTLx.kZcy/t/Py', NULL, 'VISITOR', NULL, 'ACTIVE', 'xcfd7zoduuvtlig56yrk7tdavwnprnncxemg', '2616778872');


--
-- TOC entry 2902 (class 0 OID 16447)
-- Dependencies: 201
-- Data for Name: virgin_medals; Type: TABLE DATA; Schema: public; Owner: Silvestre1993
--

INSERT INTO public.virgin_medals VALUES (13, '2025-03-10 15:28:05.338', NULL, 'VIRGIN', '09871hhxuw78u7n9g3kzlgoxntv2dkag8pp3', 'genesis');
INSERT INTO public.virgin_medals VALUES (14, '2025-03-10 15:28:05.341', NULL, 'VIRGIN', 'ps2m5c7zuhwcfpnk6uevsafkiuxu791oxfwy', 'genesis');
INSERT INTO public.virgin_medals VALUES (15, '2025-03-10 15:28:05.342', NULL, 'VIRGIN', 'kbkp5db65hhpt432mas5u88dj0iub3h6jdvt', 'genesis');
INSERT INTO public.virgin_medals VALUES (16, '2025-03-10 15:28:05.348', NULL, 'VIRGIN', 'ow1zo7weznx1jcfz3u98emrx2u1n21o12yv4', 'genesis');
INSERT INTO public.virgin_medals VALUES (18, '2025-03-10 15:28:05.347', NULL, 'VIRGIN', 'lwdddp7p4spbzu1bor6fx8l0n1615886a30n', 'genesis');
INSERT INTO public.virgin_medals VALUES (19, '2025-03-10 15:28:05.35', NULL, 'VIRGIN', 'hezyo1t1rca5scrjk1rv885m0f0im8mj4unp', 'genesis');
INSERT INTO public.virgin_medals VALUES (20, '2025-03-10 15:28:05.352', NULL, 'VIRGIN', 'qr8byd98h9u93s4bievtxnbkox50wfzqfxft', 'genesis');
INSERT INTO public.virgin_medals VALUES (21, '2025-03-10 15:28:05.354', NULL, 'VIRGIN', 'bhwuxlqh72t2dqxf158h48q8wpevjmxtsgqb', 'genesis');
INSERT INTO public.virgin_medals VALUES (22, '2025-03-10 15:28:05.357', NULL, 'VIRGIN', 'xxlpwqu4fbslitrgykc8cxm0n7z36gy6zwid', 'genesis');
INSERT INTO public.virgin_medals VALUES (24, '2025-03-10 15:28:05.359', NULL, 'VIRGIN', '58b6qilg69s22qwyhaxc0nujlo7x7mkkw7kz', 'genesis');
INSERT INTO public.virgin_medals VALUES (23, '2025-03-10 15:28:05.358', NULL, 'VIRGIN', '56zywbrw8osvb6c7uc9qewspeg06kgppeafb', 'genesis');
INSERT INTO public.virgin_medals VALUES (25, '2025-03-10 15:28:05.36', NULL, 'VIRGIN', 'jtb0i0ub95w7te8g6n1nekmvbn2j5oq0q7sc', 'genesis');
INSERT INTO public.virgin_medals VALUES (26, '2025-03-10 15:28:05.361', NULL, 'VIRGIN', 'ag7cvvrxevh5ktcfp2wbowbe44vw3b30cv5i', 'genesis');
INSERT INTO public.virgin_medals VALUES (27, '2025-03-10 15:28:05.362', NULL, 'VIRGIN', '4h3xratrux2uzpgh6ntibdgo3zyjbjwk4neh', 'genesis');
INSERT INTO public.virgin_medals VALUES (28, '2025-03-10 15:28:05.363', NULL, 'VIRGIN', 's9m9978fw1q21gv7874o1f1bedano6rfr99y', 'genesis');
INSERT INTO public.virgin_medals VALUES (30, '2025-03-10 15:28:05.365', NULL, 'VIRGIN', 'w2cwuheb0d8x0xyy65zbw6883x8iezzuuror', 'genesis');
INSERT INTO public.virgin_medals VALUES (29, '2025-03-10 15:28:05.364', NULL, 'VIRGIN', 'wrjk3mfpnb48bn1hnfezoz4v8adisdr5rprt', 'genesis');
INSERT INTO public.virgin_medals VALUES (31, '2025-03-10 15:28:05.366', NULL, 'VIRGIN', '7csaxou6y8k5d1pt3hy8glnunvswr4r1abye', 'genesis');
INSERT INTO public.virgin_medals VALUES (33, '2025-03-10 15:28:05.369', NULL, 'VIRGIN', '47kjcx5ox3bc91f3mg7mwdolpaqigro2opsh', 'genesis');
INSERT INTO public.virgin_medals VALUES (34, '2025-03-10 15:28:05.371', NULL, 'VIRGIN', 'ou31jl8fywixhg0pj4r9vkri374s47kvgces', 'genesis');
INSERT INTO public.virgin_medals VALUES (35, '2025-03-10 15:28:05.373', NULL, 'VIRGIN', '8qd6az8z04sb5rce9vcpd8sw0745m0ngmw2s', 'genesis');
INSERT INTO public.virgin_medals VALUES (38, '2025-03-10 15:28:05.379', NULL, 'VIRGIN', 'ziiidui2k4of8cb305zymgflrqwx73q65daw', 'genesis');
INSERT INTO public.virgin_medals VALUES (43, '2025-03-10 15:28:05.438', NULL, 'VIRGIN', '0ktyn1pzav1znya6099hviqlko0v5shw8lma', 'genesis');
INSERT INTO public.virgin_medals VALUES (44, '2025-03-10 15:28:05.483', NULL, 'VIRGIN', 'y2zkbs4w7y8lunwy9rcxw1uwscvsjvzatmrb', 'genesis');
INSERT INTO public.virgin_medals VALUES (45, '2025-03-10 15:28:05.509', NULL, 'VIRGIN', 'ymooegj5whvhsctj1slmgr6p44il5r2bq5sc', 'genesis');
INSERT INTO public.virgin_medals VALUES (46, '2025-03-10 15:28:05.583', NULL, 'VIRGIN', 'nvca6ffp0316wlzb100ygfmpcbvn3nocvlbu', 'genesis');
INSERT INTO public.virgin_medals VALUES (47, '2025-03-10 15:28:05.594', NULL, 'VIRGIN', '2zl3av64gg9coditbptf27fhtxmh8joz9hqr', 'genesis');
INSERT INTO public.virgin_medals VALUES (48, '2025-03-10 15:28:05.612', NULL, 'VIRGIN', '05l49wgf2t9tpbr6kdbr3pnm5ak8e76lygx2', 'genesis');
INSERT INTO public.virgin_medals VALUES (49, '2025-03-10 15:28:05.621', NULL, 'VIRGIN', 'dttuyj7qnf9xg2zkhceitr7c80zfz5ls9acg', 'genesis');
INSERT INTO public.virgin_medals VALUES (1, '2025-03-04 00:22:24.146', '2025-04-08 13:03:14.631', 'ENABLED', 'rosa_mosqueta', 'czddiglfpeyukzsejxazd03b4a5r26wunyt5');
INSERT INTO public.virgin_medals VALUES (2, '2025-03-04 00:34:57.678', '2025-03-04 01:01:53.286', 'ENABLED', 'celeste', '6s2h438u4k1abfosmyfrgicd1d7dkue5qfs2');
INSERT INTO public.virgin_medals VALUES (17, '2025-03-10 15:28:05.347', '2025-04-08 16:35:59.664', 'ENABLED', 'p33bf93kyctc1p04hygbrvcvhgzrlmf1mh4u', 'genesis');
INSERT INTO public.virgin_medals VALUES (37, '2025-03-10 15:28:05.375', '2025-04-23 23:59:23.379', 'ENABLED', 'qlp5dgnztepx96slvi2q2oo096c1u9axwiwi', 'genesis');
INSERT INTO public.virgin_medals VALUES (42, '2025-03-10 15:28:05.436', NULL, 'ENABLED', 'aosaxmu3oqpvraz11ib9dxvw8g1qj5cvkey8', 'genesis');
INSERT INTO public.virgin_medals VALUES (41, '2025-03-10 15:28:05.426', '2025-04-27 02:05:57.512', 'ENABLED', 'zj07h8bybkl4gcafzw1ex1glxpqymt4d2k22', 'genesis');
INSERT INTO public.virgin_medals VALUES (39, '2025-03-10 15:28:05.38', '2025-04-09 17:45:18.347', 'REGISTERED', '5uewbvnpaumkzkjfwg5kyh9cc6j8klla8mqe', 'genesis');
INSERT INTO public.virgin_medals VALUES (36, '2025-03-10 15:28:05.377', '2025-04-09 19:09:18.267', 'ENABLED', 'o86c320roj50qstp2y76x3d9slma8g7u2v3r', 'genesis');
INSERT INTO public.virgin_medals VALUES (40, '2025-03-10 15:28:05.391', '2025-04-09 22:45:54.32', 'ENABLED', 'bem5kkpbaxv9uhr4hmd4ztcu7pmnz9ar4rxp', 'genesis');
INSERT INTO public.virgin_medals VALUES (32, '2025-03-10 15:28:05.367', '2025-04-11 23:26:47.267', 'ENABLED', 't75kly5rf7zkngcjvka31zyltnni3nerdevy', 'genesis');
INSERT INTO public.virgin_medals VALUES (56, '2025-03-26 15:11:39.607', NULL, 'VIRGIN', 'otner5nee6d70zv6zoqkipugkem11ovgjp6z', 'second-round');
INSERT INTO public.virgin_medals VALUES (57, '2025-03-26 15:11:39.609', NULL, 'VIRGIN', 'm7x0xuyy3vl3rhigsh4jaxz4errfc14sro5e', 'second-round');
INSERT INTO public.virgin_medals VALUES (58, '2025-03-26 15:11:39.611', NULL, 'VIRGIN', 'oziqeh739sdp2au8rbcc9t8hhauou1j9eqp3', 'second-round');
INSERT INTO public.virgin_medals VALUES (59, '2025-03-26 15:11:39.612', NULL, 'VIRGIN', '0hb6e9ii7i21ccjap1owt1u3q8ymdhf1inz5', 'second-round');
INSERT INTO public.virgin_medals VALUES (60, '2025-03-26 15:11:39.613', NULL, 'VIRGIN', '5xcdhecp0s63j14nsompg2yyleyupfbh5e2o', 'second-round');
INSERT INTO public.virgin_medals VALUES (61, '2025-03-26 15:11:39.614', NULL, 'VIRGIN', 'q29iqqebymebwum37awa0yn9fykr0995axfd', 'second-round');
INSERT INTO public.virgin_medals VALUES (62, '2025-03-26 15:11:39.616', NULL, 'VIRGIN', 'w4y7rud4zhlymgveqwxbqnf7bpk4w54w6j7n', 'second-round');
INSERT INTO public.virgin_medals VALUES (63, '2025-03-26 15:11:39.617', NULL, 'VIRGIN', '7eo1ts2pjcnm2yr1xnzs9t7p7zdocn5wub5u', 'second-round');
INSERT INTO public.virgin_medals VALUES (64, '2025-03-26 15:11:39.62', NULL, 'VIRGIN', 'vtzphmfvf81u8fazwa92vb45cmzgye4wd2bk', 'second-round');
INSERT INTO public.virgin_medals VALUES (65, '2025-03-26 15:11:39.619', NULL, 'VIRGIN', '7qm6uxw0gqwzbswr6wnooituso9se6an05qr', 'second-round');
INSERT INTO public.virgin_medals VALUES (66, '2025-03-26 15:11:39.621', NULL, 'VIRGIN', 'zqq9riq3ni7ibaihfhi3w8hkl6sdq9c9t175', 'second-round');
INSERT INTO public.virgin_medals VALUES (67, '2025-03-26 15:11:39.624', NULL, 'VIRGIN', '52qdl122bd6hzfcii5mqjxhqfp2gut1othbw', 'second-round');


--
-- TOC entry 2912 (class 0 OID 0)
-- Dependencies: 198
-- Name: medals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.medals_id_seq', 19, true);


--
-- TOC entry 2913 (class 0 OID 0)
-- Dependencies: 200
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.users_id_seq', 19, true);


--
-- TOC entry 2914 (class 0 OID 0)
-- Dependencies: 202
-- Name: virgin_medals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Silvestre1993
--

SELECT pg_catalog.setval('public.virgin_medals_id_seq', 67, true);


--
-- TOC entry 2765 (class 2606 OID 16460)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 2768 (class 2606 OID 16462)
-- Name: medals medals_pkey; Type: CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.medals
    ADD CONSTRAINT medals_pkey PRIMARY KEY (id);


--
-- TOC entry 2771 (class 2606 OID 16464)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 2774 (class 2606 OID 16466)
-- Name: virgin_medals virgin_medals_pkey; Type: CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.virgin_medals
    ADD CONSTRAINT virgin_medals_pkey PRIMARY KEY (id);


--
-- TOC entry 2766 (class 1259 OID 16467)
-- Name: medals_medal_string_key; Type: INDEX; Schema: public; Owner: Silvestre1993
--

CREATE UNIQUE INDEX medals_medal_string_key ON public.medals USING btree (medal_string);


--
-- TOC entry 2769 (class 1259 OID 16468)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: Silvestre1993
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 2772 (class 1259 OID 16469)
-- Name: virgin_medals_medal_string_key; Type: INDEX; Schema: public; Owner: Silvestre1993
--

CREATE UNIQUE INDEX virgin_medals_medal_string_key ON public.virgin_medals USING btree (medal_string);


--
-- TOC entry 2775 (class 2606 OID 16470)
-- Name: medals medals_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Silvestre1993
--

ALTER TABLE ONLY public.medals
    ADD CONSTRAINT "medals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2025-04-28 19:58:53 UTC

--
-- PostgreSQL database dump complete
--

