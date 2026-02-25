const MainMenu = require("./mainMenu.service");

const TEMPO_EXPIRACAO = 600000; // 10 minutos
const DEBOUNCE_TIME = 5000; // 5 segundos

class MessageHadler {

  constructor() {
    // ---- Stages ----
    this.userStages = {};

    // ---- Timers ----
    this.userTimers = {};
    this.debounceTimers = {};

    // ---- Classe ----
    this.mainMenu = new MainMenu();

  }

  async handler(client, message, config) {

    const idUsuario = message.from; //Número do usuário

    // ---- Timer para finalizar a conversa ----

    // Limpa o timer toda vez que o usuário interage, para que a contagem de finalização de conversa não seja enviada enquanto o cliente ainda está mandando mensagem recorrentemente.
    if (this.userStages[idUsuario]) {
      clearTimeout(this.userTimers[idUsuario]);
    }

    // Recomeça o timer para que se o cliente não enviar nenhuma mensagem em determinado tempo (definido no TEMPO_EXPIRACAO, é enviada uma mensagem de finalizaçao. - quando o cliente chegar no stage "finalizar" o timer tem que ser limpo.)
    this.userTimers[idUsuario] = setTimeout(async () => {
      if (this.userStages[idUsuario]) {
        await client.sendMessage(idUsuario,
          "⚠️ *Atendimento encerrado por inatividade.* \n Envie 'Oi' para começar de novo.",
        );
        console.log(`Atendimento do cliente ${idUsuario} encerrado.`);
        delete this.userStages[idUsuario];
      }
    }, TEMPO_EXPIRACAO);

    // ---- Timer para evitar que o chat fique respondendo mensagens repetidas ----

    // Exclui o timer de debounce anterior, para que se o cliente mandar várias mensagem consecutivas, o bot só responda uma vez.
    if (this.debounceTimers[idUsuario]) {
      clearTimeout(this.debounceTimers[idUsuario]);
    }

    const chat = await message.getChat();

    await chat.sendStateTyping(); // Mostra que o bot está digitando...
    console.log("Bot digitando...");

    // Cria um novo timer de debounce, para esperar se o cliente vai mandar mais mensagens em sequência
    this.debounceTimers[idUsuario] = setTimeout(async () => {
      console.log("Começando a responder.");

      await chat.clearState(); // Limpa o estado de digitação.

      this.mainMenu.mainMenu(client, message.body, config, this.userStages, idUsuario);

    }, DEBOUNCE_TIME);

  }

}

module.exports = MessageHadler;
