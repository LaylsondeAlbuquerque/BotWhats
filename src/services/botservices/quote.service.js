const MainMenu = require("./mainMenu.service");

class Quote {
    constructor(mainMenu) {
    this.mainMenu = mainMenu;
    this.orcamentoStages = {};
    this.carrinhoOrcamento = {};
    this.itemAtual = {};
    this.idCarrinho = {};
  }

  async menuProdutos(config, client, idUsuario) {
    let textoMenu = "Escolha um produto:\n";

    config.categoriasProdutos.forEach((categoria) => {
      const produtosDaCategoria = config.produtos.filter(
        (produto) => produto.categoria == categoria,
      );

      if (produtosDaCategoria.length > 0) {
        textoMenu += `\n*${categoria}*\n\n`;
        produtosDaCategoria.forEach((produto) => {
          const precoVisto = produto.preco.toString().replace(".", ",");
          textoMenu += `*${produto.id}* - ${produto.categoria} - ${produto.nome} - R$ ${precoVisto}.\n`;
        });
      }
    });

    textoMenu += `\nDigite "voltar" para retornar ao menu principal.`;

    await client.sendMessage(idUsuario, textoMenu);
    this.orcamentoStages[idUsuario] = "aguardando-escolha";
  }

  async quote(client, msg, config, userStages, idUsuario) {
    const sendMessage = async (resposta) => {
      await client.sendMessage(idUsuario, resposta);
    };

    const textoLimpo = msg.trim().toLowerCase(); 
    const ocamentoStage = this.orcamentoStages[idUsuario] || "menu-produtos";

    switch (ocamentoStage) {
      
      case "menu-produtos":
        await this.menuProdutos(config, client, idUsuario);
        break;

      case "aguardando-escolha":
        if (textoLimpo === "voltar") {
          userStages[idUsuario] = "inicial-menu";
          delete this.carrinhoOrcamento[idUsuario];
          this.mainMenu.menu(config, client, idUsuario, userStages);
          return;
        }

        const produtoSelecionado = config.produtos.find(
          (produto) => produto.id == msg,
        );

        if (produtoSelecionado) {
          let idDoCarrinho = this.idCarrinho[idUsuario] || 0;
          idDoCarrinho += 1;

          const novoProduto = {
            ...produtoSelecionado,
            quant: 1,
            idCarrinho: idDoCarrinho,
          };

          if (this.carrinhoOrcamento[idUsuario]) {
            this.carrinhoOrcamento[idUsuario].push(novoProduto);
          } else {
            this.carrinhoOrcamento[idUsuario] = [novoProduto];
          }

          this.itemAtual[idUsuario] = idDoCarrinho;
          this.orcamentoStages[idUsuario] = "quantos";
          this.idCarrinho[idUsuario] = idDoCarrinho;

          await sendMessage(
            `Produto salvo no seu carrinho!\n\nQuantos/as ${produtoSelecionado.categoria} ${produtoSelecionado.nome} você deseja?\n\nPor favor, digite um número inteiro (1, 2, 3...20) para a quantidade desejada, ou digite "voltar" para ser encaminhado ao menu de produtos, ou digite "cancelar" para excluir esse produto do carrinho.`,
          );
        } else {
          await sendMessage("Opção inválida, por favor selecione uma válida.");
        }
        break;

      case "quantos":
        if (textoLimpo === "voltar") {
          this.orcamentoStages[idUsuario] = "menu-produtos";
          await this.menuProdutos(config, client, idUsuario);
          return;
        }

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

          await sendMessage("Pronto, seu carrinho foi atualizado.\n\nDeseja:\n1 - Adicionar outro produto\n2 - Alterar a quantidade de algum produto\n3 - Retirar algum produto do carrinho\n4 - Finalizar orçamento");
          
          this.orcamentoStages[idUsuario] = "outras-opcoes";

        } else {
           await sendMessage("Valor inválido. Digite um número inteiro (Ex: 2).");
        }
        break;

      case "outras-opcoes":
        if (msg === "1") {
          await this.menuProdutos(config, client, idUsuario);
        } else {

        }
        break;
    }
  }
}

module.exports = Quote;
