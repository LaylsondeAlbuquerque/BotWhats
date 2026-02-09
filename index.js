const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const open = require('open');

// --- CONFIGURAÇÃO INICIAL ---
const app = express();
const PORT = 3000;
const ARQUIVO_CONFIG = 'config.json';

// Configura o Express para ler JSON e servir arquivos estáticos (o site)
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- FUNÇÕES DE ARQUIVO ---
// Função para carregar as mensagens salvas
function carregarConfig() {
    if (!fs.existsSync(ARQUIVO_CONFIG)) {
        // Se não existir, cria um padrão
        const padrao = { saudacao: "Olá! Como posso ajudar?", menu: "1. Preços\n2. Suporte", saudacao_arquivo:"Olá! Que bom te ter aqui! Como posso te ajudar?", menu_arquivo:"1. Imprimir\n2. Orçamento", suporte:"Por favor, aguarde, você será atendido por um de nossos atendentes em breve.", preco: "Por favor, aguarde, você será atendido por um de nossos atendentes em breve." };
        fs.writeFileSync(ARQUIVO_CONFIG, JSON.stringify(padrao));
        return padrao;
    }
    return JSON.parse(fs.readFileSync(ARQUIVO_CONFIG));
}

// Função para salvar as novas mensagens
function salvarConfig(dados) {
    fs.writeFileSync(ARQUIVO_CONFIG, JSON.stringify(dados));
}

// --- ROTAS DA INTERFACE (API) ---
app.get('/api/config', (req, res) => {
    res.json(carregarConfig());
});

app.post('/api/config', (req, res) => {
    salvarConfig(req.body);
    console.log("Configurações atualizadas!");
    res.json({ status: 'sucesso' });
});

// --- LÓGICA DO WHATSAPP ---
const client = new Client({
    authStrategy: new LocalAuth(), // Salva a sessão para não pedir QR Code sempre
    puppeteer: { 
        headless: true, // Roda sem abrir o Chrome visualmente
        args: ['--no-sandbox']
    } 
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('POR FAVOR, ESCANEIE O QR CODE ACIMA COM SEU WHATSAPP.');
});

client.on('ready', () => {
    console.log('TUDO PRONTO! O Bot está conectado.');
});

client.on('message', message => {
    const config = carregarConfig(); // Lê a configuração mais recente a cada mensagem

    // Lógica simples de resposta (pode ser melhorada)
    if (message.hasMedia) {
        client.sendMessage(message.from, config.saudacao_arquivo);
        client.sendMessage(message.from, config.menu_arquivo);
    }
    else {
        client.sendMessage(message.from, config.saudacao);
        client.sendMessage(message.from, config.menu);
    }
    
    // Exemplo de resposta para opções do menu
    if (message.body === '1') {
        client.sendMessage(message.from, "Nossos preços começam em R$ 50,00.");
    }
});

// --- INICIALIZAÇÃO ---
client.initialize();

app.listen(PORT, () => {
    console.log(`Painel de Configuração rodando em: http://localhost:${PORT}`);
});