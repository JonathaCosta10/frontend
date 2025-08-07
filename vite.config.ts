import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-toast', '@radix-ui/react-tooltip', '@radix-ui/react-select', '@radix-ui/react-dialog'],
          charts: ['recharts', 'lucide-react'],
          query: ['@tanstack/react-query'],
          
          // App chunks by feature
          auth: [
            './client/contexts/AuthContext',
            './client/pages/HomePublicPages/Login',
            './client/pages/HomePublicPages/Signup',
            './client/pages/HomePublicPages/ForgotPassword',
            './client/pages/HomePublicPages/VerifyResetCode',
            './client/pages/PagesAuth/TwoFactorEmailSetup'
          ],
          
          dashboard: [
            './client/components/DashboardLayout',
            './client/components/DashboardSidebar',
            './client/pages/sistema/dashboard/info-diaria'
          ],
          
          budget: [
            './client/pages/sistema/dashboard/orcamento/Budget',
            './client/pages/sistema/dashboard/orcamento/index',
            './client/pages/sistema/dashboard/orcamento/entradas',
            './client/pages/sistema/dashboard/orcamento/custos',
            './client/pages/sistema/dashboard/orcamento/dividas',
            './client/pages/sistema/dashboard/orcamento/metas'
          ],
          
          investments: [
            './client/pages/sistema/dashboard/investimentos/Investment',
            './client/pages/sistema/dashboard/investimentos/index',
            './client/pages/sistema/dashboard/investimentos/comparativos',
            './client/pages/sistema/dashboard/investimentos/cadastro',
            './client/pages/sistema/dashboard/investimentos/ranking',
            './client/pages/sistema/dashboard/investimentos/patrimonio'
          ],
          
          market: [
            './client/pages/sistema/dashboard/mercado/Market',
            './client/pages/sistema/dashboard/mercado/index',
            './client/pages/sistema/dashboard/mercado/indicadores-economicos',
            './client/pages/sistema/dashboard/mercado/lista-de-desejo',
            './client/pages/sistema/dashboard/mercado/analise-ticker',
            './client/pages/sistema/dashboard/mercado/calculadora-financeira'
          ],
          
          crypto: [
            './client/pages/sistema/dashboard/cripto/DashboardCripto',
            './client/pages/sistema/dashboard/cripto/index',
            './client/pages/sistema/dashboard/cripto/mercado',
            './client/pages/sistema/dashboard/cripto/portfolio',
            './client/pages/sistema/dashboard/cripto/cadastro'
          ],
          
          training: [
            './client/pages/sistema/dashboard/treinamentos/Training',
            './client/pages/sistema/dashboard/treinamentos/fundos-investimentos',
            './client/pages/sistema/dashboard/treinamentos/renda-fixa',
            './client/pages/sistema/dashboard/treinamentos/acoes',
            './client/pages/sistema/dashboard/treinamentos/macroeconomia'
          ]
        }
      }
    }
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
