# Instruções para Deploy - OrganizeSee

Este documento contém instruções detalhadas para realizar o deploy do projeto OrganizeSee em ambiente de produção.

## Resumo do Projeto

O projeto OrganizeSee está configurado para funcionar com as seguintes características em produção:

- **URL Base**: https://organizesee.com.br
- **API URL**: https://backend.organizesee.com.br
- **Otimizações Aplicadas**: Minificação, tree-shaking, splitting de código
- **Segurança**: Headers HTTP configurados para melhor segurança
- **Performance**: Estratégias de cache configuradas

## Pré-requisitos para Deploy

1. Node.js 16+ e npm 8+ instalados
2. Acesso ao repositório Git
3. Acesso ao painel administrativo da plataforma de hospedagem (Netlify, Vercel ou servidor próprio)

## Instruções para Deploy

### 1. Preparação Local

O ambiente já está configurado para produção com os seguintes passos executados:

```bash
# Configurar ambiente de produção
npm run env:prod

# Executar limpeza de arquivos desnecessários
npm run prod:cleanup

# Aplicar otimizações
npm run prod:optimize

# Validar configurações
npm run prod:validate

# Gerar build de produção
npm run build
```

A pasta `dist/` agora contém todos os arquivos otimizados para produção.

### 2. Deploy em Plataformas

#### Deploy na Netlify

1. Acesse o painel da Netlify
2. Clique em "New site from Git"
3. Selecione o repositório
4. Configure as opções de build:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Variáveis de ambiente: Certifique-se de copiar todas as variáveis do arquivo `.env` para as configurações da Netlify

#### Deploy na Vercel

1. Acesse o painel da Vercel
2. Clique em "New Project" e selecione o repositório
3. Configure as opções de build:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Variáveis de ambiente: Copie as variáveis do arquivo `.env` para as configurações da Vercel

### 3. Deploy Manual em Servidor Próprio

1. Copie os arquivos da pasta `dist/` para a raiz do seu servidor web
2. Configure o servidor para redirecionar todas as rotas para o `index.html` (Single Page Application)
3. Configure os headers HTTP conforme o arquivo `netlify.toml`

## Verificações Pós-Deploy

Após o deploy, verifique os seguintes itens:

1. Acesse a URL principal do site e confirme que o site carrega corretamente
2. Teste o login e a autenticação
3. Verifique as funcionalidades premium
4. Teste a responsividade em dispositivos móveis
5. Verifique se as APIs estão sendo chamadas corretamente

## Solução de Problemas

### Problema: Erro 404 em Rotas

**Solução**: Verifique se o servidor está configurado para redirecionar todas as rotas para o `index.html`.

Para Nginx:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Para Apache (.htaccess):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Problema: API não está sendo chamada

**Solução**: Verifique as configurações de CORS no backend e certifique-se de que o domínio de produção está permitido.

## Manutenção

Para atualizações futuras:

1. Faça as alterações no código
2. Execute `npm run env:prod` para garantir configurações de produção
3. Execute `npm run build` para gerar nova build
4. Faça deploy da pasta `dist/` atualizada

## Observações Finais

- O arquivo `.env` não deve ser incluído no repositório Git
- As variáveis de ambiente devem ser configuradas diretamente na plataforma de hospedagem
- Mantenha o modo de produção ativado para melhor performance

---

Projeto preparado e documentado em 30 de agosto de 2025.
