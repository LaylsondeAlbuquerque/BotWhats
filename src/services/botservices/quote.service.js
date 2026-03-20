/**
 * @file quote.service.js
 * @description Gerencia a fase inicial de criação de orçamentos e do carrinho de compras.
 * Responsável por listar produtos, adicionar o primeiro item e perguntar a quantidade inicial.
 */

const OtherOptions = require('./otherOptions.service');

class Quote {
  constructor(mainMenu) {
    this.mainMenu = mainMenu;
    
    // Estados locais para controle do carrinho
    this.orcamentoStages = {};
    this.carrinhoOrcamento = {};
    this.itemAtual = {};
    this.idCarrinho = {};
    
    // Instancia a classe que vai cuidar dos submenus de alteração/exclusão/finalização
    this.otherOptions = new OtherOptions();
  }

  /**
   * Monta e envia o menu de categorias e produtos disponíveis.
   * @param {object} config - Objeto com as configurações e lista de produtos.
   * @param {object} client - Instância do cliente do WhatsApp.
   * @param {string} idUsuario - Número/ID do usuário.
   */
  async menuProdutos(config, client, idUsuario) {
    let textoMenu = "Escolha um produto:\n";

    config.categoriasProdutos.forEach((categoria) => {
      const produtosDaCategoria = config.produtos.filter(
        (produto) => produto.categoria == categoria
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
    
    // Atualiza o estágio do usuário para aguardar a escolha do produto
    this.orcamentoStages[idUsuario] = "aguardando-escolha";
  }

  /**
   * Processador principal do fluxo de orçamento.
   */
  async quote(client, msg, config, userStages, idUsuario) {
    const sendMessage = async (resposta) => {
      await client.sendMessage(idUsuario, resposta);
    };

    const textoLimpo = msg.trim().toLowerCase(); 
    const orcamentoStage = this.orcamentoStages[idUsuario] || "menu-produtos";

    switch (orcamentoStage) {
      
      // --------------------------------------------------
      // 1. MOSTRAR LISTA DE PRODUTOS
      // --------------------------------------------------
      case "menu-produtos":
        await this.menuProdutos(config, client, idUsuario);
        break;

      // --------------------------------------------------
      // 2. RECEBER O ID DO PRODUTO ESCOLHIDO
      // --------------------------------------------------
      case "aguardando-escolha":
        if (textoLimpo === "voltar") {
          userStages[idUsuario] = "inicial-menu";
          delete this.carrinhoOrcamento[idUsuario];
          this.mainMenu.menu(config, client, idUsuario, userStages);
          return;
        }

        const produtoSelecionado = config.produtos.find(
          (produto) => produto.id == textoLimpo // Usando o texto limpo para garantir a comparação
        );

        if (produtoSelecionado) {
          let idDoCarrinho = this.idCarrinho[idUsuario] || 0;
          idDoCarrinho += 1;

          const novoProduto = {
            ...produtoSelecionado,
            quant: 1,
            idCarrinho: idDoCarrinho,
          };

          // Cria o carrinho se não existir, ou adiciona ao existente
          if (this.carrinhoOrcamento[idUsuario]) {
            this.carrinhoOrcamento[idUsuario].push(novoProduto);
          } else {
            this.carrinhoOrcamento[idUsuario] = [novoProduto];
          }

          // Salva referências para a próxima etapa
          this.itemAtual[idUsuario] = idDoCarrinho;
          this.idCarrinho[idUsuario] = idDoCarrinho;
          this.orcamentoStages[idUsuario] = "quantos";

          await sendMessage(
            `Produto salvo no seu carrinho!\n\nQuantos(as) *${produtoSelecionado.categoria} ${produtoSelecionado.nome}* você deseja?\n\nPor favor, digite um número inteiro (Ex: 1, 2, 5) para a quantidade desejada, ou digite "voltar" para retornar ao menu de produtos.`
          );
        } else {
          await sendMessage("Opção inválida, por favor selecione um ID válido da lista.");
        }
        break;

      // --------------------------------------------------
      // 3. DEFINIR A QUANTIDADE DO PRODUTO
      // --------------------------------------------------
      case "quantos":
        if (textoLimpo === "voltar") {
          // Remove o item que acabou de ser adicionado, pois o usuário desistiu da quantidade
          this.carrinhoOrcamento[idUsuario] = this.carrinhoOrcamento[idUsuario].filter(
            (item) => item.idCarrinho !== this.itemAtual[idUsuario]
          );
          this.orcamentoStages[idUsuario] = "menu-produtos";
          await this.menuProdutos(config, client, idUsuario);
          return;
        }

        if (/^\d+$/.test(textoLimpo)) {
          const quantidade = parseInt(textoLimpo, 10);

          const produtoNoCarrinho = this.carrinhoOrcamento[idUsuario].find(
            (item) => item.idCarrinho === this.itemAtual[idUsuario]
          );

          if (produtoNoCarrinho) {
            produtoNoCarrinho.quant = quantidade;
            console.log(
              `[${idUsuario}] Adicionou ${quantidade}x ${produtoNoCarrinho.categoria} ${produtoNoCarrinho.nome} ao carrinho.`
            );
          }

          await sendMessage("Pronto, seu carrinho foi atualizado!\n\nDeseja:\n*1* - Adicionar outro produto\n*2* - Alterar a quantidade de algum produto\n*3* - Retirar algum produto do carrinho\n*4* - Finalizar orçamento");
          
          this.orcamentoStages[idUsuario] = "outras-opcoes";

        } else {
           await sendMessage("Valor inválido. Digite apenas um número inteiro (Ex: 2).");
        }
        break;

      // --------------------------------------------------
      // 4. DELEGAÇÃO PARA OUTRAS OPÇÕES (Carrinho/Finalizar)
      // --------------------------------------------------
      case "outras-opcoes":
      case "alterar-escolher-id":
      case "alterar-nova-quant":
      case "retirar-escolher-id":
      case "retirar-confirmacao":
        await this.otherOptions.processar(client, msg, config, userStages, idUsuario, this);
        break;
    }
  }
}

module.exports = Quote;