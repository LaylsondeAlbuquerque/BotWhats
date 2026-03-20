/**
 * @file mainMenu.service.js
 * @description Roteador central do bot. Controla os estágios de conversa do usuário
 * e direciona a mensagem para o serviço correto (Orçamento, Horários, Ajuda, etc).
 */

const Quote = require("./quote.service"); // Corrigido o typo 'requite'

class MainMenu {
  constructor() {
    this.quote = new Quote(this);
  }

  /**
   * Encerra o atendimento, enviando mensagem de despedida e limpando a memória.
   * @param {object} client - Instância do cliente do WhatsApp.
   * @param {string} idUsuario - Número/ID do usuário no WhatsApp.
   * @param {object} userStages - Objeto global de estágios.
   * @param {object} userTimers - Objeto global de timers de inatividade.
   */
  async finalizarChat(client, idUsuario, userStages, userTimers) {
    await client.sendMessage(
      idUsuario,
      "Muito obrigado pela preferência! Até a próxima."
    );
    
    // Limpeza de memória
    delete userStages[idUsuario];
    clearTimeout(userTimers[idUsuario]);
    delete userTimers[idUsuario];
  }

  /**
   * Monta e envia o menu de opções baseado no arquivo de configuração.
   */
  async menu(config, client, idUsuario, userStages) {
    let textoOpcoes = "";
    
    config.opcoes.forEach((opcao) => {
      textoOpcoes += `*${opcao.id}* - ${opcao.descricao}\n`;
    });

    await client.sendMessage(idUsuario, textoOpcoes);
    await client.sendMessage(
      idUsuario,
      "Por favor, escolha uma opção digitando o número correspondente."
    );

    userStages[idUsuario] = "aguardando-opcao";
  }

  /**
   * Processador principal. Avalia em qual estágio o usuário está e age de acordo.
   */
  async mainMenu(client, message, config, userStages, userTimers, idUsuario) {
    const userStage = userStages[idUsuario] || "inicial-menu";
    const msg = message.body.trim().toLowerCase();
    const chat = await message.getChat();

    // Função auxiliar para enviar mensagens rapidamente
    const sendMessage = async (resposta) => {
      await client.sendMessage(idUsuario, resposta);
    };

    switch (userStage) {
      
      // --------------------------------------------------
      // 1. INÍCIO DO ATENDIMENTO
      // --------------------------------------------------
      case "inicial-menu":
        console.log(`[${idUsuario}] Começando o atendimento.`);
        await sendMessage(config.saudacao);

        if (config.opcoes.length > 0) {
          await this.menu(config, client, idUsuario, userStages);
        } else {
          console.log("Aviso: Por favor, configure opções para o cliente no painel.");
          await sendMessage("Um atendente irá te ajudar em breve. Por favor, aguarde.");
          await chat.markUnread();
          userStages[idUsuario] = "finalizado";
        }
        break;

      // --------------------------------------------------
      // 2. CAPTURA DA OPÇÃO ESCOLHIDA
      // --------------------------------------------------
      case "aguardando-opcao":
        const opcaoEscolhida = config.opcoes.find((opcao) => opcao.id == msg);

        if (opcaoEscolhida) {
          console.log(`[${idUsuario}] Opção selecionada: ${opcaoEscolhida.descricao}`);
          userStages[idUsuario] = opcaoEscolhida.categoria;
          
          // Re-chama a função para processar a categoria escolhida imediatamente
          return this.mainMenu(
            client,
            message,
            config,
            userStages,
            userTimers,
            idUsuario
          );
        } else {
          await sendMessage(
            `Desculpe, essa não é uma das opções. Por favor, tente digitar um dos números do menu que corresponda com a opção desejada.`
          );
        }
        break;

      // --------------------------------------------------
      // 3. FLUXOS ESPECÍFICOS POR CATEGORIA
      // --------------------------------------------------
      case "orcamento":
        // Delega para a classe Quote (Orçamento)
        await this.quote.quote(client, msg, config, userStages, idUsuario);
        break;

      case "presencial":
        await sendMessage("Que bom ter você aqui! Nosso atendente irá imprimir seu material.");
        userStages[idUsuario] = "finalizado";
        break;

      case "redirecionamento":
        const opcaoRedirecionamento = config.opcoes.find((opcao) => opcao.id == msg);

        if (opcaoRedirecionamento && opcaoRedirecionamento.telefone) {
          const numeroParaEnvio = opcaoRedirecionamento.telefone + "@c.us";
          const contato = await client.getContactById(numeroParaEnvio);

          await sendMessage('Por favor, entre em contato com esse número:');
          await sendMessage(contato);

          await sendMessage("Deseja algo mais?\n\n1 - Sim\n2 - Não");
          userStages[idUsuario] = "algoMais";
        } else {
          console.log(`[${idUsuario}] Telefone não configurado para redirecionamento. Passando para humano.`);
          await sendMessage("Um atendente irá entrar em contato com você logo mais. Por favor, aguarde.");
          await chat.markUnread();
          userStages[idUsuario] = "finalizado";
        }
        break;

      case "horario":
        let mensagemHorario = "Nosso horário de funcionamento:\n";
        const diasDaSemana = [
          "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
        ];
        const horario = `${config.horarioInicio} às ${config.almocoInicio} e ${config.almocoFim} às ${config.horarioFim}`;

        config.diasFuncionamento.forEach((dia) => {
          mensagemHorario += `*${diasDaSemana[dia]}* - ${horario}\n`;
        });

        await sendMessage(mensagemHorario);
        await sendMessage("Deseja algo mais?\n\n1 - Sim\n2 - Não");
        userStages[idUsuario] = "algoMais";
        break;

      case "ajuda":
        await sendMessage("Por favor, descreva sua dúvida e logo mais nosso atendente estará te respondendo.");
        await chat.markUnread(); // Adicionado para facilitar visualização pela gráfica
        userStages[idUsuario] = "finalizado";
        break;

      // --------------------------------------------------
      // 4. RETORNO OU FINALIZAÇÃO
      // --------------------------------------------------
      case "algoMais":
        if (msg === "1" || msg === "sim") {
          await this.menu(config, client, idUsuario, userStages);
        } else if (msg === "2" || msg === "não" || msg === "nao") {
          await this.finalizarChat(client, idUsuario, userStages, userTimers);
        } else {
          await sendMessage(
            `Desculpe, opção inválida. Responda com "1" para voltar ao menu ou "2" para encerrar.`
          );
        }
        break;

      case "finalizado":
        console.log(`[${idUsuario}] enviou mensagem após o atendimento automático ter sido finalizado.`);
        break;
    }
  }
}

module.exports = MainMenu;