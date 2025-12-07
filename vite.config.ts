import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/claude': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/claude/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Add API key from loaded environment
              const apiKey = env.VITE_CLAUDE_API_KEY;
              if (apiKey) {
                proxyReq.setHeader('x-api-key', apiKey);
              }
              proxyReq.setHeader('anthropic-version', '2023-06-01');
              proxyReq.setHeader('content-type', 'application/json');
            });
          },
        },
      },
    },
    // @ts-ignore - Vitest config
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  }
})
