<div align="center">

![Header Waving](https://capsule-render.vercel.app/api?type=waving&color=075e54&height=220&section=header&text=BotWhats&fontSize=70&fontColor=ffffff&fontAlignY=35&animation=fadeIn)

[![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=25&pause=1000&color=25D366&center=true&vCenter=true&width=435&lines=Node.js+Automation;WhatsApp+Chatbot;Web+Dashboard+Config;State+Management)](https://git.io/typing-svg)

</div>

<div align="center">
  
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />

</div>

<br>

<div align="center">
  <h3>Automação de Atendimento via WhatsApp com Interface de Configuração</h3>
  <p>Um projeto focado em lógica de estados, manipulação de arquivos, Clean Code e criação de interfaces amigáveis para usuários finais.</p>
</div>

---

## 💡 Sobre o Projeto

Este projeto nasceu da necessidade de automatizar o atendimento inicial de uma **Gráfica**, permitindo que o cliente consulte preços, horários, tire dúvidas e faça orçamentos de forma autônoma. 

O diferencial técnico deste bot é a sua **independência de código para configuração**: foi desenvolvida uma interface Web local (Dashboard) onde o dono da gráfica pode alterar as mensagens de saudação, cardápio, produtos e horários de funcionamento sem precisar tocar em uma única linha de JavaScript.

> **📌 Nota de Evolução Comercial:** Este repositório público documenta o protótipo funcional, a arquitetura base e as soluções algorítmicas do sistema. Devido ao potencial de mercado validado, a evolução contínua deste projeto para um produto comercial (SaaS) seguirá o seu desenvolvimento em um repositório privado.

<details open>
<summary><strong>✨ Funcionalidades</strong></summary>
<br>

- [x] **Painel de Configuração Web:** Interface local (Express) para editar textos do bot dinamicamente.
- [x] **Gestão de Estados (State Machine):** Controle inteligente e modular da etapa da conversa (Menu principal, Orçamento, Carrinho).
- [x] **Carrinho de Compras:** Sistema de adição, remoção, alteração de quantidade e cálculo automático de orçamento.
- [x] **Timeout de Inatividade:** Encerramento e limpeza de memória automática após tempo sem resposta.
- [x] **Filtro Anti-Spam (Debounce):** Evita que o bot responda múltiplas vezes se o cliente mandar várias mensagens seguidas.
- [x] **Redirecionamento Humano:** Marca as conversas como "Não Lidas" automaticamente quando o cliente precisa falar com um atendente real.
- [x] **Filtro de Mensagens Antigas:** Ignora mensagens recebidas enquanto o bot estava offline para não gerar respostas em massa.

> *Legenda: [x] Concluído | [ ] Em desenvolvimento*

</details>

<details open>
<summary><strong>🛠️ Tecnologias Utilizadas</strong></summary>
<br>

* **Node.js:** Ambiente de execução principal.
* **whatsapp-web.js:** Biblioteca baseada em Puppeteer para integração e automação do WhatsApp.
* **Express:** Servidor para a API local e entrega do painel de configuração (Frontend).
* **HTML5/CSS3:** Front-end do painel de controle.
* **FS (File System):** Persistência de dados das configurações em JSON local.
* **JSDoc:** Padronização de documentação para IntelliSense e tipagem no VS Code.

</details>

---

## 🚀 Como Rodar o Projeto

Este projeto foi desenhado para ser seguro. Dados sensíveis (como a sessão do WhatsApp) não são versionados.

<details open>
<summary><strong>Passo a Passo de Instalação</strong></summary>
<br>

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/LaylsondeAlbuquerque/BotWhats.git](https://github.com/LaylsondeAlbuquerque/BotWhats.git)
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o ambiente:**
    * Localize o arquivo `config.example.json` na raiz.
    * Renomeie-o para `config.json` (ou crie uma cópia com este nome).
    * Este arquivo guardará as mensagens personalizadas da gráfica.

4.  **Inicie o Bot:**
    ```bash
    node index.js
    ```
    * O navegador abrirá automaticamente com o Painel de Configuração.
    * No terminal, aparecerá um QR Code. Escaneie-o usando o seu WhatsApp (Dispositivos Conectados).
    * **Atenção:** Aguarde a mensagem `🚀 TUDO PRONTO! O Bot está conectado e aguardando mensagens` aparecer no terminal antes de enviar mensagens de teste.

</details>

---

## 🧠 Aprendizados e Desafios

O desenvolvimento escalou de um arquivo simples para uma arquitetura robusta:

1.  **Arquitetura Limpa e Modularização:** O código foi refatorado em serviços (`messageHandler`, `mainMenu`, `quote`, `otherOptions`) separando as responsabilidades (Single Responsibility Principle) para evitar arquivos gigantes e difíceis de dar manutenção.
2.  **JSDoc e IntelliSense:** Uso de comentários JSDoc orientados a contrato para melhorar o autocompletar do VS Code sem poluir a lógica visual do código.
3.  **Lógica Avançada de Switch/Case:** Utilização do agrupamento de casos (*Fall-through*) para delegar estágios complexos do carrinho de compras para classes especializadas de forma elegante.
4.  **Lógica Analógica:** Todo o fluxo de conversação e estados foi desenhado à mão (fluxogramas) antes da codificação, garantindo clareza nas regras de negócio.
5.  **Gerenciamento de Memória:** Implementação de limpeza de estados (`delete`) e finalização de Timers (`clearTimeout`) para evitar vazamento de memória e garantir que o bot rode liso em produção.

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Sinta-se livre para usar, estudar e modificar o código base.

<div align="center">
  <sub>Desenvolvido com ☕ e código por <a href="https://www.linkedin.com/in/laylson-albuquerque/">Laylson Albuquerque</a></sub>
</div>