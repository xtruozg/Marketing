import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { connectDB } from './models';
import { seedSystem, startEngine } from './engine';
import { createApiRouter } from './api';

/**
 * Máy chủ backend đứng độc lập (dùng cho production sau khi `npm run build`).
 * Trong môi trường dev, dev-server.ts mount API vào cùng tiến trình Vite.
 */
async function main() {
  await connectDB();
  await seedSystem();
  startEngine();

  const app = express();
  app.use(cors());
  app.use('/api', createApiRouter());

  // Phục vụ frontend đã build (nếu có)
  const distClient = path.resolve(process.cwd(), 'dist/frontend-client');
  const distAdmin = path.resolve(process.cwd(), 'dist/frontend-admin');
  if (fs.existsSync(distAdmin)) app.use('/admin', express.static(distAdmin));
  if (fs.existsSync(distClient)) app.use('/', express.static(distClient));

  // SPA fallback
  app.get('/admin/*', (_req, res) => {
    const f = path.join(distAdmin, 'index.html');
    if (fs.existsSync(f)) return res.sendFile(f);
    res.status(404).end();
  });
  app.get('*', (_req, res) => {
    const f = path.join(distClient, 'index.html');
    if (fs.existsSync(f)) return res.sendFile(f);
    res.status(404).end();
  });

  const PORT = Number(process.env.PORT) || 4000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Backend Việt Tiến chạy tại http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('[SERVER] Khởi động thất bại:', err);
  process.exit(1);
});
