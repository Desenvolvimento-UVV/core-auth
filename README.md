# Services Main API

![Built with Bun](https://img.shields.io/badge/Built%20with-Bun-blueviolet)
![NestJS](https://img.shields.io/badge/Framework-NestJS-red)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-yellow)
![License](https://img.shields.io/github/license/0x36E9/Services-main-api)

API backend desenvolvida para autenticação, controle de acesso e gerenciamento de licenças de um software privado, com foco em segurança, performance e integração com plataformas externas como o Discord.

## 🔐 Funcionalidades principais

- **Validação de login:** Verificação de usuário e senha com persistência segura.
- **Controle de subscription:** Checagem do tempo restante de licença (subscription) por usuário.
- **Integração com Discord:** Envio de notificações via Webhook para registrar eventos importantes como tentativas de login ou alertas.
- **Verificação de HWID (Hardware ID):** Garante que o software funcione somente na máquina autorizada.
- **JWT (JSON Web Tokens):** Utilizado para autenticação segura, com sessões stateless.
- **SSL Pinning:** Aplicado no lado cliente para impedir ataques man-in-the-middle (MITM), garantindo que as comunicações ocorram apenas com servidores confiáveis.
- **Sistema de Logs:** Armazena eventos de uso da API para auditoria e segurança.
- **Banimento de usuário:** Possibilidade de banir usuários diretamente pela API.
- **Blacklist:** Sistema de blacklist para bloquear usuários ou IPs maliciosos.
- **Blacklist Maliciosa:** Identificação e bloqueio automático de comportamentos suspeitos.
- **Gerenciamento de subscription pelo Discord:** Gerenciamento de licenças diretamente pelo bot do Discord, incluindo alteração de dados de subscription (ex: dias restantes, renovação, etc.).

## ⚙️ Tecnologias utilizadas

- **TypeScript** – Tipagem estática para maior segurança e legibilidade.
- **Bun** – Runtime moderno e rápido para JavaScript/TypeScript.
- **NestJS** – Framework modular e escalável para aplicações backend.
- **Fastify** – Servidor web leve e extremamente rápido.
- **Prisma** – ORM moderno com suporte a migrations e modelagem eficiente de banco de dados.
- **PostgreSQL** – Banco de dados relacional utilizado para armazenar e consultar dados com performance e segurança.
- **Beekeeper Studio** – Interface gráfica utilizada para visualizar e gerenciar os dados no PostgreSQL.
- **Axios** – Para chamadas HTTP externas.
- **Discord Webhook API** – Para integração com bot e envio de alertas.

## 🚀 Execução local

1. Clone o repositório:
   ```bash
   git clone https://github.com/0x36E9/Services-main-api.git
   cd Services-main-api

2. Instale as dependências:
   ```bash
   bun install
3. Configure o arquivo .env com suas variáveis de ambiente (ex: database URL, chave JWT, webhook do Discord).

4. Execute o projeto:
   ```bash
   bun start
