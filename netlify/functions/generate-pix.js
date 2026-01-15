const https = require('https');
const QRCode = require('qrcode');

exports.handler = async (event, context) => {
  // Permitir CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    console.log('Dados recebidos:', {
      ...data,
      token: '***',
      secret: '***'
    });

    // Validar dados obrigatórios
    if (!data.amount || !data.debtor_name || !data.email || !data.debtor_document_number) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Dados obrigatórios faltando'
        })
      };
    }

    // Validar CPF (11 dígitos)
    const cpfClean = data.debtor_document_number.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'CPF inválido. Deve conter 11 dígitos.'
        })
      };
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Email inválido.'
        })
      };
    }

    // Usar credenciais do ambiente Netlify
    const token = process.env.TREX_PAY_TOKEN || data.token;
    const secret = process.env.TREX_PAY_SECRET || data.secret;

    if (!token || !secret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Credenciais da API não configuradas'
        })
      };
    }

    const payload = JSON.stringify({
      token: token,
      secret: secret,
      amount: parseFloat(data.amount).toFixed(2),
      debtor_name: data.debtor_name,
      email: data.email,
      debtor_document_number: cpfClean,
      phone: data.phone ? data.phone.replace(/\D/g, '') : '',
      method_pay: 'pix'
    });

    console.log('Enviando para Trex Pay...');

    const result = await new Promise((resolve, reject) => {
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
        timeout: 30000 // 30 segundos timeout
      };

      const req = https.request(options, (res) => {
        let responseBody = '';

        res.on('data', chunk => {
          responseBody += chunk.toString();
        });

        res.on('end', () => {
          console.log('Status Code:', res.statusCode);
          console.log('Resposta Trex Pay:', responseBody);
          
          try {
            const trexData = JSON.parse(responseBody);
            resolve({
              statusCode: res.statusCode,
              data: trexData
            });
          } catch (e) {
            reject(new Error('Erro ao parsear resposta: ' + responseBody));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Erro na requisição:', error);
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Timeout na requisição à API Trex Pay'));
      });

      req.write(payload);
      req.end();
    });

    if (result.statusCode === 200 || result.statusCode === 201) {
      // Extrair código PIX (pode vir em diferentes campos)
      const pixCode = result.data.qrcode 
        || result.data.qr_code 
        || result.data.pix_code 
        || result.data.qr_code_string
        || result.data.pix?.qrcode
        || result.data.pix?.qr_code
        || null;

      console.log('📋 Código PIX extraído:', pixCode ? pixCode.substring(0, 50) + '...' : 'N/A');
      console.log('📋 Estrutura completa da resposta:', JSON.stringify(result.data, null, 2));

      if (!pixCode) {
        console.error('❌ Código PIX não encontrado na resposta');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Código PIX não encontrado na resposta da API',
            raw: result.data
          })
        };
      }

      // Gerar QR Code como Data URL
      let qrCodeDataUrl = null;
      try {
        qrCodeDataUrl = await QRCode.toDataURL(pixCode, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          width: 300,
          margin: 2
        });
        console.log('✅ QR Code gerado com sucesso (base64)');
      } catch (qrError) {
        console.error('⚠ Erro ao gerar QR Code:', qrError);
        // Usar URL externa como fallback
        qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          qrcode: pixCode,
          qr_code_image_url: qrCodeDataUrl || result.data.qr_code_image_url,
          qr_code_data_url: qrCodeDataUrl, // QR Code em base64
          idTransaction: result.data.idTransaction || result.data.id || result.data.transaction_id,
          message: 'PIX gerado com sucesso'
        })
      };
    } else {
      console.error('Erro da API Trex Pay:', result.data);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: result.data.message || result.data.error || 'Erro ao gerar PIX',
          details: result.data
        })
      };
    }

  } catch (error) {
    console.error('Erro interno:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Erro interno ao processar pagamento',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
