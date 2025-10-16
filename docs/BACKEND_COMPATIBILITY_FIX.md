# 🔧 CORREÇÃO URGENTE - Adicionar ao backend urls.py

## PROBLEMA IDENTIFICADO:
O frontend está tentando acessar `/PublicPages/Login.js` mas essa rota não existe no backend.

## SOLUÇÃO - Adicionar essas rotas no urls.py:

```python
# ⬇️ ADICIONAR ESSAS ROTAS NO INICIO DO urlpatterns (ANTES DAS EXISTENTES)

urlpatterns = [
    # ========== ROTAS DE COMPATIBILIDADE FRONTEND (CRÍTICO) ==========
    # O frontend está tentando acessar esses endpoints como arquivos JS
    path('PublicPages/Login.js', CustomTokenObtainPairView.as_view(), name='legacy_login_js'),
    path('PublicPages/Register.js', register_user, name='legacy_register_js'),
    path('PrivatePages/Dashboard.js', budget_overview, name='legacy_dashboard_js'),
    path('PrivatePages/Custos.js', GastosAnoView.as_view(), name='legacy_custos_js'),
    path('PrivatePages/Entradas.js', EntradasAnoView.as_view(), name='legacy_entradas_js'),
    path('PrivatePages/Dividas.js', DividasAnoView.as_view(), name='legacy_dividas_js'),
    path('PrivatePages/Metas.js', metas_personalizadas, name='legacy_metas_js'),
    path('PrivatePages/Investments.js', ativosPessoais, name='legacy_investments_js'),
    
    # ========== SUAS ROTAS EXISTENTES CONTINUAM AQUI ==========
    # Endpoints de autenticação (múltiplas URLs para compatibilidade)
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_login'),
    # ... resto das suas rotas existentes
]
```

## OU (ALTERNATIVA MAIS SIMPLES):

Adicione apenas estas 3 linhas críticas no início do urlpatterns:

```python
urlpatterns = [
    # COMPATIBILIDADE FRONTEND CRÍTICA
    path('PublicPages/Login.js', CustomTokenObtainPairView.as_view(), name='frontend_login'),
    path('PublicPages/Register.js', register_user, name='frontend_register'),
    path('PublicPages/Generic.js', CustomTokenObtainPairView.as_view(), name='frontend_generic'),
    
    # SUAS ROTAS EXISTENTES (não mexer)
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_login'),
    # ... resto inalterado
]
```

## COMANDOS PARA APLICAR:

1. **Edite o arquivo `organizesee/urls.py`**
2. **Adicione as 3 linhas acima no INÍCIO do urlpatterns**
3. **Faça deploy:**

```bash
git add .
git commit -m "Adiciona rotas de compatibilidade frontend"
git push heroku main
```

## TESTE APÓS CORREÇÃO:

```bash
# Deve retornar resposta JSON (não 400)
curl "https://restbackend-dc8667cf0950.herokuapp.com/PublicPages/Login.js"
```

**URGENTE**: Esta correção é crítica para o funcionamento do login!
