import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function localApiPlugin(): Plugin {
  return {
    name: 'local-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const pathname = urlObj.pathname;

          if (pathname === '/api/questions') {
            const { default: handler } = await server.ssrLoadModule('/api/questions.ts');
            await handler(req, res);
            return;
          }

          if (pathname === '/api/submit') {
            const { default: handler } = await server.ssrLoadModule('/api/submit.ts');
            await handler(req, res);
            return;
          }

          if (pathname === '/api/health') {
            const { default: handler } = await server.ssrLoadModule('/api/health.ts');
            await handler(req, res);
            return;
          }

          // Staff endpoints (supports both /api/staff/* and /api/staff-*)
          if (pathname === '/api/staff/login' || pathname === '/api/staff-login') {
            const { default: handler } = await server.ssrLoadModule('/api/staff/login.ts');
            await handler(req, res);
            return;
          }

          if (pathname === '/api/staff/lookup' || pathname === '/api/staff-lookup') {
            const { default: handler } = await server.ssrLoadModule('/api/staff/lookup.ts');
            await handler(req, res);
            return;
          }

          if (pathname === '/api/staff/collect' || pathname === '/api/staff-collect') {
            const { default: handler } = await server.ssrLoadModule('/api/staff/collect.ts');
            await handler(req, res);
            return;
          }

          next();
        } catch (err: any) {
          console.error('Local API error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), localApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 3000,
      host: true
    }
  };
});
