-- Create database
CREATE DATABASE klinik_trah;

-- Connect to database
\c klinik_trah;

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rekam_medik VARCHAR(20) UNIQUE NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  jenis_identitas VARCHAR(20) NOT NULL,
  nomor_identitas VARCHAR(50) NOT NULL, 
  tempat_lahir VARCHAR(100) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin VARCHAR(20) NOT NULL,
  golongan_darah VARCHAR(5),
  status_perkawinan VARCHAR(20),
  nama_suami VARCHAR(100),
  nama_ibu VARCHAR(100) NOT NULL,
  pendidikan VARCHAR(50),
  pekerjaan VARCHAR(50),
  kewarganegaraan VARCHAR(50),
  agama VARCHAR(20),
  suku VARCHAR(50),
  bahasa VARCHAR(50),
  alamat TEXT NOT NULL,
  rt VARCHAR(10),
  rw VARCHAR(10),
  provinsi VARCHAR(50),
  kabupaten VARCHAR(50),
  kecamatan VARCHAR(50),
  kelurahan VARCHAR(50),
  kode_pos VARCHAR(10),
  telepon VARCHAR(20) NOT NULL,
  hubungan_penanggung_jawab VARCHAR(50) NOT NULL,
  nama_penanggung_jawab VARCHAR(100) NOT NULL,
  telepon_penanggung_jawab VARCHAR(20) NOT NULL,
  foto_rontgen TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create registrations table 
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_pendaftaran VARCHAR(20) UNIQUE NOT NULL,
  no_antrian INTEGER NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'Dalam Antrian',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function for generating rekam medik
CREATE OR REPLACE FUNCTION generate_rekam_medik()
RETURNS VARCHAR AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(rekam_medik AS INTEGER)), 0) + 1
  INTO next_number
  FROM patients
  WHERE rekam_medik ~ '^[0-9]+$';
  
  RETURN LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function for generating ID pendaftaran
CREATE OR REPLACE FUNCTION generate_id_pendaftaran() 
RETURNS VARCHAR AS $$
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
$$ LANGUAGE plpgsql;

-- Create function for generating nomor antrian
CREATE OR REPLACE FUNCTION generate_no_antrian()
RETURNS INTEGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(no_antrian), 0) + 1
  INTO next_number
  FROM registrations
  WHERE tanggal = CURRENT_DATE;
  
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;