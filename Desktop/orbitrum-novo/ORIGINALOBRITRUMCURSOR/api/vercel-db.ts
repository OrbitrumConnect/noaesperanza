import { Pool } from 'pg';

// Configuração otimizada para Vercel Serverless
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Configurações específicas para Vercel
  max: 1, // Máximo 1 conexão no Vercel
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Pooling otimizado para serverless
  allowExitOnIdle: true
});

// Função para executar queries com retry
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Função para testar conexão
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Database conectado:', result.rows[0]);
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('❌ Erro na conexão com database:', error);
    return { success: false, error };
  }
}

// Função para verificar se o usuário existe
export async function checkUser(email: string) {
  try {
    const result = await query(
      'SELECT id, email, user_type FROM usuarios WHERE email = $1',
      [email]
    );
    return { success: true, user: result.rows[0] };
  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
    return { success: false, error };
  }
}

export default pool; 