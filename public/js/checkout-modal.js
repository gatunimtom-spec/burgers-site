// Configurações da API Trex Pay
const TREX_PAY_CONFIG = {
    endpoint: 'https://app.trexpay.com.br/api/wallet/deposit/payment',
    token: 'b9eb34f2-dafa-41da-97fc-338b2061aa7d',
    secret: '6d4e99b2-4dcd-46f7-864d-094c468b6032'
};

// Adicionais disponíveis
const ADDITIONALS = [
    { id: 1, name: 'Anel de Cebola Amilanesa', price: 0 },
    { id: 2, name: 'Queijo Provolone', price: 0 },
    { id: 3, name: 'Queijo Cheddar', price: 0 },
    { id: 4, name: 'Queijo Americano', price: 0 },
    { id: 5, name: 'Catupiry', price: 0 },
    { id: 6, name: 'Bacon', price: 0 },
];

const DRINKS = [
    { id: 7, name: 'Guaraná Antartica', price: 0 },
    { id: 8, name: 'Fanta Laranja', price: 0 },
    { id: 9, name: 'Coca-Cola', price: 0 },
    { id: 10, name: 'Guaraná Antartica Zero', price: 0 },
    { id: 11, name: 'Fanta Zero', price: 0 },
    { id: 12, name: 'Coca-Cola Zero', price: 0 },
];

// Estado global do checkout
let checkoutState = {
    currentStep: 1,
    product: null,
    selectedAdditionals: new Map(),
    selectedDrinks: new Map(),
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerCPF: '',
    customerZipCode: '',
    customerAddress: '',
    customerNumber: '',
    customerNeighborhood: '',
    customerComplement: '',
    pixCode: '',
    pixQrCode: '',
    transactionId: ''
};

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    injectCheckoutModal();
    interceptProductLinks();
});

function injectCheckoutModal() {
    const modalHTML = `
    <div id="checkoutModal" class="checkout-modal" style="display: none;">
        <div class="checkout-overlay" onclick="closeCheckout()"></div>
        <div class="checkout-container">
            <header class="checkout-header">
                <div class="checkout-logo">
                    <i class="fas fa-burger"></i>
                    Art Burger - Checkout
                </div>
                <button class="checkout-close" onclick="closeCheckout()">
                    <i class="fas fa-times"></i>
                </button>
            </header>

            <div class="checkout-steps">
                <div class="checkout-step active" data-step="1">
                    <span class="step-number">1</span>
                    <span class="step-label">Adicionais</span>
                </div>
                <div class="checkout-step" data-step="2">
                    <span class="step-number">2</span>
                    <span class="step-label">Entrega</span>
                </div>
                <div class="checkout-step" data-step="3">
                    <span class="step-number">3</span>
                    <span class="step-label">Pagamento</span>
                </div>
            </div>

            <div class="checkout-content">
                <!-- STEP 1: ADICIONAIS -->
                <div id="checkout-step-1" class="checkout-step-content active">
                    <h2>Escolha seus Adicionais</h2>
                    
                    <div class="checkout-product-card">
                        <img id="checkoutProductImage" src="" alt="Produto">
                        <div class="checkout-product-info">
                            <h3 id="checkoutProductName"></h3>
                            <p id="checkoutProductDescription"></p>
                            <div class="checkout-price">R$ <span id="checkoutProductPrice">0.00</span></div>
                        </div>
                    </div>

                    <div class="checkout-category-header">
                        <span>Adicionais</span>
                        <span id="checkout-additionals-count">0/2</span>
                    </div>
                    <div class="checkout-category-items" id="checkout-additionals-list"></div>

                    <div class="checkout-category-header">
                        <span>Refrigerantes (2 LITROS)</span>
                        <span id="checkout-drinks-count">0/1</span>
                    </div>
                    <div class="checkout-category-items" id="checkout-drinks-list"></div>

                    <div class="checkout-button-group">
                        <button class="checkout-btn-primary" onclick="checkoutNextStep()">Continuar</button>
                    </div>
                </div>

                <!-- STEP 2: ENTREGA -->
                <div id="checkout-step-2" class="checkout-step-content">
                    <h2>Dados de Entrega</h2>

                    <div class="checkout-form-group">
                        <label>Nome Completo *</label>
                        <input type="text" id="checkoutCustomerName" placeholder="Ex: João Silva">
                    </div>

                    <div class="checkout-form-group">
                        <label>Email *</label>
                        <input type="email" id="checkoutCustomerEmail" placeholder="joao@example.com">
                    </div>

                    <div class="checkout-form-group">
                        <label>CPF *</label>
                        <input type="text" id="checkoutCustomerCPF" placeholder="000.000.000-00" maxlength="14">
                    </div>

                    <div class="checkout-form-group">
                        <label>Telefone/WhatsApp * (com DDD)</label>
                        <input type="tel" id="checkoutCustomerPhone" placeholder="(11) 99999-9999">
                    </div>

                    <div class="checkout-form-group">
                        <label>CEP *</label>
                        <input type="text" id="checkoutCustomerZipCode" placeholder="00000-000" maxlength="9">
                    </div>

                    <div class="checkout-form-group">
                        <label>Rua *</label>
                        <input type="text" id="checkoutCustomerAddress" placeholder="Avenida Paulista">
                    </div>

                    <div class="checkout-form-row">
                        <div class="checkout-form-group">
                            <label>Número *</label>
                            <input type="text" id="checkoutCustomerNumber" placeholder="1000">
                        </div>
                        <div class="checkout-form-group">
                            <label>Bairro *</label>
                            <input type="text" id="checkoutCustomerNeighborhood" placeholder="Bela Vista">
                        </div>
                    </div>

                    <div class="checkout-form-group">
                        <label>Complemento (Opcional)</label>
                        <input type="text" id="checkoutCustomerComplement" placeholder="Apto 101">
                    </div>

                    <div class="checkout-button-group">
                        <button class="checkout-btn-secondary" onclick="checkoutPreviousStep()">Voltar</button>
                        <button class="checkout-btn-primary" onclick="checkoutNextStep()">Ir para Pagamento</button>
                    </div>
                </div>

                <!-- STEP 3: PAGAMENTO -->
                <div id="checkout-step-3" class="checkout-step-content">
                    <h2>Pagamento via PIX</h2>

                    <div class="checkout-alert checkout-alert-info">
                        <i class="fas fa-info-circle"></i>
                        <span>Escaneie o QR Code abaixo ou copie o código PIX para realizar o pagamento.</span>
                    </div>

                    <div class="checkout-loading" id="checkoutLoading" style="display: none;">
                        <div class="checkout-spinner"></div>
                        <p>Gerando QR Code...</p>
                    </div>

                    <div class="checkout-qr-container" id="checkoutQrContainer" style="display: none;">
                        <img id="checkoutQrImage" src="" alt="QR Code PIX" style="width: 256px; height: 256px; border: 2px solid #ddd; border-radius: 4px;">
                        <p style="color: #666; font-size: 12px; margin-top: 10px;">Escaneie com seu celular</p>
                    </div>

                    <div class="checkout-form-group">
                        <label>Código Copia e Cola</label>
                        <div class="checkout-pix-code">
                            <input type="text" id="checkoutPixCode" readonly>
                            <button onclick="copyCheckoutPixCode()">
                                <i class="fas fa-copy"></i>
                                Copiar
                            </button>
                        </div>
                    </div>

                    <div class="checkout-alert checkout-alert-success">
                        <i class="fas fa-check-circle"></i>
                        <span>Após realizar o pagamento, seu pedido será confirmado automaticamente.</span>
                    </div>

                    <div class="checkout-button-group">
                        <button class="checkout-btn-secondary" onclick="checkoutPreviousStep()">Voltar</button>
                        <button class="checkout-btn-primary" onclick="finalizeCheckoutPurchase()">Finalizar Compra</button>
                    </div>
                </div>

                <!-- SUCCESS MESSAGE -->
                <div id="checkout-step-success" class="checkout-step-content">
                    <div class="checkout-success-message">
                        <i class="fas fa-check-circle"></i>
                        <h2>Pedido Confirmado!</h2>
                        <p>Seu pedido foi recebido com sucesso.</p>
                        <p id="checkoutSuccessMessage"></p>
                        <button class="checkout-btn-primary" onclick="closeCheckout()" style="margin-top: 20px;">Fechar</button>
                    </div>
                </div>
            </div>

            <div class="checkout-sidebar">
                <h3>Resumo do Pedido</h3>
                <div id="checkoutSummary"></div>
                <div class="checkout-summary-item checkout-summary-total">
                    <span>Total:</span>
                    <span>R$ <span id="checkoutTotalPrice">0.00</span></span>
                </div>
            </div>
        </div>
    </div>

    <style>
        .checkout-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .checkout-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }

        .checkout-container {
            position: relative;
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 1000px;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .checkout-header {
            background: #EA1D2C;
            color: white;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #d91a26;
        }

        .checkout-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: bold;
        }

        .checkout-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .checkout-close:hover {
            transform: scale(1.2);
        }

        .checkout-steps {
            display: flex;
            gap: 20px;
            padding: 15px 20px;
            background: #f5f5f5;
            border-bottom: 1px solid #ddd;
            overflow-x: auto;
        }

        .checkout-step {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #999;
            cursor: pointer;
            transition: color 0.3s;
            white-space: nowrap;
        }

        .checkout-step.active {
            color: #EA1D2C;
            font-weight: bold;
        }

        .checkout-step .step-number {
            background: #ddd;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }

        .checkout-step.active .step-number {
            background: #EA1D2C;
            color: white;
        }

        .checkout-content {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            gap: 20px;
        }

        .checkout-step-content {
            display: none;
            flex: 1;
        }

        .checkout-step-content.active {
            display: block;
        }

        .checkout-sidebar {
            width: 300px;
            background: #f9f9f9;
            padding: 20px;
            border-left: 1px solid #ddd;
            overflow-y: auto;
            max-height: calc(90vh - 120px);
        }

        .checkout-sidebar h3 {
            font-size: 16px;
            margin-bottom: 15px;
            border-bottom: 2px solid #EA1D2C;
            padding-bottom: 10px;
            color: #EA1D2C;
        }

        .checkout-summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 13px;
            color: #666;
        }

        .checkout-summary-total {
            border-top: 2px solid #ddd;
            padding-top: 10px;
            font-size: 16px;
            font-weight: bold;
            color: #EA1D2C;
        }

        .checkout-product-card {
            border: 2px solid #EA1D2C;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
        }

        .checkout-product-card img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
        }

        .checkout-product-info {
            flex: 1;
        }

        .checkout-product-info h3 {
            margin-bottom: 5px;
            font-size: 14px;
        }

        .checkout-product-info p {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
        }

        .checkout-price {
            font-size: 16px;
            font-weight: bold;
            color: #EA1D2C;
        }

        .checkout-category-header {
            background: #ddd;
            padding: 10px 15px;
            border-radius: 4px;
            margin-top: 15px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-size: 14px;
        }

        .checkout-category-items {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 15px;
        }

        .checkout-item-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            transition: all 0.3s;
            font-size: 14px;
        }

        .checkout-item-option:hover {
            background: #f9f9f9;
        }

        .checkout-item-option label {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            cursor: pointer;
        }

        .checkout-item-option input[type="checkbox"],
        .checkout-item-option input[type="radio"] {
            width: 16px;
            height: 16px;
            cursor: pointer;
        }

        .checkout-quantity-control {
            display: flex;
            align-items: center;
            gap: 6px;
            background: #f0f0f0;
            border-radius: 4px;
            padding: 3px 6px;
        }

        .checkout-quantity-control button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
            color: #EA1D2C;
            padding: 0 3px;
            transition: transform 0.2s;
        }

        .checkout-quantity-control button:hover {
            transform: scale(1.2);
        }

        .checkout-quantity-control input {
            width: 25px;
            text-align: center;
            border: none;
            background: none;
            font-weight: bold;
            font-size: 12px;
        }

        .checkout-form-group {
            margin-bottom: 12px;
        }

        .checkout-form-group label {
            display: block;
            margin-bottom: 4px;
            font-weight: 500;
            color: #333;
            font-size: 14px;
        }

        .checkout-form-group input,
        .checkout-form-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 13px;
            transition: border-color 0.3s;
        }

        .checkout-form-group input:focus,
        .checkout-form-group select:focus {
            outline: none;
            border-color: #EA1D2C;
            box-shadow: 0 0 0 2px rgba(234, 29, 44, 0.1);
        }

        .checkout-form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }

        .checkout-qr-container {
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
        }

        .checkout-pix-code {
            background: #f9f9f9;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ddd;
            margin-bottom: 10px;
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .checkout-pix-code input {
            flex: 1;
            border: none;
            background: none;
            font-family: monospace;
            font-size: 11px;
            padding: 0;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .checkout-pix-code button {
            background: #EA1D2C;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            transition: background 0.3s;
            white-space: nowrap;
        }

        .checkout-pix-code button:hover {
            background: #d91a26;
        }

        .checkout-button-group {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .checkout-btn-primary,
        .checkout-btn-secondary {
            flex: 1;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }

        .checkout-btn-primary {
            background: #EA1D2C;
            color: white;
        }

        .checkout-btn-primary:hover {
            background: #d91a26;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(234, 29, 44, 0.3);
        }

        .checkout-btn-primary:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }

        .checkout-btn-secondary {
            background: #f0f0f0;
            color: #333;
        }

        .checkout-btn-secondary:hover {
            background: #e0e0e0;
        }

        .checkout-alert {
            padding: 12px 15px;
            border-radius: 4px;
            margin-bottom: 15px;
            display: flex;
            gap: 10px;
            align-items: flex-start;
            font-size: 13px;
        }

        .checkout-alert-info {
            background: #e3f2fd;
            color: #1976d2;
            border-left: 4px solid #1976d2;
        }

        .checkout-alert-success {
            background: #e8f5e9;
            color: #388e3c;
            border-left: 4px solid #388e3c;
        }

        .checkout-alert-error {
            background: #ffebee;
            color: #c62828;
            border-left: 4px solid #c62828;
        }

        .checkout-loading {
            text-align: center;
            padding: 40px 20px;
        }

        .checkout-spinner {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #EA1D2C;
            border-radius: 50%;
            animation: checkoutSpin 1s linear infinite;
            margin-bottom: 15px;
        }

        @keyframes checkoutSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .checkout-success-message {
            text-align: center;
            padding: 40px 20px;
        }

        .checkout-success-message i {
            font-size: 50px;
            color: #4caf50;
            margin-bottom: 15px;
            display: block;
        }

        .checkout-success-message h2 {
            color: #4caf50;
            margin-bottom: 10px;
        }

        .checkout-success-message p {
            color: #666;
            margin-bottom: 15px;
            font-size: 14px;
        }

        @media (max-width: 768px) {
            .checkout-container {
                width: 95%;
                max-height: 95vh;
            }

            .checkout-content {
                flex-direction: column;
                padding: 15px;
            }

            .checkout-sidebar {
                width: 100%;
                border-left: none;
                border-top: 1px solid #ddd;
                max-height: none;
            }

            .checkout-form-row {
                grid-template-columns: 1fr;
            }

            .checkout-steps {
                gap: 10px;
            }
        }
    </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function interceptProductLinks() {
    document.addEventListener('click', function(e) {
        const productLink = e.target.closest('a.disponivel');
        if (productLink) {
            e.preventDefault();
            
            const productName = productLink.querySelector('h3')?.textContent || 'Produto';
            const productDescription = productLink.querySelector('span')?.textContent || '';
            const priceText = productLink.querySelector('.preco')?.textContent || 'R$ 0,00';
            const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            const image = productLink.querySelector('img')?.src || 'images/cover.png';

            openCheckout({
                name: productName,
                description: productDescription,
                price: price,
                image: image
            });
        }
    });
}

function openCheckout(product) {
    checkoutState.currentStep = 1;
    checkoutState.product = product;
    checkoutState.selectedAdditionals.clear();
    checkoutState.selectedDrinks.clear();

    document.getElementById('checkoutProductName').textContent = product.name;
    document.getElementById('checkoutProductDescription').textContent = product.description;
    document.getElementById('checkoutProductPrice').textContent = product.price.toFixed(2);
    document.getElementById('checkoutProductImage').src = product.image;

    renderCheckoutAdditionals();
    renderCheckoutDrinks();
    updateCheckoutSummary();
    goToCheckoutStep(1);

    document.getElementById('checkoutModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    checkoutState.selectedAdditionals.clear();
    checkoutState.selectedDrinks.clear();
}

function renderCheckoutAdditionals() {
    const container = document.getElementById('checkout-additionals-list');
    container.innerHTML = ADDITIONALS.map(item => `
        <div class="checkout-item-option">
            <label>
                <input type="checkbox" value="${item.id}" onchange="toggleCheckoutAdditional(${item.id})">
                <span>${item.name}</span>
            </label>
            <div class="checkout-quantity-control">
                <button onclick="decrementCheckoutAdditional(${item.id})">−</button>
                <input type="text" value="0" readonly id="checkout-qty-${item.id}">
                <button onclick="incrementCheckoutAdditional(${item.id})">+</button>
            </div>
        </div>
    `).join('');
}

function renderCheckoutDrinks() {
    const container = document.getElementById('checkout-drinks-list');
    container.innerHTML = DRINKS.map(item => `
        <div class="checkout-item-option">
            <label>
                <input type="radio" name="checkout-drinks" value="${item.id}" onchange="selectCheckoutDrink(${item.id})">
                <span>${item.name}</span>
            </label>
        </div>
    `).join('');
}

function toggleCheckoutAdditional(id) {
    const checkbox = document.querySelector(`input[value="${id}"]`);
    if (checkbox.checked) {
        if (checkoutState.selectedAdditionals.size < 2) {
            checkoutState.selectedAdditionals.set(id, 1);
            document.getElementById(`checkout-qty-${id}`).value = '1';
        } else {
            checkbox.checked = false;
            showCheckoutAlert('Limite atingido', 'Você pode selecionar até 2 adicionais', 'warning');
        }
    } else {
        checkoutState.selectedAdditionals.delete(id);
        document.getElementById(`checkout-qty-${id}`).value = '0';
    }
    updateCheckoutSummary();
}

function incrementCheckoutAdditional(id) {
    if (!checkoutState.selectedAdditionals.has(id)) {
        if (checkoutState.selectedAdditionals.size < 2) {
            checkoutState.selectedAdditionals.set(id, 1);
            document.querySelector(`input[value="${id}"]`).checked = true;
        } else {
            showCheckoutAlert('Limite atingido', 'Você pode selecionar até 2 adicionais', 'warning');
            return;
        }
    } else {
        checkoutState.selectedAdditionals.set(id, checkoutState.selectedAdditionals.get(id) + 1);
    }
    document.getElementById(`checkout-qty-${id}`).value = checkoutState.selectedAdditionals.get(id);
    updateCheckoutSummary();
}

function decrementCheckoutAdditional(id) {
    if (checkoutState.selectedAdditionals.has(id)) {
        const qty = checkoutState.selectedAdditionals.get(id) - 1;
        if (qty <= 0) {
            checkoutState.selectedAdditionals.delete(id);
            document.querySelector(`input[value="${id}"]`).checked = false;
            document.getElementById(`checkout-qty-${id}`).value = '0';
        } else {
            checkoutState.selectedAdditionals.set(id, qty);
            document.getElementById(`checkout-qty-${id}`).value = qty;
        }
    }
    updateCheckoutSummary();
}

function selectCheckoutDrink(id) {
    checkoutState.selectedDrinks.clear();
    checkoutState.selectedDrinks.set(id, 1);
    updateCheckoutSummary();
}

function updateCheckoutSummary() {
    let summary = `<div class="checkout-summary-item"><strong>${checkoutState.product.name.substring(0, 35)}...</strong></div>`;

    if (checkoutState.selectedAdditionals.size > 0) {
        checkoutState.selectedAdditionals.forEach((qty, id) => {
            const item = ADDITIONALS.find(a => a.id === id);
            if (item) {
                summary += `<div class="checkout-summary-item"><span>${item.name} x${qty}</span></div>`;
            }
        });
    }

    if (checkoutState.selectedDrinks.size > 0) {
        checkoutState.selectedDrinks.forEach((qty, id) => {
            const item = DRINKS.find(d => d.id === id);
            if (item) {
                summary += `<div class="checkout-summary-item"><span>🥤 ${item.name}</span></div>`;
            }
        });
    }

    document.getElementById('checkoutSummary').innerHTML = summary;
    
    document.getElementById('checkout-additionals-count').textContent = `${checkoutState.selectedAdditionals.size}/2`;
    document.getElementById('checkout-drinks-count').textContent = `${checkoutState.selectedDrinks.size}/1`;

    let total = checkoutState.product.price;
    checkoutState.selectedAdditionals.forEach((qty, id) => {
        const item = ADDITIONALS.find(a => a.id === id);
        if (item) total += item.price * qty;
    });
    checkoutState.selectedDrinks.forEach((qty, id) => {
        const item = DRINKS.find(d => d.id === id);
        if (item) total += item.price * qty;
    });

    document.getElementById('checkoutTotalPrice').textContent = total.toFixed(2);
}

function checkoutNextStep() {
    if (checkoutState.currentStep === 1) {
        if (checkoutState.selectedDrinks.size === 0) {
            showCheckoutAlert('Selecione uma bebida', 'Você precisa escolher um refrigerante', 'warning');
            return;
        }
        goToCheckoutStep(2);
    } else if (checkoutState.currentStep === 2) {
        if (!validateCheckoutDeliveryForm()) {
            return;
        }
        goToCheckoutStep(3);
        generateCheckoutPixPayment();
    }
}

function checkoutPreviousStep() {
    if (checkoutState.currentStep > 1) {
        goToCheckoutStep(checkoutState.currentStep - 1);
    }
}

function goToCheckoutStep(step) {
    document.querySelectorAll('.checkout-step-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`checkout-step-${step}`).classList.add('active');

    document.querySelectorAll('.checkout-step').forEach(el => el.classList.remove('active'));
    document.querySelector(`.checkout-step[data-step="${step}"]`)?.classList.add('active');

    checkoutState.currentStep = step;
}

function validateCheckoutDeliveryForm() {
    checkoutState.customerName = document.getElementById('checkoutCustomerName').value.trim();
    checkoutState.customerEmail = document.getElementById('checkoutCustomerEmail').value.trim();
    checkoutState.customerCPF = document.getElementById('checkoutCustomerCPF').value.trim();
    checkoutState.customerPhone = document.getElementById('checkoutCustomerPhone').value.trim();
    checkoutState.customerZipCode = document.getElementById('checkoutCustomerZipCode').value.trim();
    checkoutState.customerAddress = document.getElementById('checkoutCustomerAddress').value.trim();
    checkoutState.customerNumber = document.getElementById('checkoutCustomerNumber').value.trim();
    checkoutState.customerNeighborhood = document.getElementById('checkoutCustomerNeighborhood').value.trim();
    checkoutState.customerComplement = document.getElementById('checkoutCustomerComplement').value.trim();

    if (!checkoutState.customerName || !checkoutState.customerEmail || !checkoutState.customerCPF || 
        !checkoutState.customerPhone || !checkoutState.customerZipCode || 
        !checkoutState.customerAddress || !checkoutState.customerNumber || !checkoutState.customerNeighborhood) {
        showCheckoutAlert('Campos obrigatórios', 'Preencha todos os campos obrigatórios', 'error');
        return false;
    }

    if (!isValidEmail(checkoutState.customerEmail)) {
        showCheckoutAlert('Email inválido', 'Por favor, insira um email válido', 'error');
        return false;
    }

    if (!isValidCPF(checkoutState.customerCPF)) {
        showCheckoutAlert('CPF inválido', 'Por favor, insira um CPF válido (000.000.000-00)', 'error');
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.length === 11;
}

async function generateCheckoutPixPayment() {
    document.getElementById('checkoutLoading').style.display = 'block';
    document.getElementById('checkoutQrContainer').style.display = 'none';
    document.getElementById('checkoutPixCode').value = '';

    try {
        let total = checkoutState.product.price;
        checkoutState.selectedAdditionals.forEach((qty, id) => {
            const item = ADDITIONALS.find(a => a.id === id);
            if (item) total += item.price * qty;
        });
        checkoutState.selectedDrinks.forEach((qty, id) => {
            const item = DRINKS.find(d => d.id === id);
            if (item) total += item.price * qty;
        });

        // Limpar CPF (remover pontos e traços)
        const cpfClean = checkoutState.customerCPF.replace(/\D/g, '');
        
        // Formatar phone (sem +55, apenas números)
        const phoneClean = checkoutState.customerPhone.replace(/\D/g, '');

        // Payload conforme documentação
        const payload = {
            token: TREX_PAY_CONFIG.token,
            secret: TREX_PAY_CONFIG.secret,
            amount: total.toFixed(2), // Valor decimal formatado
            debtor_name: checkoutState.customerName,
            email: checkoutState.customerEmail,
            debtor_document_number: cpfClean, // CPF sem máscara
            phone: phoneClean, // Apenas números
            method_pay: 'pix'
        };

        console.log('📤 Gerando PIX com dados:', { ...payload, token: '***', secret: '***' });

        // Tentar chamar a função Netlify primeiro, se falhar, chamar diretamente a API
        let result;
        let usedNetlifyFunction = false;
        
        try {
            console.log('🔄 Tentando Netlify Function...');
            const response = await fetch('/.netlify/functions/generate-pix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            result = await response.json();
            usedNetlifyFunction = true;
            console.log('✅ Resposta Netlify Function:', result);
        } catch (netlifyError) {
            console.log('⚠ Netlify Function não disponível:', netlifyError.message);
            console.log('→ Chamando API Trex Pay diretamente...');
            
            // Fallback: chamar API diretamente
            const response = await fetch(TREX_PAY_CONFIG.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Trex Pay retornou erro: ${response.status} - ${errorText}`);
            }

            result = await response.json();
            console.log('✅ Resposta API Trex Pay:', result);
            
            // Normalizar resposta
            if (result.qrcode) {
                result.success = true;
            }
        }

        if (result.success || result.qrcode) {
            // Armazenar código PIX
            checkoutState.pixCode = result.qrcode;
            checkoutState.transactionId = result.idTransaction || result.id || 'UNKNOWN';

            console.log('✅ PIX gerado com sucesso!');
            console.log('  - ID Transação:', checkoutState.transactionId);
            console.log('  - Código PIX:', result.qrcode ? result.qrcode.substring(0, 50) + '...' : 'N/A');
            console.log('  - Método usado:', usedNetlifyFunction ? 'Netlify Function' : 'API Direta');

            // Exibir código PIX
            document.getElementById('checkoutPixCode').value = result.qrcode;

            // Gerar QR Code
            const qrContainer = document.getElementById('checkoutQrContainer');
            const qrImage = document.getElementById('checkoutQrImage');
            
            // Prioridade: qr_code_data_url (base64) > qr_code_image_url > fallback
            let qrCodeUrl = result.qr_code_data_url || result.qr_code_image_url;
            
            if (!qrCodeUrl && result.qrcode) {
                // Fallback: usar serviço de QR Code online
                qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(result.qrcode)}`;
                console.log('→ Usando QR Code externo como fallback');
            }
            
            if (qrCodeUrl) {
                qrImage.src = qrCodeUrl;
                qrImage.alt = 'QR Code PIX';
                
                // Adicionar evento de erro para fallback
                qrImage.onerror = function() {
                    console.log('⚠ Erro ao carregar QR Code, tentando fallback...');
                    this.src = `https://quickchart.io/qr?text=${encodeURIComponent(result.qrcode)}&size=256`;
                };
            } else {
                console.error('❌ Erro: QR Code URL não disponível');
            }
            
            document.getElementById('checkoutLoading').style.display = 'none';
            document.getElementById('checkoutQrContainer').style.display = 'block';
        } else {
            throw new Error(result.error || result.message || 'Erro ao gerar PIX');
        }

    } catch (error) {
        console.error('❌ Erro ao gerar PIX:', error);
        document.getElementById('checkoutLoading').style.display = 'none';
        showCheckoutAlert('Erro', 'Não foi possível gerar o PIX. Tente novamente ou contate o suporte.', 'error');
    }
}

function copyCheckoutPixCode() {
    const pixCode = document.getElementById('checkoutPixCode').value;
    if (!pixCode) {
        showCheckoutAlert('Erro', 'Código PIX não disponível', 'error');
        return;
    }
    navigator.clipboard.writeText(pixCode).then(() => {
        showCheckoutAlert('Copiado!', 'Código PIX copiado para a área de transferência', 'success');
    }).catch(() => {
        showCheckoutAlert('Erro', 'Não foi possível copiar o código', 'error');
    });
}

function finalizeCheckoutPurchase() {
    const pixCode = document.getElementById('checkoutPixCode').value;
    if (!pixCode) {
        showCheckoutAlert('Erro', 'Código PIX não foi gerado. Por favor, volte e tente novamente.', 'error');
        return;
    }

    Swal.fire({
        title: 'Confirmar Pedido',
        text: 'Você realizou o pagamento via PIX?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim, paguei!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            let total = checkoutState.product.price;
            checkoutState.selectedAdditionals.forEach((qty, id) => {
                const item = ADDITIONALS.find(a => a.id === id);
                if (item) total += item.price * qty;
            });
            checkoutState.selectedDrinks.forEach((qty, id) => {
                const item = DRINKS.find(d => d.id === id);
                if (item) total += item.price * qty;
            });

            document.getElementById('checkoutSuccessMessage').innerHTML = `
                <strong>Endereço de entrega:</strong><br>
                ${checkoutState.customerAddress}, ${checkoutState.customerNumber} - ${checkoutState.customerNeighborhood}<br>
                ${checkoutState.customerZipCode}<br><br>
                <strong>Valor total:</strong> R$ ${total.toFixed(2)}<br>
                <strong>Telefone:</strong> ${checkoutState.customerPhone}
            `;

            document.querySelectorAll('.checkout-step-content').forEach(el => el.classList.remove('active'));
            document.getElementById('checkout-step-success').classList.add('active');
        }
    });
}

function showCheckoutAlert(title, message, type) {
    Swal.fire({
        title: title,
        text: message,
        icon: type,
        confirmButtonText: 'OK'
    });
}
