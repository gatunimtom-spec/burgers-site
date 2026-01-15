# 📱 Documentação da API PIX - Art Burger

## 📋 Visão Geral

Este documento descreve a implementação completa da API PIX no sistema de checkout do Art Burger, incluindo geração de código PIX e QR code.

## 🏗️ Arquitetura

### Componentes Principais

1. **Netlify Function** (`/netlify/functions/generate-pix.js`)
   - Função serverless que processa pagamentos PIX
   - Gera QR codes em formato base64
   - Mantém credenciais seguras no servidor

2. **Frontend** (`/public/checkout-integrado.html`)
   - Interface de checkout com 3 etapas
   - Sistema de fallback automático
   - Validação de dados em tempo real

3. **API Externa** (Trex Pay)
   - Processador de pagamentos PIX
   - Endpoint: `https://app.trexpay.com.br/api/wallet/deposit/payment`

## 🔄 Fluxo de Pagamento

```
Cliente preenche formulário
         ↓
Frontend valida dados
         ↓
Tenta Netlify Function ──→ Sucesso ──→ Gera QR Code
         ↓                                    ↓
    Falha/Timeout                      Exibe para cliente
         ↓
Fallback: API Direta ──→ Sucesso ──→ Gera QR Code
         ↓                                    ↓
       Erro                            Exibe para cliente
         ↓
  Mensagem de erro
```

## 🔐 Segurança

### Variáveis de Ambiente (Recomendado)

Configure no Netlify:
```bash
TREX_PAY_TOKEN=seu_token_aqui
TREX_PAY_SECRET=seu_secret_aqui
```

### Fallback (Desenvolvimento)

Para testes locais, as credenciais estão no código JavaScript:
```javascript
const PIX_API_TOKEN = 'b9eb34f2-dafa-41da-97fc-338b2061aa7d';
const PIX_API_SECRET = '6d4e99b2-4dcd-46f7-864d-094c468b6032';
```

⚠️ **Importante**: Em produção, sempre use variáveis de ambiente no Netlify.

## 📡 API Endpoints

### POST /.netlify/functions/generate-pix

Gera um pagamento PIX e retorna o código e QR code.

#### Request Body

```json
{
  "token": "string (opcional se configurado no ambiente)",
  "secret": "string (opcional se configurado no ambiente)",
  "amount": "string (formato: 00.00)",
  "debtor_name": "string",
  "email": "string",
  "debtor_document_number": "string (11 dígitos, apenas números)",
  "phone": "string (apenas números)",
  "method_pay": "pix"
}
```

#### Response Success (200)

```json
{
  "success": true,
  "qrcode": "00020101021226940014br.gov.bcb.pix...",
  "qr_code_image_url": "https://...",
  "qr_code_data_url": "data:image/png;base64,...",
  "idTransaction": 38442985,
  "message": "PIX gerado com sucesso"
}
```

#### Response Error (400/500)

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": {}
}
```

## 🎨 Geração de QR Code

### Métodos Implementados

1. **QRCode Library (Preferencial)**
   - Biblioteca: `qrcode` (npm)
   - Formato: Data URL (base64)
   - Vantagens: Rápido, offline, sem dependências externas

2. **API QR Server (Fallback 1)**
   - URL: `https://api.qrserver.com/v1/create-qr-code/`
   - Formato: Imagem PNG
   - Vantagens: Simples, confiável

3. **QuickChart (Fallback 2)**
   - URL: `https://quickchart.io/qr`
   - Formato: Imagem PNG
   - Vantagens: Alta disponibilidade

### Exemplo de Uso no Frontend

```javascript
// Prioridade: qr_code_data_url (base64) > qr_code_image_url > fallback
let qrCodeUrl = result.qr_code_data_url || result.qr_code_image_url;

if (!qrCodeUrl && result.qrcode) {
    // Fallback: usar serviço de QR Code online
    qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.qrcode)}`;
}

const img = document.createElement('img');
img.src = qrCodeUrl;
img.onerror = function() {
    // Fallback secundário
    this.src = `https://quickchart.io/qr?text=${encodeURIComponent(result.qrcode)}&size=300`;
};
```

## ✅ Validações Implementadas

### Frontend

- **Nome**: Obrigatório, mínimo 3 caracteres
- **Email**: Formato válido (regex)
- **CPF**: 11 dígitos, apenas números
- **Telefone**: Apenas números, mínimo 10 dígitos
- **CEP**: 8 dígitos
- **Endereço**: Obrigatório
- **Número**: Obrigatório
- **Bairro**: Obrigatório

### Backend (Netlify Function)

- **Amount**: Número válido, formato 00.00
- **CPF**: Exatamente 11 dígitos
- **Email**: Formato válido (regex)
- **Campos obrigatórios**: Verifica presença de todos os campos

## 🧪 Testes

### Testar Localmente

1. Instalar dependências:
```bash
npm install
```

2. Instalar Netlify CLI (se necessário):
```bash
npm install -g netlify-cli
```

3. Executar servidor local:
```bash
netlify dev
```

4. Acessar: `http://localhost:8888/checkout-integrado.html`

### Testar em Produção

1. Deploy no Netlify:
```bash
netlify deploy --prod
```

2. Configurar variáveis de ambiente no dashboard do Netlify

3. Testar o checkout completo

## 🐛 Debugging

### Logs no Console

O sistema gera logs detalhados:

```javascript
console.log('Gerando PIX com dados:', { ...payload, token: '***', secret: '***' });
console.log('Tentando Netlify Function...');
console.log('✓ Resposta Netlify Function:', result);
console.log('⚠ Netlify Function não disponível:', netlifyError.message);
console.log('→ Chamando API Trex Pay diretamente...');
console.log('✓ PIX gerado com sucesso!');
console.log('  - ID Transação:', result.idTransaction);
console.log('  - Código PIX:', result.qrcode.substring(0, 50) + '...');
console.log('  - Método usado:', usedNetlifyFunction ? 'Netlify Function' : 'API Direta');
```

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| "Netlify Function não disponível" | Servidor local sem Netlify CLI | Use `netlify dev` ou aguarde fallback |
| "CPF inválido" | CPF com menos de 11 dígitos | Verificar máscara e limpeza |
| "API Trex Pay retornou erro" | Credenciais inválidas | Verificar token e secret |
| "Erro ao gerar QR Code" | Código PIX inválido | Verificar resposta da API |

## 📦 Dependências

### NPM Packages

```json
{
  "dependencies": {
    "qrcode": "^1.5.4"
  }
}
```

### CDN (Frontend)

- **SweetAlert2**: Modais e alertas
- **Font Awesome**: Ícones

## 🚀 Deploy

### Netlify (Recomendado)

1. Conectar repositório ao Netlify
2. Configurar variáveis de ambiente:
   - `TREX_PAY_TOKEN`
   - `TREX_PAY_SECRET`
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `public`
4. Deploy automático a cada commit

### Outros Hosts

O sistema funciona em qualquer host estático, mas:
- ⚠️ Netlify Functions não estarão disponíveis
- ✅ Fallback automático para API direta
- ⚠️ Credenciais expostas no código JavaScript

## 🔧 Manutenção

### Atualizar Credenciais

**Netlify:**
1. Acesse Site Settings > Environment Variables
2. Atualize `TREX_PAY_TOKEN` e `TREX_PAY_SECRET`
3. Redeploy não é necessário

**Código (Fallback):**
1. Edite `checkout-integrado.html`
2. Atualize `PIX_API_TOKEN` e `PIX_API_SECRET`
3. Faça commit e push

### Monitoramento

- Logs do Netlify: Dashboard > Functions > Logs
- Console do navegador: F12 > Console
- Transações: Dashboard Trex Pay

## 📞 Suporte

### Trex Pay
- Site: https://app.trexpay.com.br
- Documentação: https://docs.trexpay.com.br

### Netlify
- Site: https://www.netlify.com
- Documentação: https://docs.netlify.com

## 📝 Changelog

### v2.0.0 (Atual)
- ✅ Geração de QR code integrada na Netlify Function
- ✅ Sistema de fallback triplo para QR codes
- ✅ Validações aprimoradas no backend
- ✅ Logs detalhados para debugging
- ✅ Tratamento de erros melhorado
- ✅ Timeout configurável (30s)
- ✅ Suporte a Data URLs (base64)

### v1.0.0
- ✅ Implementação básica da API PIX
- ✅ Fallback para API direta
- ✅ Validação de formulário
- ✅ Geração de QR code via API externa

## 🎯 Próximos Passos

- [ ] Webhook para confirmação automática de pagamento
- [ ] Painel administrativo para gerenciar pedidos
- [ ] Notificações por email/SMS
- [ ] Integração com sistema de delivery
- [ ] Relatórios de vendas
- [ ] Programa de fidelidade

---

**Desenvolvido com ❤️ para Art Burger**
