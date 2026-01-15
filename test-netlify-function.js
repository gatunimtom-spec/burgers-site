const QRCode = require('qrcode');

// Simular o handler da função Netlify
const handler = require('./netlify/functions/generate-pix').handler;

// Simular evento HTTP
const mockEvent = {
  httpMethod: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'b9eb34f2-dafa-41da-97fc-338b2061aa7d',
    secret: '6d4e99b2-4dcd-46f7-864d-094c468b6032',
    amount: '59.90',
    debtor_name: 'Maria Santos',
    email: 'maria.santos@email.com',
    debtor_document_number: '98765432100',
    phone: '21987654321',
    method_pay: 'pix'
  })
};

// Simular contexto Netlify
const mockContext = {};

console.log('🧪 Testando Netlify Function...\n');
console.log('📋 Dados de teste:', JSON.parse(mockEvent.body));
console.log('\n⏳ Executando função...\n');

handler(mockEvent, mockContext)
  .then(response => {
    console.log('📊 Status Code:', response.statusCode);
    console.log('📦 Headers:', JSON.stringify(response.headers, null, 2));
    console.log('\n📄 Resposta:\n');
    
    const data = JSON.parse(response.body);
    console.log(JSON.stringify(data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('\n✅ SUCESSO! Netlify Function funcionando corretamente!');
      console.log('\n📱 Informações do PIX:');
      console.log('  - ID Transação:', data.idTransaction);
      console.log('  - Código PIX:', data.qrcode ? data.qrcode.substring(0, 60) + '...' : 'N/A');
      console.log('  - QR Code URL:', data.qr_code_image_url ? 'Presente' : 'N/A');
      console.log('  - QR Code Data URL:', data.qr_code_data_url ? 'Presente (base64)' : 'N/A');
      
      // Testar geração de QR Code
      if (data.qrcode) {
        console.log('\n🎨 Testando geração de QR Code...');
        QRCode.toDataURL(data.qrcode, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          width: 300,
          margin: 2
        })
        .then(dataUrl => {
          console.log('✅ QR Code gerado com sucesso!');
          console.log('  - Formato: Data URL (base64)');
          console.log('  - Tamanho:', dataUrl.length, 'caracteres');
          console.log('  - Preview:', dataUrl.substring(0, 50) + '...');
        })
        .catch(err => {
          console.error('❌ Erro ao gerar QR Code:', err.message);
        });
      }
    } else {
      console.log('\n❌ ERRO! A função retornou um erro.');
    }
  })
  .catch(error => {
    console.error('\n❌ Erro ao executar função:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
