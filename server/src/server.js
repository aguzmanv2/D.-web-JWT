import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import recordRoutes from './routes/records.js';
import graphqlRoutes from './routes/graphql.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/graphql', graphqlRoutes);

async function bootstrap() {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error(
        'La URI de MongoDB Atlas tiene credenciales invalidas. Revisa usuario, contrasena, permisos en Database Access y codifica la contrasena si contiene caracteres especiales.'
      );
    }
    process.exit(1);
  }
}

bootstrap();
