const https = require('https');

// Simular dados de teste
const testData = {
  token: 'b9eb34f2-dafa-41da-97fc-338b2061aa7d',
  secret: '6d4e99b2-4dcd-46f7-864d-094c468b6032',
  amount: '59.90',
  debtor_name: 'João da Silva',
  email: 'joao.silva@email.com',
  debtor_document_number: '12345678901',
  phone: '11987654321',
  method_pay: 'pix'
};

console.log('🧪 Testando API Trex Pay...\n');
console.log('📋 Dados de teste:', {
  ...testData,
  token: '***',
  secret: '***'
});
console.log('\n⏳ Enviando requisição...\n');

const payload = JSON.stringify(testData);

const options = {
  hostname: 'app.trexpay.com.br',
  port: 443,
  path: '/api/wallet/deposit/payment',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  },
  timeout: 30000
};

const req = https.request(options, (res) => {
  let responseBody = '';

  res.on('data', chunk => {
    responseBody += chunk.toString();
  });

  res.on('end', () => {
    console.log('📊 Status Code:', res.statusCode);
    console.log('📦 Headers:', JSON.stringify(res.headers, null, 2));
    console.log('\n📄 Resposta:\n');
    
    try {
      const data = JSON.parse(responseBody);
      console.log(JSON.stringify(data, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ SUCESSO! PIX gerado com sucesso!');
        console.log('\n📱 Informações do PIX:');
        console.log('  - ID Transação:', data.idTransaction);
        console.log('  - Código PIX:', data.qrcode ? data.qrcode.substring(0, 60) + '...' : 'N/A');
        console.log('  - QR Code URL:', data.qr_code_image_url || 'N/A');
      } else {
        console.log('\n❌ ERRO! A API retornou um erro.');
      }
    } catch (e) {
      console.log('⚠️  Resposta não é JSON válido:');
      console.log(responseBody);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Erro na requisição:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  console.error('\n❌ Timeout na requisição (30s)');
  process.exit(1);
});

req.write(payload);
req.end();
