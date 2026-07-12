import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/models';
import { seedSystem, startEngine } from './server/engine';
import { createApiRouter } from './server/api';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // ---- Backend: kết nối DB, seed, khởi động bộ máy chu kỳ, mount API ----
  try {
    await connectDB();
    await seedSystem();
    startEngine();
    app.use('/api', createApiRouter());
    console.log('[DEV] API backend đã sẵn sàng tại /api');
  } catch (err) {
    console.error('[DEV] Không kết nối được MongoDB. API sẽ không hoạt động:', (err as Error).message);
    console.error('[DEV] Hãy chắc chắn MongoDB đang chạy (hoặc đặt MONGODB_URI trong .env).');
  }

  // ---- Vite dev middleware cho frontend ----
  const vite = await createViteServer({
    server: { middlewareMode: true, allowedHosts: true },
    appType: 'custom',
  });

  app.use(vite.middlewares);

  // Serve admin assets under /admin/*
  app.get('/admin/*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const templatePath = path.resolve(process.cwd(), 'frontend-admin', 'index.html');
      let template = fs.readFileSync(templatePath, 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  // Serve client assets under everything else
  app.get('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const templatePath = path.resolve(process.cwd(), 'frontend-client', 'index.html');
      let template = fs.readFileSync(templatePath, 'utf-8');
      // index.html dùng /src/main.tsx (cho `vite build` root=frontend-client);
      // ở dev root=project nên trỏ lại đường dẫn đầy đủ để Vite phân giải đúng app.
      template = template.replace('/src/main.tsx', '/frontend-client/src/main.tsx');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Development server running on http://localhost:${PORT}`);
  });
}

startServer();
