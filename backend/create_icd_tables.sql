-- Create ICD10 Dental Procedures Table
CREATE TABLE IF NOT EXISTS icd10_dental (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode VARCHAR(10) NOT NULL UNIQUE,
  nama VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ICD9 Dental Procedures Table  
CREATE TABLE IF NOT EXISTS icd9_dental (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode VARCHAR(10) NOT NULL UNIQUE,
  nama VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Real ICD10 Dental Procedures Data (with conflict handling)
INSERT INTO icd10_dental (kode, nama) VALUES
-- Prosedur Bedah Minor
('K00.1', 'Pencabutan gigi sulung'),
('K00.2', 'Pencabutan gigi permanen'),  
('K00.3', 'Pencabutan gigi impaksi'),
('K00.4', 'Pencabutan akar gigi'),
('K00.5', 'Gingivektomi'),
('K00.6', 'Gingivoplasti'),
('K00.7', 'Kuretase gingiva'),
('K00.8', 'Eksisi lesi gingiva'),
('K00.9', 'Flap periodontal'),

-- Prosedur Restoratif
('K01.1', 'Penambalan gigi dengan amalgam'),
('K01.2', 'Penambalan gigi dengan komposit resin'),
('K01.3', 'Penambalan gigi dengan semen ionomer kaca'),
('K01.4', 'Penambalan gigi dengan kompomer'),
('K01.5', 'Restorasi inlay'),
('K01.6', 'Restorasi onlay'),
('K01.7', 'Restorasi overlay'),
('K01.8', 'Restorasi estetik anterior'),
('K01.9', 'Restorasi estetik posterior'),

-- Prosedur Endodontik
('K02.1', 'Perawatan saluran akar gigi anterior'),
('K02.2', 'Perawatan saluran akar gigi posterior'),
('K02.3', 'Perawatan saluran akar ulang'),
('K02.4', 'Pulpotomi'),
('K02.5', 'Pulpektomi'),
('K02.6', 'Apikoektomi'),
('K02.7', 'Hemiseksi akar'),
('K02.8', 'Amputasi akar'),
('K02.9', 'Kaping pulpa'),

-- Prosedur Prostetik
('K03.1', 'Pembuatan mahkota porselen'),
('K03.2', 'Pembuatan mahkota metal porselen'),
('K03.3', 'Pembuatan mahkota zirconia'),
('K03.4', 'Pembuatan mahkota metal'),
('K03.5', 'Pembuatan jembatan gigi (bridge)'),
('K03.6', 'Pembuatan veneer'),
('K03.7', 'Pembuatan gigi tiruan sebagian lepasan'),
('K03.8', 'Pembuatan gigi tiruan penuh'),
('K03.9', 'Reparasi gigi tiruan'),

-- Prosedur Preventif
('K04.1', 'Pembersihan karang gigi (scaling)'),
('K04.2', 'Root planing'),
('K04.3', 'Profilaksis'),
('K04.4', 'Aplikasi fluoride'),
('K04.5', 'Aplikasi pit dan fissure sealant'),
('K04.6', 'Bleaching gigi'),
('K04.7', 'Pemolesan gigi'),

-- Prosedur Bedah Mayor
('K05.1', 'Implantasi gigi'),
('K05.2', 'Bone grafting'),
('K05.3', 'Sinus lifting'),
('K05.4', 'Osteotomy'),
('K05.5', 'Alveolectomy'),
('K05.6', 'Operculectomy'),
('K05.7', 'Frenektomi'),
('K05.8', 'Vestibuloplasti'),

-- Prosedur Ortodontik  
('K06.1', 'Pemasangan bracket metal'),
('K06.2', 'Pemasangan bracket keramik'),
('K06.3', 'Pemasangan aligner'),
('K06.4', 'Penyesuaian kawat ortodontik'),
('K06.5', 'Pemasangan retainer'),
('K06.6', 'Ekspansi rahang'),

-- Prosedur Emergency
('K07.1', 'Perawatan darurat sakit gigi'),
('K07.2', 'Replantasi gigi avulsi'),
('K07.3', 'Splinting gigi'),
('K07.4', 'Hemostasis post ekstraksi'),
('K07.5', 'Drainase abses'),

-- Prosedur Radiologi
('K08.1', 'Foto rontgen periapikal'),
('K08.2', 'Foto rontgen bitewing'),
('K08.3', 'Foto rontgen panoramik'),
('K08.4', 'Foto rontgen oklusal'),
('K08.5', 'CBCT scan'),

-- Prosedur Pediatrik
('K09.1', 'Space maintainer'),
('K09.2', 'Fluoride varnish aplikasi'),
('K09.3', 'Behavior management'),
('K09.4', 'Sedasi'),
('K09.5', 'General anesthesia prosedur gigi anak')
ON CONFLICT (kode) DO NOTHING;

-- Insert Real ICD9 Dental Procedures Data (with conflict handling)
INSERT INTO icd9_dental (kode, nama) VALUES
-- Pencabutan Gigi
('23.01', 'Pencabutan gigi sulung'),
('23.09', 'Pencabutan gigi permanen'),
('23.11', 'Pencabutan gigi impaksi'),
('23.19', 'Pencabutan akar gigi'),

-- Pembersihan dan Scaling
('23.3', 'Pembersihan gigi dan scaling'),
('24.31', 'Scaling dan root planing per kuadran'),
('24.39', 'Profilaksis periodontal'),

-- Restorasi Gigi (Penambalan)
('23.41', 'Penambalan gigi dengan amalgam'),
('23.42', 'Penambalan gigi dengan komposit'),
('23.43', 'Penambalan gigi dengan semen ionomer kaca'),
('23.49', 'Restorasi gigi lainnya'),

-- Mahkota dan Jembatan
('23.71', 'Pemasangan mahkota porselen'),
('23.72', 'Pemasangan mahkota metal porselen'),
('23.73', 'Pemasangan jembatan gigi (bridge)'),
('23.74', 'Pemasangan inlay/onlay'),

-- Perawatan Endodontik
('23.51', 'Perawatan saluran akar gigi anterior'),
('23.52', 'Perawatan saluran akar gigi posterior'),
('23.53', 'Apikoektomi'),
('23.59', 'Perawatan endodontik lainnya'),

-- Prostetik Lepasan
('27.41', 'Pembuatan gigi tiruan sebagian lepasan'),
('27.42', 'Pembuatan gigi tiruan penuh'),
('27.43', 'Reparasi gigi tiruan'),
('27.49', 'Prostetik lepasan lainnya'),

-- Perawatan Periodontal
('24.0', 'Gingivektomi'),
('24.1', 'Gingivoplasti'),
('24.2', 'Flap periodontal'),
('24.3', 'Kuretase gingiva'),
('24.4', 'Eksisi lesi gingiva'),

-- Bedah Mulut
('25.1', 'Eksisi lesi atau jaringan destruktif mulut'),
('25.2', 'Eksisi lesi lidah'),
('25.3', 'Perbaikan bibir sumbing'),
('25.4', 'Eksisi lesi langit-langit'),

-- Ortodontik
('24.7', 'Aplikasi kawat gigi (bracket)'),
('24.8', 'Penyesuaian alat ortodontik'),

-- Implan Gigi
('23.6', 'Pemasangan implan gigi'),
('23.61', 'Pemasangan implan endosteal'),
('23.69', 'Pemasangan implan gigi lainnya'),

-- Perawatan Pediatrik
('23.81', 'Aplikasi fluoride topikal'),
('23.82', 'Aplikasi pit dan fissure sealant'),
('23.83', 'Pulpotomi gigi sulung'),
('23.84', 'Pulpektomi gigi sulung'),

-- Radiografi
('87.11', 'Radiografi intraoral periapikal'),
('87.12', 'Radiografi bitewing'),
('87.13', 'Radiografi panoramik'),
('87.16', 'Radiografi oklusal'),

-- Emergency Treatment
('23.91', 'Perawatan darurat sakit gigi'),
('23.92', 'Replantasi gigi avulsi'),
('23.93', 'Splinting gigi trauma'),
('23.99', 'Prosedur darurat gigi lainnya'),

-- Prosedur Tambahan
('24.5', 'Bone grafting'),
('24.6', 'Sinus lifting'),
('25.5', 'Frenektomi'),
('25.6', 'Vestibuloplasti'),
('25.7', 'Operculectomy'),
('25.8', 'Alveolectomy'),
('26.1', 'Bleaching gigi'),
('26.2', 'Veneer komposit'),
('26.3', 'Splinting periodontal'),
('26.4', 'Crown lengthening'),
('26.5', 'Soft tissue grafting'),
('26.6', 'Guided tissue regeneration'),
('26.7', 'Socket preservation'),
('26.8', 'Immediate implant placement'),
('26.9', 'All-on-4 implant procedure')
ON CONFLICT (kode) DO NOTHING;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_icd10_dental_kode ON icd10_dental(kode);
CREATE INDEX IF NOT EXISTS idx_icd10_dental_nama ON icd10_dental(nama);

CREATE INDEX IF NOT EXISTS idx_icd9_dental_kode ON icd9_dental(kode);
CREATE INDEX IF NOT EXISTS idx_icd9_dental_nama ON icd9_dental(nama);