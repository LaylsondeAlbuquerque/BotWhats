const Quote = require("./quote.service");

class MainMenu {
  constructor() {
    this.quote = new Quote();
  }

  // -=-=-=-=-=-=-=-= Mensagem de Finalização =-=-=-=-=-=-=-=-
  async finalizarChat(client, idUsuario, userStages, userTimers) {
    await client.sendMessage(
      idUsuario,
      "Muito obrigado pela preferência! Até a próxima.",
    );
    delete userStages[idUsuario];
    clearTimeout(userTimers[idUsuario]);
    delete userTimers[idUsuario];
  }

  // -=-=-=-=-=-=-=-= Menu Reutilizável =-=-=-=-=-=-=-=-
  async menu(config, client, idUsuario, userStages) {
    let textoOpcoes = "";
    config.opcoes.forEach((opcao) => {
      const id = opcao.id;
      const descricao = opcao.descricao;
      let textoOpcao = `*${id}* - ${descricao}`;
      textoOpcoes += textoOpcao + "\n";
    });

    await client.sendMessage(idUsuario, textoOpcoes);
    await client.sendMessage(
      idUsuario,
      "Por favor, escolha uma opção digitando o número correspondente.",
    );

    userStages[idUsuario] = "aguardando-opcao";
  }

  // -=-=-=-=-=-=-=-= Processamento de Escolhas =-=-=-=-=-=-=-=-
  async mainMenu(client, message, config, userStages, userTimers, idUsuario) {
    const userStage = userStages[idUsuario] || "inicial-menu";
    const msg = message.body;
    const chat = await message.getChat();

    const sendMessage = async (resposta) => {
      await client.sendMessage(idUsuario, resposta);
    };

    switch (userStage) {
      case "inicial-menu":
        console.log("Começando o atendimento.");

        await sendMessage(config.saudacao);

        if (config.opcoes.length > 0) {
          await this.menu(config, client, idUsuario, userStages);
        } else {
          console.log("Por favor, configure opções para o cliente.");
          await sendMessage(
            "Um atendente irá te ajudar em breve. Por favor, aguarde.",
          );

          await chat.markUnread();

          userStages[idUsuario] = "finalizado";
        }

        break;

      case "aguardando-opcao":
        const opcaoEscolhida = config.opcoes.find((opcao) => opcao.id == msg);

        if (opcaoEscolhida) {
          console.log(`Opçao selecionada: ${opcaoEscolhida.descricao}`);
          userStages[idUsuario] = opcaoEscolhida.categoria;
          return this.mainMenu(
            client,
            message,
            config,
            userStages,
            userTimers,
            idUsuario,
          );
        } else {
          await sendMessage(
            `Desculpe, essa não é uma das opções. Por favor, tente digitar um dos números do menu que corresponda com a opção desejada.`,
          );
        }

        break;

      case "orcamento":
        await this.quote.quote(client, msg, config, userStages, idUsuario);

        await sendMessage("Deseja algo mais?\n\n1 - sim\n2 - não");
        userStages[idUsuario] = "algoMais";

        break;

      case "presencial":
        await sendMessage(
          "Que bom ter você aqui! Nosso atendente irá imprimir seu material.",
        );

        userStages[idUsuario] = "finalizado";

        break;

      case "redirecionamento":
        const opcaoRedirecionamento = config.opcoes.find(
          (opcao) => opcao.id == msg,
        );

        if (opcaoRedirecionamento && opcaoRedirecionamento.telefone) {
          const numeroParaEnvio = opcaoRedirecionamento.telefone + "@c.us";
          const contato = await client.getContactById(numeroParaEnvio);

          await sendMessage('Por favor, entre em contato com esse número:')
          await sendMessage(contato);

          await sendMessage("Deseja algo mais?\n\n1 - sim\n2 - não");
          userStages[idUsuario] = "algoMais";
        } else {
          console.log(
            `Telefone não configurado para a opção ${msg}. Encaminhando para humano.`,
          );

          await sendMessage(
            "Um atendente irá entrar em contato com você logo mais. Por favor, aguarde.",
          );

          await chat.markUnread();

          userStages[idUsuario] = "finalizado";
        }

        break;

      case "horario":
        let mensagemParaEnviar = "Nosso horário de funcionamento: \n";
        const diasDaSemana = [
          "domingo",
          "segunda",
          "terça",
          "quarta",
          "quinta",
          "sexta",
          "sábado",
        ];
        const horario = `${config.horarioInicio} às ${config.almocoInicio} e ${config.almocoFim} às ${config.horarioFim}`;

        config.diasFuncionamento.forEach((dia) => {
          mensagemParaEnviar += `${diasDaSemana[dia]} - ${horario}\n`;
        });

        await sendMessage(mensagemParaEnviar);

        await sendMessage("Deseja algo mais?\n\n1 - sim\n2 - não");
        userStages[idUsuario] = "algoMais";

        break;

      case "ajuda":
        await sendMessage(
          "Por favor, descreva sua dúvida e logo mais nosso atendente estará o respondendo.",
        );

        userStages[idUsuario] = "finalizado";

        break;

      case "algoMais":
        if (msg === "1") {
          await this.menu(config, client, idUsuario, userStages);
        } else if (msg === "2") {
          await this.finalizarChat(client, idUsuario, userStages, userTimers);
        } else {
          await sendMessage(
            `Desculpe, essa não é uma das opções. Por favor, tente digitar um dos números do menu que corresponda com a opção desejada.`,
          );
        }

        break;

      case "finalizado":
        console.log(
          `O cliente ${idUsuario} mandou mensagem após o atendimento automático ter sido finalizado.`,
        );

        break;
    }
  }
}

module.exports = MainMenu;
