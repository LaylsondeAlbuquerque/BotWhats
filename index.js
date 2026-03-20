/**
 * @file index.js
 * @description Ponto de entrada principal do WhatsBot. 
 * Configura a API Express para o painel de controle e inicializa o cliente do WhatsApp.
 */

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const MessageHandler = require("./src/services/botservices/messageHandler");

// ==========================================
// CONFIGURAÇÃO INICIAL (EXPRESS)
// ==========================================
const app = express();
const PORT = 3000;
const ARQUIVO_CONFIG = "config.json";

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// MANIPULAÇÃO DE ARQUIVOS DE CONFIGURAÇÃO
// ==========================================

/**
 * Carrega as configurações do arquivo JSON.
 * Se o arquivo não existir, cria um objeto de configuração padrão.
 * * @returns {Object} Objeto contendo as configurações atuais do bot.
 */
function carregarConfig() {
  if (!fs.existsSync(ARQUIVO_CONFIG)) {
    const padrao = {
      saudacao: "Olá! Como posso ajudar?",
      opcoes: [],
      horarioInicio: "08:00",
      horarioFim: "18:00",
      almocoInicio: "12:00",
      almocoFim: "14:00",
      diasFuncionamento: ["1", "2", "3", "4", "5"],
      produtos: [],
      categoriasProdutos: [],
    };
    fs.writeFileSync(ARQUIVO_CONFIG, JSON.stringify(padrao, null, 2)); // null, 2 formata o JSON bonitinho
    return padrao;
  }
  return JSON.parse(fs.readFileSync(ARQUIVO_CONFIG, "utf-8"));
}

/**
 * Salva as novas configurações no arquivo JSON.
 * * @param {Object} dados - O objeto de configuração atualizado recebido do frontend.
 */
function salvarConfig(dados) {
  fs.writeFileSync(ARQUIVO_CONFIG, JSON.stringify(dados, null, 2));
}

// ==========================================
// ROTAS DA INTERFACE (API EXPRESS)
// ==========================================
let config = carregarConfig();

app.get("/api/config", (req, res) => {
  res.json(carregarConfig());
});

app.post("/api/config", (req, res) => {
  salvarConfig(req.body);
  config = carregarConfig(); // Atualiza a variável global em memória
  console.log("✅ Configurações atualizadas via painel!");
  res.json({ status: "sucesso" });
});

// ==========================================
// LÓGICA DO WHATSAPP CLIENT
// ==========================================
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Adicionado para evitar erros em alguns servidores
  },
});

const handler = new MessageHandler();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("📲 POR FAVOR, ESCANEIE O QR CODE ACIMA COM SEU WHATSAPP.");
});

client.on("ready", () => {
  console.log("🚀 TUDO PRONTO! O Bot está conectado e aguardando mensagens.");
});

client.on("message", async (message) => {
  // 1. Pega o horário atual em segundos
  const tempoAtual = Math.floor(Date.now() / 1000);

  // 2. Ignora mensagens mais velhas que 2 minutos (120 segundos)
  if (tempoAtual - message.timestamp > 120) {
    console.log("⏳ Mensagem antiga ignorada.");
    return; 
  }
  
  // 3. Ignora mensagens de grupos e status
  if (message.from.includes("@g.us") || message.isStatus) return;

  console.log(`📩 Mensagem recebida de ${message.from}: ${message.body}`);
    
  // 4. Encaminha para o gerenciador central
  handler.handler(client, message, config);
});

// ==========================================
// INICIALIZAÇÃO DOS SERVIÇOS
// ==========================================
client.initialize();

app.listen(PORT, async () => {
  console.log(`🌐 Painel de Configuração rodando em: http://localhost:${PORT}`);

  try {
    const open = (await import("open")).default;
    await open(`http://localhost:${PORT}`);
    console.log("🖥️  Navegador aberto com sucesso!");
  } catch (erro) {
    console.error("⚠️ Não foi possível abrir o navegador automaticamente:", erro.message);
  }
});