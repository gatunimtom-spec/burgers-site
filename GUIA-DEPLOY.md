# 🚀 Guia Completo de Deploy no Netlify

## Passo 1: Acessar o Netlify

1. Acesse [https://app.netlify.com/](https://app.netlify.com/)
2. Faça login ou crie uma conta gratuita

## Passo 2: Fazer Upload do Site

### Método Mais Simples (Drag & Drop):

1. Na página inicial do Netlify, você verá uma área escrita **"Want to deploy a new site without connecting to Git? Drag and drop your site output folder here"**
2. Arraste o arquivo `art-burger-netlify-final.zip` para essa área
3. OU clique em **"browse to upload"** e selecione o arquivo ZIP

### Método Alternativo:

1. Clique em **"Add new site"** → **"Deploy manually"**
2. Arraste o arquivo ZIP ou a pasta `art-netlify`
3. Aguarde o upload completar

## Passo 3: Configurar Variáveis de Ambiente (IMPORTANTE!)

Após o deploy inicial, você precisa configurar as credenciais da API Trex Pay:

1. No painel do seu site, clique em **"Site configuration"** (ou **"Site settings"**)
2. No menu lateral, clique em **"Environment variables"**
3. Clique em **"Add a variable"** ou **"Add environment variable"**
4. Adicione as seguintes variáveis:

   **Variável 1:**
   - Key: `TREX_PAY_TOKEN`
   - Value: `b9eb34f2-dafa-41da-97fc-338b2061aa7d`

   **Variável 2:**
   - Key: `TREX_PAY_SECRET`
   - Value: `6d4e99b2-4dcd-46f7-864d-094c468b6032`

5. Clique em **"Save"** para cada variável

## Passo 4: Fazer Redeploy

Após adicionar as variáveis de ambiente, você precisa fazer um novo deploy:

1. Vá em **"Deploys"** no menu superior
2. Clique em **"Trigger deploy"** → **"Deploy site"**
3. Aguarde o deploy completar (geralmente leva 1-2 minutos)

## Passo 5: Testar o Site

1. Após o deploy, clique no link do seu site (algo como `https://seu-site.netlify.app`)
2. Teste o fluxo completo:
   - Clique em um produto na página inicial
   - Escolha adicionais e bebida
   - Preencha os dados de entrega
   - Verifique se o QR Code PIX é gerado corretamente

## 🎨 Personalizar Domínio (Opcional)

1. Vá em **"Domain management"** ou **"Domain settings"**
2. Clique em **"Add custom domain"**
3. Digite seu domínio personalizado (ex: `artburger.com.br`)
4. Siga as instruções para configurar o DNS

## 🔧 Solução de Problemas

### Erro: "Function not found"
- Verifique se as variáveis de ambiente foram configuradas corretamente
- Faça um novo deploy após adicionar as variáveis

### QR Code não aparece
- Abra o console do navegador (F12)
- Verifique se há erros de CORS ou de API
- Confirme que as credenciais da Trex Pay estão corretas

### Site não carrega
- Verifique se o deploy foi concluído com sucesso
- Vá em "Deploys" e veja se há erros no log

## 📱 Testar no Celular

1. Acesse o link do site no seu celular
2. Teste o fluxo completo de compra
3. Escaneie o QR Code PIX com o app do seu banco

## ✅ Checklist Final

- [ ] Site foi feito upload no Netlify
- [ ] Variáveis de ambiente foram configuradas
- [ ] Redeploy foi feito após configurar variáveis
- [ ] Site está acessível pelo link do Netlify
- [ ] Produtos abrem o checkout corretamente
- [ ] QR Code PIX é gerado com sucesso
- [ ] Formulário de entrega valida os campos
- [ ] Confirmação de pedido funciona

## 🎉 Pronto!

Seu site está no ar e funcionando! Agora você pode:
- Compartilhar o link com seus clientes
- Configurar um domínio personalizado
- Adicionar mais produtos editando o `index.html`

---

**Dúvidas?** Consulte a [documentação do Netlify](https://docs.netlify.com/) ou o README.md do projeto.
