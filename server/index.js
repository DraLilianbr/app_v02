import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.post('/api/submit', async (req, res) => {
  const { answer } = req.body;
  
  try {
    await pool.query(
      'INSERT INTO answers (answer, submitted_at) VALUES ($1, NOW())',
      [answer]
    );
    
    res.json({ message: 'Resposta enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar resposta:', error);
    res.status(500).json({ message: 'Erro ao processar resposta' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});