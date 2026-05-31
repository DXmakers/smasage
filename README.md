# SMASAGE (Smart Savings Agent) 🚀

**Smasage** is a next-generation personal savings agent built natively on the **Stellar** blockchain. It doesn't just store your money—it actively invests to help you reach your financial goals faster through an intelligent, conversational interface powered by **OpenClaw**.

## 🌟 Features

- **Interactive Goal Setting**: Chat with OpenClaw to define your financial goals, income, and risk tolerance.
- **Smart Investment Allocation**: Automatically distributes savings across:
  - **AAVE/Blend**: For stable, low-risk yield.
  - **Soroswap LPs**: For higher returns through liquidity provision.
  - **Tether Gold (XAUT)**: As a reliable inflation hedge.
- **Dynamic Monitoring**: The agent continuously monitors your portfolio and suggests strategy adjustments based on market conditions and your goal timeline.
- **Premium User Experience**: A sleek, modern dashboard built with Next.js and Vanilla CSS.

## 🛠 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (TypeScript, Vanilla CSS)
- **AI Agent**: [OpenClaw Framework](https://github.com/OpenClaw/openclaw) (Node.js)
- **Smart Contracts**: [Soroban](https://soroban.stellar.org/) (Rust)
- **Protocols**: Stellar DEX, Blend, Soroswap

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Rust](https://www.rust-lang.org/) & [Soroban CLI](https://soroban.stellar.org/docs/installing-cli)
- [Freighter Wallet](https://www.freighter.app/) extension

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/smasage.git
   cd smasage
   ```

2. **Setup the Frontend**:

   ```bash
   cd frontend
    npm ci
    npm run dev
    ```

3. **Setup the Agent** (in a separate terminal):

    ```bash
    cd agent
    npm ci
    npm start
   ```

4. **Build the Contracts**:
   ```bash
   cd contracts
   cargo build --target wasm32-unknown-unknown
   ```

### Running Frontend and Agent Concurrently

The frontend (Next.js dev server) and agent (Node.js) can run simultaneously for local development:

1. Open two terminals in the project root.
2. In the first terminal, navigate to the frontend and start the dev server:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at http://localhost:3000.

3. In the second terminal, navigate to the agent and start it:
   ```bash
   cd agent
   npm start
   ```
   The agent will be available at the configured NOTIFICATION_PORT (default: 3001).

Both services will automatically reload on file changes during development.

### Environment Variables

Each component of Smasage uses environment variables configured via `.env` files. See below for the required and optional variables per component.

#### Root Level (`.env`)

Applied globally to both frontend and agent unless overridden locally.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `GEMINI_API_KEY` | string | (required) | API key for Gemini AI service |
| `NOTIFICATION_PORT` | number | 3001 | WebSocket server port for notifications |
| `SOROBAN_RPC_URL` | string | https://soroban-test.stellar.org | Soroban RPC endpoint |
| `SMASAGE_CONTRACT_ID` | string | (optional) | Smasage contract ID on Stellar |

#### Frontend (`.env` or `.env.local` in `/frontend`)

Frontend-specific variables (prefixed with `NEXT_PUBLIC_` to expose to the browser).

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_WS_URL` | string | ws://localhost:3001 | WebSocket URL for agent communication |
| `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` | boolean | true | Enable notification features |
| `NEXT_PUBLIC_PROACTIVE_NUDGES` | boolean | true | Enable proactive financial nudges |

#### Agent (`.env` or `.env.local` in `/agent`)

Backend agent-specific configuration.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `GEMINI_API_KEY` | string | (required) | API key for Gemini AI service |
| `NOTIFICATION_PORT` | number | 3001 | Port for WebSocket notification server |
| `SOROBAN_RPC_URL` | string | https://soroban-test.stellar.org | Soroban RPC endpoint |
| `SMASAGE_CONTRACT_ID` | string | (optional) | Smasage contract ID on Stellar |

#### Contracts (no runtime env vars)

The Contracts component uses build-time configuration via `Cargo.toml`. No `.env` file is required for local development.

#### Setup Instructions

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Update the following required variables in `.env`:
   - `GEMINI_API_KEY`: Obtain from your Gemini API dashboard

3. (Optional) If running frontend and agent separately, create `.env.local` files in each directory with component-specific overrides.

4. Never commit `.env` files containing secrets. Use `.env.example` to document the expected variables.

## 🗺 Roadmap

Our development is tracked via a detailed issue list. Key upcoming milestones include:

- [ ] Wallet integration (Freighter/Stellar SDK)
- [ ] Real-time portfolio indexing
- [ ] Automated rebalancing logic
- [ ] Enhanced conversational flow

See [issues.md](./issues.md) for a full breakdown of tasks.

## 🤝 Contributing

We welcome contributions from the community! Whether you're a frontend wizard, a Rust expert, or an AI enthusiast, there's a place for you at Smasage.

Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get started.

## 📜 License

Smasage is open-source software licensed under the MIT License.
