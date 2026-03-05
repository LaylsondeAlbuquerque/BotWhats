const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { send } = require("process");
const MessageHadler = require("./src/services/botservices/messageHandler");


// --- CONFIGURAÇÃO INICIAL ---
const app = express();
const PORT = 3000;
const ARQUIVO_CONFIG = "config.json";

// Configura o Express para ler JSON e servir arquivos estáticos (o site)
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// --- FUNÇÕES DE ARQUIVO ---
// Função para carregar as mensagens salvas
function carregarConfig() {
  if (!fs.existsSync(ARQUIVO_CONFIG)) {
    // Se não existir, cria um padrão
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
let config = carregarConfig();

app.get("/api/config", (req, res) => {
  res.json(carregarConfig());
});

app.post("/api/config", (req, res) => {
  salvarConfig(req.body);
  config = carregarConfig();
  console.log("Configurações atualizadas!");
  res.json({ status: "sucesso" });
});

// --- LÓGICA DO WHATSAPP ---
const client = new Client({
  authStrategy: new LocalAuth(), // Salva a sessão para não pedir QR Code sempre
  puppeteer: {
    headless: true, // Roda sem abrir o Chrome visualmente
    args: ["--no-sandbox"],
  },
});

const handler = new MessageHadler()

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("POR FAVOR, ESCANEIE O QR CODE ACIMA COM SEU WHATSAPP.");
});

client.on("ready", () => {
  console.log("TUDO PRONTO! O Bot está conectado.");
});


// =-=-=-=-=-=-=-= FUNÇAO PARA ENVIAR MENSAGENS =-=-=-=-=-=-=-=
client.on("message", async (message) => {

  // 1. Pega o horário atual em segundos
  const tempoAtual = Math.floor(Date.now() / 1000);

  // 2. Se a mensagem for de mais de 2 minutos atrás ele ignora
  if (tempoAtual - message.timestamp > 120) {
      console.log("Mensagem antiga ignorada.");
      return; 
  }
  
  if (message.from.includes("@g.us") || message.isStatus) return; // Ignora mensagens de grupos e status

  console.log(`Mensagem recebida de ${message.from}: ${message.body}`)
    
  handler.handler(client, message, config);
  
});

// --- INICIALIZAÇÃO ---
client.initialize();

app.listen(PORT, async () => {
  console.log(`Painel de Configuração rodando em: http://localhost:${PORT}`);

  // Tenta abrir o navegador automaticamente usando importação dinâmica
  try {
    const open = (await import("open")).default;
    await open(`http://localhost:${PORT}`);
    console.log("Navegador aberto com sucesso!");
  } catch (erro) {
    console.error(
      "Não foi possível abrir o navegador automaticamente:",
      erro.message,
    );
  }
});
