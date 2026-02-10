const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
// const open = require('open');

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

userStages = {}; // Para controlar em qual etapa do atendimento o usuário está
userTimers = {}; // Para controlar o tempo de inatividade

const TEMPO_EXPIRACAO = 600000; // 10 minutos

// client.on('message', async message => {

//     if (message.from.includes('@g.us') || message.isStatus) return; // Ignora mensagens de grupos e status

//     const idUsuario = message.from;
//     const msg = message.body.toLowerCase();

//     if (userStages[idUsuario]) {
//         clearTimeout(userTimers[idUsuario]); // Limpa o timer toda vez que o usuário interage
//     }

//     userTimers[idUsuario] = setTimeout(() => {
//         if (userStages[idUsuario]) {
//             client.sendMessage(idUsuario, "⚠️ *Atendimento encerrado por inatividade.* \n Envie 'Oi' para começar de novo.")
//             delete userStages[idUsuario];
//         }
//     })

//     // Lógica de resposta
//     if (message.hasMedia) {
//         client.sendMessage(message.from, config.saudacao_arquivo);
//         client.sendMessage(message.from, config.menu_arquivo);
//     }
//     else {
//         client.sendMessage(message.from, config.saudacao);
//         client.sendMessage(message.from, config.menu);
//     }
    
//     // Resposta para opções do menu
//     if (message.body === '1') {
//         if (message.hasMedia) {
//             client.sendMessage(message.from, config.preco_arquivo);
//         } else {
//         client.sendMessage(message.from, config.preco);
//         }
//     }
//     if (message.body === '2') {
//         if (message.hasMedia) {
//             client.sendMessage(message.from, config.suporte_arquivo);
//         } else {
//         client.sendMessage(message.from, config.suporte);
//         }
//     }
// });

// --- INICIALIZAÇÃO ---
client.initialize();

app.listen(PORT, async () => {
    console.log(`Painel de Configuração rodando em: http://localhost:${PORT}`);
    
    // Tenta abrir o navegador automaticamente usando importação dinâmica
    try {
        const open = (await import('open')).default;
        await open(`http://localhost:${PORT}`);
        console.log("Navegador aberto com sucesso!");
    } catch (erro) {
        console.error("Não foi possível abrir o navegador automaticamente:", erro.message);
    }
});