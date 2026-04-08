import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Migración automática: agregar public_token si no existe
pool.query(`
  ALTER TABLE diagnosticos
  ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid()
`).then(() => {
  // Rellenar tokens nulos en registros antiguos
  return pool.query(`
    UPDATE diagnosticos
    SET public_token = gen_random_uuid()
    WHERE public_token IS NULL
  `)
}).catch((err: Error) => console.error('[db] migration public_token:', err.message))

// Migración: tabla pricing_catalog para precios dinámicos
pool.query(`
  CREATE TABLE IF NOT EXISTS pricing_catalog (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    concepto VARCHAR(200) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'unico',
    precio_min NUMERIC(10,2) NOT NULL,
    precio_max NUMERIC(10,2) NOT NULL,
    unidad VARCHAR(30) NOT NULL DEFAULT 'MXN',
    notas TEXT DEFAULT '',
    activo BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT NOW()
  )
`).then(async () => {
  // Solo insertar si la tabla está vacía
  const count = await pool.query('SELECT COUNT(*) FROM pricing_catalog')
  if (parseInt(count.rows[0].count) > 0) return

  await pool.query(`
    INSERT INTO pricing_catalog (categoria, concepto, tipo, precio_min, precio_max, notas) VALUES
    -- DESARROLLO (cobro único)
    ('desarrollo', 'Landing page / sitio institucional', 'unico', 3000, 8000, ''),
    ('desarrollo', 'Sitio web con CMS/blog', 'unico', 6000, 15000, ''),
    ('desarrollo', 'Tienda en línea / ecommerce', 'unico', 10000, 25000, ''),
    ('desarrollo', 'Sistema a medida simple (1-3 módulos)', 'unico', 15000, 30000, ''),
    ('desarrollo', 'Sistema a medida complejo (4+ módulos)', 'unico', 30000, 50000, ''),
    ('desarrollo', 'Bot de WhatsApp / automatización simple', 'unico', 5000, 12000, ''),
    ('desarrollo', 'Bot complejo con IA', 'unico', 12000, 25000, ''),
    ('desarrollo', 'Dashboard / panel de control', 'unico', 8000, 20000, ''),
    ('desarrollo', 'Automatización de procesos con scripts', 'unico', 3000, 15000, ''),
    ('desarrollo', 'App móvil básica (React Native)', 'unico', 20000, 40000, ''),
    -- DOMINIOS (anuales, Hostinger +10% markup)
    ('dominio', '.com', 'anual', 363, 363, 'Renovación $363/año. Hostinger puede incluir gratis el 1er año con hosting.'),
    ('dominio', '.mx', 'anual', 899, 899, 'Renovación $899/año'),
    ('dominio', '.com.mx', 'anual', 674, 674, 'Renovación $674/año'),
    -- HOSTING (mensual, Hostinger +10% markup)
    ('hosting', 'Hosting compartido Single (1 sitio, 10GB)', 'mensual', 27, 99, 'Según plazo contratado'),
    ('hosting', 'Hosting compartido Premium (3 sitios, 20GB)', 'mensual', 41, 165, 'Según plazo contratado'),
    ('hosting', 'Hosting compartido Business (50 sitios, 50GB NVMe)', 'mensual', 65, 330, 'Según plazo contratado'),
    ('hosting', 'VPS KVM 1 (1 vCPU, 4GB RAM, 50GB NVMe)', 'mensual', 116, 232, 'Según plazo contratado'),
    ('hosting', 'VPS KVM 2 (2 vCPU, 8GB RAM, 100GB NVMe)', 'mensual', 171, 302, 'Según plazo contratado'),
    ('hosting', 'VPS KVM 4 (4 vCPU, 16GB RAM)', 'mensual', 232, 579, 'Según plazo contratado'),
    ('hosting', 'Cloud Startup (100 sitios, 100GB NVMe)', 'mensual', 155, 502, 'Según plazo contratado'),
    -- SOPORTE
    ('soporte', 'Soporte Básico', 'mensual', 500, 500, 'Monitoreo, actualizaciones menores, soporte por email, respuesta en 48h'),
    ('soporte', 'Soporte Estándar', 'mensual', 1000, 1000, 'Todo lo básico + cambios menores, soporte por WhatsApp, respuesta en 24h'),
    ('soporte', 'Soporte Premium', 'mensual', 2000, 2000, 'Todo lo estándar + cambios moderados, soporte prioritario, respuesta en 4h'),
    -- EXTRAS
    ('extra', 'Cambios extra post-entrega', 'hora', 300, 300, 'Tarifa por hora para cambios fuera de requerimientos originales'),
    -- SEGURIDAD (incluido)
    ('seguridad', 'Certificado SSL', 'incluido', 0, 0, 'Gratis con todos los planes de Hostinger'),
    ('seguridad', 'Backups automáticos', 'incluido', 0, 0, 'Incluido en planes Business y VPS'),
    ('seguridad', 'Firewall y protección DDoS', 'incluido', 0, 0, 'Incluido en VPS de Hostinger')
  `)
  console.log('[db] pricing_catalog seeded with initial data')
}).catch((err: Error) => console.error('[db] migration pricing_catalog:', err.message))

export default pool
