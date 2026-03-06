const MainMenu = require("./mainMenu.service");
const estaPronto = false;

class Quote {
  constructor() {
    this.mainMenu = new MainMenu();
    this.orcamentoStages = {};
    this.carrinhoOrcamento = {};
    this.itemAtual = {};
    this.idCarrinho = {};
  }

  async menuProdutos(config) {
    let menuProdutos = "Escolha um produto:\n";

    config.categoriasProdutos.forEach((categoria) => {
      const produtosDaCategoria = config.produtos.filter(
        (produto) => produto.categoria == categoria,
      );

      if (produtosDaCategoria.length > 0) {
        menuProdutos += `\n*${categoria}*\n\n`;
        produtosDaCategoria.forEach((produto) => {
          const precoVisto = produto.preco.toString().replace(".", ",");
          menuProdutos += `*${produto.id}* - ${produto.categoria} - ${produto.nome} - R$ ${precoVisto}.\n`;
        });
      }
    });

    menuProdutos += `Digite "voltar" para retornar ao menu principal.`

    await sendMessage(menuProdutos);
    this.orcamentoStages[idUsuario] = "aguardando-escolha";
  }

  async quote(client, msg, config, userStages, idUsuario) {
    // função para enviar resposta
    const sendMessage = async (resposta) => {
      await client.sendMessage(idUsuario, resposta);
    };

    if (estaPronto) {
      // Definição do stage atual, casa não haja nenhum, manda o cliente para o menu de produtos
      const ocamentoStage = this.orcamentoStages[idUsuario] || "menu-produtos";

      switch (ocamentoStage) {
        // Menu de produtos
        case "menu-produtos":
          await this.menuProdutos(config);

          break;

        // Processamento da resposta e acrescento ao carrinho.
        case "aguardando-escolha":

          if (msg === "voltar") {
            userStages[idUsuario] = "inicial-menu";
            delete this.carrinhoOrcamento[idUsuario];
            this.mainMenu.menu(config, client, idUsuario, userStages);
            return;
          }

          const produtoSelecionado = config.produtos.find(
            (produto) => produto.id == msg,
          );

          let idDoCarrinho = this.idCarrinho[idUsuario] || 0;
          idDoCarrinho += 1;

          if (produtoSelecionado) {
            if (this.carrinhoOrcamento[idUsuario]) {
              const novoProduto = {
                ...produtoSelecionado,
                quant: 1,
                idCarrinho: idDoCarrinho,
              };
              this.carrinhoOrcamento[idUsuario].push(novoProduto);
            } else {
              this.carrinhoOrcamento[idUsuario] = [
                { ...produtoSelecionado, quant: 1 },
              ];
            }
            
            this.itemAtual[idUsuario] = idDoCarrinho
            this.orcamentoStages[idUsuario] = "quantos";
            this.idCarrinho[idUsuario] = idDoCarrinho;

            await sendMessage(
              `Produto salvo no seu carrinho!\n\nQuantos/as ${produtoSelecionado.categoria} ${produtoSelecionado.nome} você deseja?\n\nPor favor, digite um número inteiro (1, 2, 3...20) para a quantidade desejada, ou digite "voltar" para ser encamilhado ao menu de produtos, ou digite "cancelar" para excluir esse produto do carrinho.`,
            );
          } else {
            await sendMessage(
              "Opção inválida, por favor selecione uma válida.",
            );
          }

          break;

        case "quantos":

          if (msg = "voltar") {
            this.orcamentoStages[idUsuario] = "menu-produtos";
            await this.menuProdutos(config);
            return;
          }

          const textoLimpo = msg.trim();

          if (/^\d+$/.test(textoLimpo)) {
            const quantidade = parseInt(textoLimpo, 10);

            const produtoNoCarrinho = this.carrinhoOrcamento[idUsuario].find(
              (item) => item.idCarrinho === this.itemAtual[idUsuario],
            );

            if (produtoNoCarrinho) {
              produtoNoCarrinho.quant = quantidade;

              console.log(
                `Cliente ${idUsuario} escolheu ${quantidade} ${produtoNoCarrinho.categoria} ${produtoNoCarrinho.nome}`,
              );
            }

            sendMessage("Pronto, seu carrinho foi atualizado.")

            
          }

          break;

        case "selecionar-outro":
          if (msg === "1") {
            await menuProdutos();
          } else if (msg === "2") {
          }

          break;
      }
    } else {
      console.log("deu certo");
    }
  }
}

module.exports = Quote;
