/**
 * @file messageHandler.js
 * @description Gerencia o fluxo inicial de mensagens.
 * Responsável por controlar timers de inatividade (timeout) e evitar respostas duplicadas (debounce).
 */

const MainMenu = require("./mainMenu.service");

const TEMPO_EXPIRACAO = 600000; // 10 minutos em milissegundos
const DEBOUNCE_TIME = 5000;     // 5 segundos em milissegundos

class MessageHandler {
  constructor() {
    this.userStages = {};
    this.userTimers = {};
    this.debounceTimers = {};
    this.mainMenu = new MainMenu();
  }

  /**
   * Processa a mensagem recebida, aplica as regras de tempo e encaminha para o menu.
   * * @param {object} client - Instância do cliente do WhatsApp (whatsapp-web.js).
   * @param {object} message - Objeto da mensagem recebida.
   * @param {object} config - Configurações carregadas do JSON.
   */
  async handler(client, message, config) {
    const idUsuario = message.from;

    // 1. Controle de Inatividade (Timeout)
    // Se o usuário interagiu, limpamos a contagem antiga de encerramento.
    if (this.userStages[idUsuario]) {
      clearTimeout(this.userTimers[idUsuario]);
    }

    // Inicia uma nova contagem. Se zerar, o atendimento cai.
    this.userTimers[idUsuario] = setTimeout(async () => {
      if (this.userStages[idUsuario]) {
        await client.sendMessage(
          idUsuario,
          "⚠️ *Atendimento encerrado por inatividade.* \nEnvie 'Oi' para começar de novo."
        );
        console.log(`Atendimento do cliente ${idUsuario} encerrado por inatividade.`);
        
        // Limpa a memória para não vazar RAM
        delete this.userStages[idUsuario];
        delete this.userTimers[idUsuario];
      }
    }, TEMPO_EXPIRACAO);

    // 2. Controle de Spam (Debounce)
    // Se o cliente mandar várias mensagens rápido (ex: manda "oi", depois manda a foto), 
    // cancelamos a resposta do "oi" para responder só quando ele parar de digitar.
    if (this.debounceTimers[idUsuario]) {
      clearTimeout(this.debounceTimers[idUsuario]);
    }

    const chat = await message.getChat();
    await chat.sendStateTyping();

    // Aguarda o tempo de debounce antes de efetivamente processar a resposta
    this.debounceTimers[idUsuario] = setTimeout(async () => {
      await chat.clearState();

      // Repassa a responsabilidade de responder para o MainMenu
      await this.mainMenu.mainMenu(
        client, 
        message, 
        config, 
        this.userStages, 
        this.userTimers, 
        idUsuario
      );

      delete this.debounceTimers[idUsuario];
    }, DEBOUNCE_TIME);
  }
}

module.exports = MessageHandler;