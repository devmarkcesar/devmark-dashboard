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
}).catch(() => { /* tabla puede no existir aún en dev */ })

export default pool
