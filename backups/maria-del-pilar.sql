PGDMP                         }            peludosclick    10.4 (Debian 10.4-2.pgdg90+1)    12.4 !    Q           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            R           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            S           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            T           1262    16384    peludosclick    DATABASE     |   CREATE DATABASE peludosclick WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.utf8' LC_CTYPE = 'en_US.utf8';
    DROP DATABASE peludosclick;
                postgres    false                       1247    16394 
   MedalState    TYPE     �   CREATE TYPE public."MedalState" AS ENUM (
    'VIRGIN',
    'ENABLED',
    'DISABLED',
    'DEAD',
    'REGISTER_PROCESS',
    'PENDING_CONFIRMATION',
    'INCOMPLETE',
    'REGISTERED'
);
    DROP TYPE public."MedalState";
       public          Silvestre1993    false            �           1247    16387    Role    TYPE     Y   CREATE TYPE public."Role" AS ENUM (
    'VISITOR',
    'FRIAS_EDITOR',
    'REGISTER'
);
    DROP TYPE public."Role";
       public          Silvestre1993    false            S           1247    16412 
   UserStatus    TYPE     Y   CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'PENDING',
    'DISABLED'
);
    DROP TYPE public."UserStatus";
       public          Silvestre1993    false            �            1259    16434    medals    TABLE     �  CREATE TABLE public.medals (
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
    DROP TABLE public.medals;
       public            Silvestre1993    false    513            �            1259    16432    medals_id_seq    SEQUENCE     �   CREATE SEQUENCE public.medals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.medals_id_seq;
       public          Silvestre1993    false    199            U           0    0    medals_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.medals_id_seq OWNED BY public.medals.id;
          public          Silvestre1993    false    198            �            1259    16421    users    TABLE     �  CREATE TABLE public.users (
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
    DROP TABLE public.users;
       public            Silvestre1993    false    510    595            �            1259    16419    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          Silvestre1993    false    197            V           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          Silvestre1993    false    196            �            1259    16447    virgin_medals    TABLE     ,  CREATE TABLE public.virgin_medals (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone,
    status public."MedalState" NOT NULL,
    medal_string text NOT NULL,
    register_hash text NOT NULL
);
 !   DROP TABLE public.virgin_medals;
       public            Silvestre1993    false    513            �            1259    16445    virgin_medals_id_seq    SEQUENCE     �   CREATE SEQUENCE public.virgin_medals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.virgin_medals_id_seq;
       public          Silvestre1993    false    201            W           0    0    virgin_medals_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.virgin_medals_id_seq OWNED BY public.virgin_medals.id;
          public          Silvestre1993    false    200            �
           2604    16437 	   medals id    DEFAULT     f   ALTER TABLE ONLY public.medals ALTER COLUMN id SET DEFAULT nextval('public.medals_id_seq'::regclass);
 8   ALTER TABLE public.medals ALTER COLUMN id DROP DEFAULT;
       public          Silvestre1993    false    198    199    199            �
           2604    16424    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          Silvestre1993    false    197    196    197            �
           2604    16450    virgin_medals id    DEFAULT     t   ALTER TABLE ONLY public.virgin_medals ALTER COLUMN id SET DEFAULT nextval('public.virgin_medals_id_seq'::regclass);
 ?   ALTER TABLE public.virgin_medals ALTER COLUMN id DROP DEFAULT;
       public          Silvestre1993    false    201    200    201            L          0    16434    medals 
   TABLE DATA              COPY public.medals (id, "createdAt", "updatedAt", "ownerId", status, image, medal_string, pet_name, register_hash) FROM stdin;
    public          Silvestre1993    false    199   0'       J          0    16421    users 
   TABLE DATA           �   COPY public.users (id, "createdAt", "updatedAt", email, hash, "hashedRt", username, role, "hashPasswordRecovery", "userStatus", hash_to_register) FROM stdin;
    public          Silvestre1993    false    197   )(       N          0    16447    virgin_medals 
   TABLE DATA           j   COPY public.virgin_medals (id, "createdAt", "updatedAt", status, medal_string, register_hash) FROM stdin;
    public          Silvestre1993    false    201   �)       X           0    0    medals_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.medals_id_seq', 2, true);
          public          Silvestre1993    false    198            Y           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 2, true);
          public          Silvestre1993    false    196            Z           0    0    virgin_medals_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.virgin_medals_id_seq', 2, true);
          public          Silvestre1993    false    200            �
           2606    16444    medals medals_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.medals
    ADD CONSTRAINT medals_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.medals DROP CONSTRAINT medals_pkey;
       public            Silvestre1993    false    199            �
           2606    16431    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            Silvestre1993    false    197            �
           2606    16456     virgin_medals virgin_medals_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.virgin_medals
    ADD CONSTRAINT virgin_medals_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.virgin_medals DROP CONSTRAINT virgin_medals_pkey;
       public            Silvestre1993    false    201            �
           1259    16458    medals_medal_string_key    INDEX     Y   CREATE UNIQUE INDEX medals_medal_string_key ON public.medals USING btree (medal_string);
 +   DROP INDEX public.medals_medal_string_key;
       public            Silvestre1993    false    199            �
           1259    16457    users_email_key    INDEX     I   CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
 #   DROP INDEX public.users_email_key;
       public            Silvestre1993    false    197            �
           1259    16459    virgin_medals_medal_string_key    INDEX     g   CREATE UNIQUE INDEX virgin_medals_medal_string_key ON public.virgin_medals USING btree (medal_string);
 2   DROP INDEX public.virgin_medals_medal_string_key;
       public            Silvestre1993    false    201            �
           1259    16460    virgin_medals_register_hash_key    INDEX     i   CREATE UNIQUE INDEX virgin_medals_register_hash_key ON public.virgin_medals USING btree (register_hash);
 3   DROP INDEX public.virgin_medals_register_hash_key;
       public            Silvestre1993    false    201            �
           2606    16461    medals medals_ownerId_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.medals
    ADD CONSTRAINT "medals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;
 F   ALTER TABLE ONLY public.medals DROP CONSTRAINT "medals_ownerId_fkey";
       public          Silvestre1993    false    2759    197    199            L   �   x�]��n�0D��+�X�]��R5�*5=4�^*EB �`���Dje5Z͌��C@� W )�����X�)i:a�m_7�/��m��<<���D������+Y�|v�8l��ۜV���O�TeStv����w6���T��khǠ"�� қN �=�JqJ4�%�~���'��#I�]p�wm�r�X,�W��lz˴Ǔ�� k��/cїUn��3�`յ�}�(�~ �Y�      J   J  x�m�Io�@ ���+z��t���*uI�(��˰�E�Q`X����j�|�����}H��!$C�=AhajL=�İ�4�`e��DԜ�9W���n�hC\�Y�0}�C	�|���5�gc�Qu%��
]9��������ݣ��ν��M�}Kk"x\�J���N��z(hU��*�� ��ߞ��b]�K�Jv��Z��G�*p��^����_�F���YO�~5J%?���I�xMzXI���^�?c��n�g�=��t����ev �m��/i���v�$Fі�y���_��D/�*���0 YC�,���u��U������$=��      N   �   x�]���0 ��)|�����ĸ���)�ED(����$7�p�P�	�	;J5�A�Pϙ�����p<��"ߣi��a�n6�Z�m��?��5��۬��R9�z��2K۬�2%*��<�_$'���_�:f�T���Y-3�B���n*�lj������ �R;�     