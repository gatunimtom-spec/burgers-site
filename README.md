# Art Burger - Site com Checkout Integrado

Site completo do Art Burger com sistema de checkout integrado e pagamento via PIX usando a API Trex Pay.

## 🚀 Funcionalidades

- ✅ Landing page completa com produtos
- ✅ Sistema de checkout em 3 etapas
- ✅ Seleção de adicionais (até 2 itens)
- ✅ Escolha de bebidas (1 refrigerante 2L)
- ✅ Formulário de entrega com validações
- ✅ Geração de PIX real via API Trex Pay
- ✅ QR Code para pagamento
- ✅ Confirmação de pedido

## 📦 Deploy no Netlify

### Opção 1: Deploy via Interface Web

1. Acesse [Netlify](https://app.netlify.com/)
2. Clique em "Add new site" → "Deploy manually"
3. Arraste a pasta do projeto ou faça upload do arquivo ZIP
4. Configure as variáveis de ambiente:
   - `TREX_PAY_TOKEN`: Token da API Trex Pay
   - `TREX_PAY_SECRET`: Secret da API Trex Pay

### Opção 2: Deploy via Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Deploy
netlify deploy --prod

# Quando solicitado, selecione:
# - Publish directory: public
```

### Configurar Variáveis de Ambiente

1. No painel do Netlify, vá em **Site settings** → **Environment variables**
2. Adicione as seguintes variáveis:
   - `TREX_PAY_TOKEN`: `b9eb34f2-dafa-41da-97fc-338b2061aa7d`
   - `TREX_PAY_SECRET`: `6d4e99b2-4dcd-46f7-864d-094c468b6032`

## 🔧 Estrutura do Projeto

```
art-burger/
├── public/                      # Arquivos estáticos
│   ├── index.html              # Página inicial
│   ├── checkout-integrado.html # Checkout completo
│   ├── css/                    # Estilos
│   ├── js/                     # Scripts
│   └── images/                 # Imagens
├── netlify/
│   └── functions/
│       └── generate-pix.js     # Função para gerar PIX
├── netlify.toml                # Configuração Netlify
├── package.json
└── README.md
```

## 💳 Como Funciona o Checkout

1. **Página Inicial**: Cliente clica em um produto
2. **Step 1 - Adicionais**: Cliente escolhe até 2 adicionais e 1 bebida
3. **Step 2 - Entrega**: Cliente preenche dados de entrega (nome, telefone, email, CPF, endereço)
4. **Step 3 - Pagamento**: Sistema gera QR Code PIX automaticamente
5. **Confirmação**: Cliente confirma o pedido após pagamento

## 🔐 Segurança

- As credenciais da API Trex Pay são armazenadas como variáveis de ambiente no Netlify
- A função serverless processa o pagamento de forma segura
- Validações de formulário no frontend e backend

## 📝 Notas Importantes

- **Credenciais PIX**: As credenciais estão configuradas no código, mas é recomendado usar variáveis de ambiente no Netlify
- **Validações**: O sistema valida email, CPF (11 dígitos) e campos obrigatórios
- **Limites**: Máximo de 2 adicionais e 1 refrigerante por pedido
- **Preços**: Os preços são puxados dinamicamente da URL dos produtos

## 🛠️ Testando Localmente

Para testar localmente com Netlify Functions:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Executar localmente
netlify dev
```

O site estará disponível em `http://localhost:8888`

## 📞 Suporte

Para dúvidas sobre a API Trex Pay, consulte a documentação oficial.
