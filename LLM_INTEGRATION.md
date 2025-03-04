# 🧠 Claude LLM Integration Guide

This guide explains how to use the Claude LLM integration in AgentBlend.

## 📋 Overview

AgentBlend integrates Anthropic's Claude language model to provide intelligent capabilities:

- **Workflow Generation**: Automatically create step-by-step workflows from task descriptions
- **Task Analysis**: Analyze tasks to determine optimal execution strategies
- **Capability Validation**: Verify and enhance agent capability descriptions
- **Result Summarization**: Generate human-readable summaries of complex task results

## 🔑 Setup

1. Get an API key from [Anthropic](https://console.anthropic.com/)
2. Add your API key to the `.env` file:
   ```
   CLAUDE_API_KEY=your_claude_api_key
   CLAUDE_MODEL=claude-3-sonnet-20240229
   ```

## 🚀 Using the LLM Service

### Creating the LLM Service

```typescript
import { createLLMService, LLMModel } from './llm';

// Create the service
const llmService = createLLMService({
  provider: 'claude',
  apiKey: process.env.CLAUDE_API_KEY || '',
  model: process.env.CLAUDE_MODEL as LLMModel || LLMModel.CLAUDE_3_SONNET
});
```

### Generating Workflows

```typescript
import { generateTaskWorkflow } from './llm';

// Generate a workflow from a description
const workflow = await generateTaskWorkflow(
  llmService,
  "Find the best yield farming opportunity across Uniswap and Aave, then execute a trade with 10 ETH"
);

console.log(workflow);
// Output: A structured workflow with steps, agent requirements, dependencies, etc.
```

### Optimizing Workflows

```typescript
import { optimizeTaskWorkflow } from './llm';

// Optimize an existing workflow
const optimizedWorkflow = await optimizeTaskWorkflow(llmService, existingWorkflow);

console.log(optimizedWorkflow);
// Output: An improved version of the workflow with better efficiency, parallelization, etc.
```

### Validating Agent Capabilities

```typescript
import { validateAgentCapabilities } from './llm';

// Validate and refine agent capabilities
const description = "A DeFi trading agent that can analyze market conditions, optimize trade execution, and monitor portfolio performance";
const claimedCapabilities = ["trade_execution", "market_analysis"];

const validatedCapabilities = await validateAgentCapabilities(
  llmService,
  description,
  claimedCapabilities
);

console.log(validatedCapabilities);
// Output: ["trade_execution", "market_analysis", "portfolio_monitoring", "price_prediction"]
```

### Executing Agent Tasks

```typescript
import { executeAgentTask } from './llm';

// Execute a task step using an agent's capabilities
const result = await executeAgentTask(llmService, {
  taskId: "task-123",
  taskDescription: "Optimize yield farming strategy",
  stepId: "step-1",
  stepName: "Analyze Market Conditions",
  inputData: { markets: ["uniswap", "aave", "curve"] },
  agentCapabilities: ["market_analysis", "price_prediction"],
  agentSpecialization: "DeFi Market Analyzer",
  agentNetworks: ["ethereum", "polygon"]
});

console.log(result);
// Output: { marketConditions: {...}, bestOpportunities: [...], riskAssessment: {...} }
```

### Summarizing Results

```typescript
import { summarizeTaskResults } from './llm';

// Generate a human-readable summary of task results
const summary = await summarizeTaskResults(
  llmService,
  "task-123",
  "Optimize yield farming strategy across multiple protocols",
  {
    "step-1": { marketAnalysis: {...} },
    "step-2": { selectedStrategy: {...} },
    "step-3": { executionResult: {...} }
  }
);

console.log(summary);
// Output: A comprehensive summary of the task execution, findings, and recommendations
```

## 🛠️ Customizing Prompts

AgentBlend uses a template system for prompts. You can customize existing prompts or add new ones:

```typescript
import { createPromptTemplate, formatPrompt } from './llm/prompts';

// Create a custom prompt template
const CUSTOM_PROMPT = createPromptTemplate(
  'custom_analysis_prompt',
  `Analyze the following data for {{marketName}}:
  
  {{marketData}}
  
  Provide insights on:
  1. Current trends
  2. Risk factors
  3. Investment opportunities`,
  ['marketName', 'marketData']
);

// Use the prompt
const formattedPrompt = formatPrompt('custom_analysis_prompt', {
  marketName: 'Uniswap V3',
  marketData: JSON.stringify(marketData)
});
```

## 📊 Best Practices

1. **Temperature Setting**: Use lower temperatures (0.1-0.3) for structured data and higher (0.7-0.9) for creative content
2. **Error Handling**: Always handle potential errors in LLM responses, especially when parsing structured data
3. **Context Management**: Keep prompts focused and relevant to get the best results
4. **Data Formatting**: Use the utility functions in `llm/utils/formatting.ts` to format data for prompts
5. **Response Parsing**: Use the utility functions in `llm/utils/parsing.ts` to extract structured data from responses

## 🔄 Running the Demo

To see the LLM integration in action, run:

```bash
npm run demo:llm
```

This will:
1. Register demo agents
2. Generate a workflow for a sample task
3. Optimize the workflow
4. Validate agent capabilities