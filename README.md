# 🌐 AgentBlend: Multi-Agent Orchestration Framework for Web3

<div align="center">
  <img src="https://raw.githubusercontent.com/your-username/agentblend/main/assets/logo.svg" alt="AgentBlend Logo" width="200" />
  <p><em>Empowering the future of autonomous Web3 agents with AI-powered orchestration</em></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Hackathon](https://img.shields.io/badge/Hackathon-Seeds%20of%20Agentic%20Future-orange)](https://agenticfuture.ai/)
  [![Claude](https://img.shields.io/badge/AI-Claude%203-purple)](https://www.anthropic.com/claude)
</div>

---

## 🧠 Overview

AgentBlend is a decentralized multi-agent orchestration framework designed for the Seeds of Agentic Future hackathon. It enables the creation, deployment, and coordination of autonomous AI agents across blockchain networks, powered by Anthropic's Claude LLM for advanced reasoning and decision-making.

## ✨ Features

- 🤖 **AI-Powered Agents**: Leverage Claude for intelligent task analysis and execution
- 🧩 **Composable Agent Architecture**: Mix and match specialized agents for different blockchain tasks
- ⛓️ **Cross-Chain Compatibility**: Seamlessly operate across multiple blockchain ecosystems
- 🔄 **Decentralized Coordination**: No central point of failure for agent orchestration
- 🧠 **Knowledge Sharing**: Agents learn from each other's experiences and outcomes
- 📑 **Programmable Workflows**: Define complex multi-step processes spanning multiple agents
- 🔍 **Automated Capability Discovery**: Use AI to detect and validate agent capabilities
- 📋 **Smart Workflow Generation**: Automatically create optimized workflows for complex tasks

## 🏗️ Architecture

AgentBlend follows a modular architecture with the following components:

### 🔋 Core Layer
- 📚 **Agent Registry**: Discover, register, and deploy specialized AI agents
- 🎮 **Task Orchestration Engine**: Coordinate complex tasks across multiple agents
- 🧮 **Decision Engine**: Optimize agent selection and execution strategies
- 💾 **Agent Memory Store**: Distributed knowledge repository for agents

### 🧠 LLM Layer
- 🔌 **Claude Integration**: Interface with Anthropic's Claude for advanced reasoning
- 📋 **Prompt Management**: Library of optimized prompts for different agent tasks
- 🔍 **Output Parsing**: Extract structured data from language model responses
- ⚙️ **Task Processing**: Generate and optimize workflows for complex tasks

### 🔌 Infrastructure Layer
- 🌉 **Cross-Chain Communication Protocol**: Enable agents to interact across multiple blockchains
- 🔒 **Authentication**: Secure agent identity and authorization
- ✅ **Data Validation**: Ensure data integrity and quality

### 🔗 Integration Layer
- 🔌 **Blockchain Connectors**: Interface with different blockchain networks
- 📋 **Smart Contract APIs**: Interact with on-chain protocols
- 📡 **External Data Oracles**: Access off-chain data sources

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js 16+
- Yarn or npm
- Ethereum-compatible blockchain for full functionality (Ganache for local development)
- Claude API key from Anthropic (for LLM features)

### 💻 Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/agentblend.git
cd agentblend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on the example:

```
PORT=3000
API_KEY=your_secret_api_key
ETH_RPC_URL=http://localhost:8545
ETH_PRIVATE_KEY=your_ethereum_private_key_for_deployment
LOG_LEVEL=info

# Claude LLM Configuration
CLAUDE_API_KEY=your_claude_api_key
CLAUDE_MODEL=claude-3-sonnet-20240229
```

4. Build the project:

```bash
npm run build
```

5. Start the server:

```bash
npm start
```

The server will be running at `http://localhost:3000` 🎉

## 💡 Using Claude-Powered Features

AgentBlend leverages Claude for several intelligent features:

### 🔍 Automatic Workflow Generation

```javascript
// Generate a workflow for a complex task
const workflowData = await llmService.generateTaskWorkflow(
  "Find the best yield farming opportunity across Uniswap, Curve, and Aave, then execute a trade with 5 ETH"
);
```

### 📊 Agent Capability Validation

```javascript
// Validate and refine agent capabilities
const validatedCapabilities = await llmService.validateAgentCapabilities(
  "DeFi trading agent specializing in yield optimization and arbitrage",
  ["trade_execution", "yield_farming", "market_analysis"]
);
```

### 🔍 Task Result Summarization

```javascript
// Generate a human-readable summary of task results
const summary = await llmService.summarizeTaskResults(
  taskId,
  taskDescription,
  stepResults
);
```

### ⚡ Run LLM Demo

Test the Claude integration with our demo script:

```bash
npm run demo:llm
```

## 🔌 API Endpoints

### 🤖 Agent Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/agents/register` | Register a new agent |
| `GET` | `/api/agents/:id` | Get agent details |
| `GET` | `/api/agents` | Find agents matching criteria |
| `PUT` | `/api/agents/:id/status` | Update agent status |
| `POST` | `/api/agents/:id/verify` | Verify agent with signature |
| `DELETE` | `/api/agents/:id` | Deregister an agent |

### 📋 Task Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tasks/create` | Create a new task |
| `GET` | `/api/tasks/:id` | Get task details |
| `GET` | `/api/tasks` | List tasks |
| `POST` | `/api/tasks/:id/execute` | Execute a task |
| `POST` | `/api/tasks/:id/cancel` | Cancel a task |
| `GET` | `/api/tasks/:id/execution` | Get task execution status |
| `POST` | `/api/tasks/:taskId/steps/:stepId/result` | Submit step result |

### 📊 Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/agents/:id/performance` | Get agent performance stats |
| `GET` | `/api/analytics/tasks/statistics` | Get task statistics |
| `GET` | `/api/analytics/system/overview` | Get system overview |

### 🧠 LLM Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/llm/generate-workflow` | Generate a workflow from task description |
| `POST` | `/api/llm/optimize-workflow` | Optimize an existing workflow |
| `POST` | `/api/llm/validate-capabilities` | Validate agent capabilities |
| `POST` | `/api/llm/summarize-results` | Summarize task results |

## 🏁 Creating Your First Agent

To create a simple agent:

1. Implement the agent interface ✍️
2. Register the agent with the framework 📝
3. Define its capabilities 💪

<details>
<summary>📝 Example agent registration</summary>

```json
{
  "name": "DeFi Trader Agent",
  "description": "Optimizes DeFi yields across protocols",
  "owner": "0x123...",
  "capabilities": ["swap", "deposit", "borrow", "yield-farm"],
  "supportedNetworks": ["ethereum", "polygon", "arbitrum"],
  "endpoint": "https://agent-endpoint.example.com",
  "publicKey": "0x..."
}
```
</details>

## 📋 Creating a Task

<details>
<summary>📝 Example task creation</summary>

```json
{
  "name": "Optimize Yield Strategy",
  "description": "Find and execute best yield farming strategy",
  "creator": "0x456...",
  "workflow": {
    "steps": [
      {
        "id": "analyze_market",
        "name": "Analyze Market",
        "agentRequirements": {
          "capabilities": ["market_analysis"],
          "networks": ["ethereum"]
        },
        "input": {"markets": ["uniswap", "curve", "aave"]},
        "dependsOn": []
      },
      {
        "id": "select_strategy",
        "name": "Select Strategy",
        "agentRequirements": {
          "capabilities": ["strategy_optimization"]
        },
        "input": null,
        "dependsOn": ["analyze_market"]
      },
      {
        "id": "execute_trades",
        "name": "Execute Trades",
        "agentRequirements": {
          "capabilities": ["trade_execution"],
          "networks": ["ethereum"]
        },
        "input": null,
        "dependsOn": ["select_strategy"]
      }
    ]
  },
  "budget": {
    "amount": "0.05",
    "token": "ETH"
  },
  "deadline": "2025-03-05T15:00:00Z"
}
```
</details>

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 🙌

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Built for the Seeds of Agentic Future Hackathon 2025 🏆
- Powered by [Anthropic's Claude](https://www.anthropic.com/claude) for intelligent agent capabilities
- Thanks to all contributors and participants! 🎉

---

<div align="center">
  <p>Made with ❤️ by the AgentBlend Team</p>
  <p>
    <a href="https://github.com/your-username/agentblend">GitHub</a> •
    <a href="https://agenticfuture.ai/">Hackathon</a>
  </p>
</div>