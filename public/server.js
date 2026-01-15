const http = require('http');
const url = require('url');
const https = require('https');
const querystring = require('querystring');

const PORT = 3001;

const server = http.createServer((req, res) => {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/generate-pix' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('Dados recebidos:', data);

                // Requisição para Trex Pay
                const payload = JSON.stringify({
                    token: data.token,
                    secret: data.secret,
                    amount: data.amount,
                    debtor_name: data.debtor_name,
                    email: data.email,
                    debtor_document_number: data.debtor_document_number,
                    phone: data.phone,
                    method_pay: 'pix'
                });

                const options = {
                    hostname: 'app.trexpay.com.br',
                    port: 443,
                    path: '/api/wallet/deposit/payment',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Content-Length': Buffer.byteLength(payload)
                    }
                };

                console.log('Enviando para Trex Pay:', payload);

                const trexReq = https.request(options, (trexRes) => {
                    let responseBody = '';

                    trexRes.on('data', chunk => {
                        responseBody += chunk.toString();
                    });

                    trexRes.on('end', () => {
                        console.log('Resposta Trex Pay:', responseBody);
                        console.log('Status:', trexRes.statusCode);

                        try {
                            const trexData = JSON.parse(responseBody);
                            
                            if (trexRes.statusCode === 200 || trexRes.statusCode === 201) {
                                res.writeHead(200);
                                res.end(JSON.stringify({
                                    success: true,
                                    data: trexData
                                }));
                            } else {
                                res.writeHead(400);
                                res.end(JSON.stringify({
                                    success: false,
                                    error: trexData.message || 'Erro ao gerar PIX',
                                    details: trexData
                                }));
                            }
                        } catch (e) {
                            res.writeHead(500);
                            res.end(JSON.stringify({
                                success: false,
                                error: 'Erro ao processar resposta',
                                details: responseBody
                            }));
                        }
                    });
                });

                trexReq.on('error', (error) => {
                    console.error('Erro na requisição:', error);
                    res.writeHead(500);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Erro ao conectar com Trex Pay',
                        details: error.message
                    }));
                });

                trexReq.write(payload);
                trexReq.end();

            } catch (error) {
                console.error('Erro:', error);
                res.writeHead(400);
                res.end(JSON.stringify({
                    success: false,
                    error: 'Erro ao processar requisição'
                }));
            }
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Rota não encontrada' }));
    }
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
