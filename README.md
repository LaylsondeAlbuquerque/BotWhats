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
  <p>Um projeto de estudo focado em lógica de estados, manipulação de arquivos e criação de interfaces amigáveis para usuários finais.</p>
</div>

---

## Sobre o Projeto

Este projeto nasceu da necessidade de automatizar o atendimento inicial de uma **Gráfica**, permitindo que o cliente consulte preços e faça pedidos básicos de forma autônoma. 

O diferencial técnico deste bot é a sua **independência de código para configuração**: foi desenvolvida uma interface Web local onde o dono da gráfica pode alterar as mensagens de saudação, cardápio e horários sem precisar tocar em uma linha de JavaScript.

<details>
<summary><strong> Funcionalidades (Roadmap)</strong></summary>
<br>

- [ ] **Gestão de Estados (State Machine):** Controle da etapa da conversa (Início, Menu, Pedido).
- [x] **Painel de Configuração Web:** Interface local para editar textos do bot.
- [x] **Timeout de Inatividade:** Encerramento automático após tempo sem resposta.
- [ ] **Controle de Horário:** Verificação de dia/hora antes de responder.
- [ ] **Filtro de Mídia:** Ignorar áudios e imagens soltas para evitar erros.
- [x] **Versão Portátil:** Empacotamento para rodar sem instalação complexa.

> *Legenda: [ ] Pronto | [x] Em desenvolvimento*

</details>
<summary><strong>🛠️ Tecnologias Utilizadas</strong></summary>
<br>

* **Node.js:** Ambiente de execução.
* **whatsapp-web.js:** Biblioteca para integração via Puppeteer (simula um navegador).
* **Express:** Servidor para a API local e servir o painel de configuração HTML.
* **HTML5/CSS3:** Front-end do painel de controle.
* **FS (File System):** Persistência de dados das configurações em JSON local.

</details>

---

## Como Rodar o Projeto

Este projeto foi desenhado para ser seguro. Dados sensíveis (como a sessão do WhatsApp) não são versionados.

<details>
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
    * Este arquivo guardará as mensagens personalizadas da sua gráfica.

4.  **Inicie o Bot:**
    ```bash
    node index.js
    ```
    * O navegador abrirá automaticamente com o Painel de Configuração.
    * No terminal, aparecerá um QR Code. Escaneie com o WhatsApp (Dispositivos Conectados).

</details>

---

## Aprendizados e Desafios

O desenvolvimento seguiu um fluxo de estudo prático:

1.  **Lógica Analógica:** Todo o fluxo de conversação e estados foi desenhado à mão antes da codificação, garantindo clareza na lógica de `switch/case` e `if/else`.
2.  **Assincronicidade:** Uso intensivo de `async/await` para garantir que as mensagens cheguem na ordem correta, simulando uma digitação humana.
3.  **Persistência JSON:** Manipulação de leitura e escrita de arquivos (`fs`) para criar um "banco de dados" leve e portátil para as configurações.

---

## Licença

Este projeto está sob a licença **MIT**. Sinta-se livre para usar, estudar e modificar.

<div align="center">
  <sub>Desenvolvido com ☕ e código por <a href="https://www.linkedin.com/in/laylson-albuquerque/">Laylson Albuquerque</a></sub>
</div>
