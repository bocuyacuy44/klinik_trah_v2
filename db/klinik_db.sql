--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: generate_id_pendaftaran(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_id_pendaftaran() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
  current_date_str VARCHAR;
  next_number INTEGER;
BEGIN
  current_date_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(id_pendaftaran FROM 11) AS INTEGER)), 0) + 1
  INTO next_number
  FROM registrations
  WHERE id_pendaftaran LIKE 'RJ' || current_date_str || '%';
  
  RETURN 'RJ' || current_date_str || LPAD(next_number::TEXT, 3, '0');
END;
$$;


ALTER FUNCTION public.generate_id_pendaftaran() OWNER TO postgres;

--
-- Name: generate_no_antrian(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_no_antrian() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(no_antrian), 0) + 1
  INTO next_number
  FROM registrations
  WHERE tanggal = CURRENT_DATE;
  
  RETURN next_number;
END;
$$;


ALTER FUNCTION public.generate_no_antrian() OWNER TO postgres;

--
-- Name: generate_rekam_medik(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_rekam_medik() RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(rekam_medik AS INTEGER)), 0) + 1
  INTO next_number
  FROM patients
  WHERE rekam_medik ~ '^[0-9]+$';
  
  RETURN LPAD(next_number::TEXT, 6, '0');
END;
$_$;


ALTER FUNCTION public.generate_rekam_medik() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    rekam_medik character varying(20) NOT NULL,
    nama_lengkap character varying(100) NOT NULL,
    jenis_identitas character varying(20) NOT NULL,
    nomor_identitas character varying(50) NOT NULL,
    tempat_lahir character varying(100) NOT NULL,
    tanggal_lahir date NOT NULL,
    jenis_kelamin character varying(20) NOT NULL,
    golongan_darah character varying(5),
    status_perkawinan character varying(20),
    nama_suami character varying(100),
    nama_ibu character varying(100) NOT NULL,
    pendidikan character varying(50),
    pekerjaan character varying(50),
    kewarganegaraan character varying(50),
    agama character varying(20),
    suku character varying(50),
    bahasa character varying(50),
    alamat text NOT NULL,
    rt character varying(10),
    rw character varying(10),
    provinsi character varying(50),
    kabupaten character varying(50),
    kecamatan character varying(50),
    kelurahan character varying(50),
    kode_pos character varying(10),
    telepon character varying(20) NOT NULL,
    hubungan_penanggung_jawab character varying(50) NOT NULL,
    nama_penanggung_jawab character varying(100) NOT NULL,
    telepon_penanggung_jawab character varying(20) NOT NULL,
    foto_rontgen text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    gambar_kolom1 text,
    gambar_kolom2 text,
    gambar_kolom3 text,
    gambar_kolom4 text,
    gambar_kolom5 text,
    gambar_kolom6 text,
    gambar_kolom7 text,
    gambar_kolom8 text,
    gambar_kolom9 text,
    gambar_kolom10 text,
    gambar_kolom11 text,
    gambar_kolom12 text,
    gambar_kolom13 text,
    gambar_kolom14 text,
    gambar_kolom15 text,
    gambar_kolom16 text,
    gambar_kolom17 text,
    informed_consent text
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registrations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    id_pendaftaran character varying(20) NOT NULL,
    no_antrian integer NOT NULL,
    tanggal date DEFAULT CURRENT_DATE NOT NULL,
    patient_id uuid NOT NULL,
    status character varying(20) DEFAULT 'Dalam Antrian'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ruangan character varying(50),
    dokter character varying(100),
    nama_pengantar character varying(100),
    telepon_pengantar character varying(20)
);


ALTER TABLE public.registrations OWNER TO postgres;

--
-- Name: rekam_medik_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rekam_medik_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rekam_medik_seq OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    role character varying(20) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['dokter'::character varying, 'administrasi'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, rekam_medik, nama_lengkap, jenis_identitas, nomor_identitas, tempat_lahir, tanggal_lahir, jenis_kelamin, golongan_darah, status_perkawinan, nama_suami, nama_ibu, pendidikan, pekerjaan, kewarganegaraan, agama, suku, bahasa, alamat, rt, rw, provinsi, kabupaten, kecamatan, kelurahan, kode_pos, telepon, hubungan_penanggung_jawab, nama_penanggung_jawab, telepon_penanggung_jawab, foto_rontgen, created_at, updated_at, gambar_kolom1, gambar_kolom2, gambar_kolom3, gambar_kolom4, gambar_kolom5, gambar_kolom6, gambar_kolom7, gambar_kolom8, gambar_kolom9, gambar_kolom10, gambar_kolom11, gambar_kolom12, gambar_kolom13, gambar_kolom14, gambar_kolom15, gambar_kolom16, gambar_kolom17, informed_consent) FROM stdin;
3cc1b388-4e0f-4e85-a686-168e55845c2c	000003	Dimas	KTP	-	-	2025-07-29	Perempuan	B	Belum Kawin	-	-	S1	Swasta	Indonesia	Islam	-	-	asa	-	-	Jawa Barat	Jakarta Selatan	Menteng	Menteng	12	0899999	Orang Tua	-	-	http://localhost:3001/uploads/image-1753795553885-825117121.jpg, http://localhost:3001/uploads/image-1753795525690-641935028.jpg, http://localhost:3001/uploads/image-1753795527921-303256029.jpg, , , , , , , , , , , , , , 	2025-07-29 20:16:13.053704	2025-07-29 20:16:13.053704	http://localhost:3001/uploads/image-1753795553885-825117121.jpg	http://localhost:3001/uploads/image-1753795525690-641935028.jpg	http://localhost:3001/uploads/image-1753795527921-303256029.jpg															http://localhost:3001/uploads/image-1753795556867-447003475.jpeg
d1ab8612-e96b-4835-9029-dab3fb8252da	000002	Yusup Muhamad	KTP	1	1	2025-07-29	Laki-laki	A	Kawin	1	1	SMP	Mahasiswa	Indonesia	Islam	1	1	121	1	1	Jawa Barat	Jakarta Pusat	Gambir		12121	08987	Teman	1	1	http://localhost:3001/uploads/image-1753770149394-342856194.jpeg, , http://localhost:3001/uploads/image-1753770153129-753824217.jpeg, , , , , , , , , , , , , , 	2025-07-29 13:22:37.109573	2025-07-29 13:22:37.109573	http://localhost:3001/uploads/image-1753770149394-342856194.jpeg		http://localhost:3001/uploads/image-1753770153129-753824217.jpeg															http://localhost:3001/uploads/image-1753770155932-891712476.jpeg
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registrations (id, id_pendaftaran, no_antrian, tanggal, patient_id, status, created_at, updated_at, ruangan, dokter, nama_pengantar, telepon_pengantar) FROM stdin;
d96e73b4-6ea1-4ac3-b813-8c1d84f9aa30	RJ20250729001	1	2025-07-29	3cc1b388-4e0f-4e85-a686-168e55845c2c	Dalam Antrian	2025-07-29 20:16:33.543101	2025-07-29 20:16:33.543101	poli-gigi	dr-kartini	Dimas	0899999
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, full_name, role, is_active, created_at, updated_at) FROM stdin;
1	admin	admin@klinik.com	$2b$10$7RUy5LsDk5io8Y8aD0X9.OhECEkz3vdBxab9BWr2R/zDgoBfqZruG	Administrator Klinik	administrasi	t	2025-07-29 20:41:58.71024	2025-07-29 20:52:46.468122
2	dr.smith	dr.smith@klinik.com	$2b$10$7RUy5LsDk5io8Y8aD0X9.OhECEkz3vdBxab9BWr2R/zDgoBfqZruG	Dr. John Smith	dokter	t	2025-07-29 20:41:58.71024	2025-07-29 20:52:46.468122
3	dr.jane	dr.jane@klinik.com	$2b$10$7RUy5LsDk5io8Y8aD0X9.OhECEkz3vdBxab9BWr2R/zDgoBfqZruG	Dr. Jane Doe	dokter	t	2025-07-29 20:41:58.71024	2025-07-29 20:52:46.468122
\.


--
-- Name: rekam_medik_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rekam_medik_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: patients patients_rekam_medik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_rekam_medik_key UNIQUE (rekam_medik);


--
-- Name: registrations registrations_id_pendaftaran_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_id_pendaftaran_key UNIQUE (id_pendaftaran);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: registrations registrations_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

