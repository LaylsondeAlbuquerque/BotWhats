/**
 * @file otherOptions.js
 * @description Gerencia as ações do carrinho de compras (alterar quantidade, remover item e finalizar pedido).
 * Funciona como uma extensão da classe Quote, manipulando o estado em memória.
 */

class OtherOptions {
  /**
   * Processa as opções de gerenciamento do carrinho e finalização do pedido.
   * @param {object} client - Instância do cliente do WhatsApp.
   * @param {string} msg - Mensagem recebida do usuário.
   * @param {object} config - Configurações e cardápio do bot.
   * @param {object} userStages - Objeto global de controle de fluxo de todos os usuários.
   * @param {string} idUsuario - Número/ID do WhatsApp do usuário.
   * @param {object} quoteInstance - Instância da classe Quote (para acessar o carrinho em memória).
   */
  async processar(client, msg, config, userStages, idUsuario, quoteInstance) {
    const sendMessage = async (resposta) => {
      await client.sendMessage(idUsuario, resposta);
    };

    const textoLimpo = msg.trim().toLowerCase();
    const stage = quoteInstance.orcamentoStages[idUsuario];

    // Helper para exibir o resumo do carrinho de forma limpa
    const mostrarCarrinho = () => {
      let texto = "🛒 *Seu carrinho atual:*\n\n";
      quoteInstance.carrinhoOrcamento[idUsuario].forEach((item) => {
        texto += `*ID [${item.idCarrinho}]* - ${item.quant}x ${item.categoria} ${item.nome}\n`;
      });
      return texto;
    };

    switch (stage) {
      
      // --------------------------------------------------
      // 1. MENU DO CARRINHO (Adicionar, Alterar, Retirar, Finalizar)
      // --------------------------------------------------
      case "outras-opcoes":
        if (msg === "1") {
          // Adicionar outro produto
          await quoteInstance.menuProdutos(config, client, idUsuario);
        } else if (msg === "2") {
          // Alterar quantidade
          if (!quoteInstance.carrinhoOrcamento[idUsuario] || quoteInstance.carrinhoOrcamento[idUsuario].length === 0) {
            await sendMessage("Seu carrinho está vazio! Vamos adicionar algo primeiro.");
            await quoteInstance.menuProdutos(config, client, idUsuario);
            return;
          }
          await sendMessage(mostrarCarrinho() + "\nDigite o *ID* do produto que você deseja alterar a quantidade:");
          quoteInstance.orcamentoStages[idUsuario] = "alterar-escolher-id";
        } else if (msg === "3") {
          // Retirar produto
          if (!quoteInstance.carrinhoOrcamento[idUsuario] || quoteInstance.carrinhoOrcamento[idUsuario].length === 0) {
            await sendMessage("Seu carrinho já está vazio!");
            await quoteInstance.menuProdutos(config, client, idUsuario);
            return;
          }
          await sendMessage(mostrarCarrinho() + "\nDigite o *ID* do produto que você deseja retirar do carrinho:");
          quoteInstance.orcamentoStages[idUsuario] = "retirar-escolher-id";
        } else if (msg === "4") {
          // Finalizar orçamento
          if (!quoteInstance.carrinhoOrcamento[idUsuario] || quoteInstance.carrinhoOrcamento[idUsuario].length === 0) {
            await sendMessage("Você não tem itens no carrinho para finalizar.");
            return;
          }

          let total = 0;
          let resumo = "📋 *RESUMO DO SEU ORÇAMENTO*\n\n";

          // Cálculo do total e montagem do recibo
          quoteInstance.carrinhoOrcamento[idUsuario].forEach((item) => {
            const subtotal = item.quant * item.preco;
            total += subtotal;
            const precoVisto = subtotal.toFixed(2).replace(".", ",");
            resumo += `${item.quant}x ${item.categoria} ${item.nome} - R$ ${precoVisto}\n`;
          });

          resumo += `\n*TOTAL FINAL: R$ ${total.toFixed(2).replace(".", ",")}*`;

          await sendMessage(resumo);
          await sendMessage("Pix para pagamento:\n*Chave:* 123.456.789-00\n*Nome:* Gráfica Exemplo");
          await sendMessage("Estou aguardando o comprovante de pagamento para iniciar a produção. Muito obrigado!");

          // Marca a conversa como não lida para chamar a atenção do atendente humano
          try {
            const chat = await client.getChatById(idUsuario);
            await chat.markUnread();
          } catch (error) {
            console.log(`[${idUsuario}] Aviso: Não foi possível marcar a conversa como não lida.`, error.message);
          }

          // Limpa a memória do carrinho para esse usuário
          delete quoteInstance.carrinhoOrcamento[idUsuario];
          delete quoteInstance.orcamentoStages[idUsuario];
          delete quoteInstance.itemAtual[idUsuario];
          
          // Envia o usuário para o estágio finalizado, aguardando humano
          userStages[idUsuario] = "finalizado";

        } else {
          await sendMessage("Opção inválida. Digite *1*, *2*, *3* ou *4*.");
        }
        break;

      // --------------------------------------------------
      // 2. FLUXO DE ALTERAR QUANTIDADE
      // --------------------------------------------------
      case "alterar-escolher-id":
        const idParaAlterar = parseInt(textoLimpo, 10);
        const produtoParaAlterar = quoteInstance.carrinhoOrcamento[idUsuario].find(i => i.idCarrinho === idParaAlterar);

        if (produtoParaAlterar) {
          quoteInstance.itemAtual[idUsuario] = idParaAlterar;
          await sendMessage(`Você selecionou: *${produtoParaAlterar.categoria} ${produtoParaAlterar.nome}*.\n\nQual a *nova quantidade* que você deseja?`);
          quoteInstance.orcamentoStages[idUsuario] = "alterar-nova-quant";
        } else {
          await sendMessage("ID não encontrado no carrinho. Digite um ID válido da lista acima.");
        }
        break;

      case "alterar-nova-quant":
        if (/^\d+$/.test(textoLimpo)) {
          const novaQuantidade = parseInt(textoLimpo, 10);
          const produtoSendoAlterado = quoteInstance.carrinhoOrcamento[idUsuario].find(
            (item) => item.idCarrinho === quoteInstance.itemAtual[idUsuario]
          );

          if (produtoSendoAlterado) {
            produtoSendoAlterado.quant = novaQuantidade;
          }

          await sendMessage("✅ Quantidade alterada com sucesso!\n\nDeseja:\n*1* - Adicionar outro produto\n*2* - Alterar a quantidade de algum produto\n*3* - Retirar algum produto do carrinho\n*4* - Finalizar orçamento");
          quoteInstance.orcamentoStages[idUsuario] = "outras-opcoes";
        } else {
          await sendMessage("Valor inválido. Digite apenas um número inteiro (Ex: 2).");
        }
        break;

      // --------------------------------------------------
      // 3. FLUXO DE RETIRAR PRODUTO DO CARRINHO
      // --------------------------------------------------
      case "retirar-escolher-id":
        const idParaRetirar = parseInt(textoLimpo, 10);
        const produtoParaRetirar = quoteInstance.carrinhoOrcamento[idUsuario].find(i => i.idCarrinho === idParaRetirar);

        if (produtoParaRetirar) {
          quoteInstance.itemAtual[idUsuario] = idParaRetirar;
          await sendMessage(`Tem certeza que deseja excluir *${produtoParaRetirar.categoria} ${produtoParaRetirar.nome}* do carrinho?\n\n*1* - SIM\n*2* - NÃO`);
          quoteInstance.orcamentoStages[idUsuario] = "retirar-confirmacao";
        } else {
          await sendMessage("ID não encontrado no carrinho. Digite um ID válido da lista acima.");
        }
        break;

      case "retirar-confirmacao":
        if (textoLimpo === "1" || textoLimpo === "sim") {
          quoteInstance.carrinhoOrcamento[idUsuario] = quoteInstance.carrinhoOrcamento[idUsuario].filter(
            (item) => item.idCarrinho !== quoteInstance.itemAtual[idUsuario]
          );
          await sendMessage("🗑️ Produto excluído com sucesso!\n\nDeseja:\n*1* - Adicionar outro produto\n*2* - Alterar a quantidade de algum produto\n*3* - Retirar algum produto do carrinho\n*4* - Finalizar orçamento");
          quoteInstance.orcamentoStages[idUsuario] = "outras-opcoes";
        } else if (textoLimpo === "2" || textoLimpo === "não" || textoLimpo === "nao") {
          await sendMessage("Ação cancelada.\n\nDeseja:\n*1* - Adicionar outro produto\n*2* - Alterar a quantidade de algum produto\n*3* - Retirar algum produto do carrinho\n*4* - Finalizar orçamento");
          quoteInstance.orcamentoStages[idUsuario] = "outras-opcoes";
        } else {
          await sendMessage("Por favor, responda com *1* para SIM ou *2* para NÃO.");
        }
        break;
    }
  }
}

module.exports = OtherOptions;