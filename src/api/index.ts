import express from 'express';
import cors from 'cors';
import { createAgentRouter } from './routes/agents';
import { createTaskRouter } from './routes/tasks';
import { createAnalyticsRouter } from './routes/analytics';
import { apiKeyAuth } from './middleware/auth';
import { AgentRegistry } from '../core/registry/types';
import { TaskOrchestrationEngine } from '../core/orchestration/types';
import { DecisionEngine } from '../core/decision/types';

/**
 * Configure and create the Express app
 */
export function createApp(
  agentRegistry: AgentRegistry,
  taskOrchestration: TaskOrchestrationEngine,
  decisionEngine: DecisionEngine,
  config: {
    apiKey?: string;
    enableCors?: boolean;
  } = {}
) {
  const app = express();
  
  // Middleware setup
  app.use(express.json());
  
  // Enable CORS if configured
  if (config.enableCors) {
    app.use(cors());
  }
  
  // API key authentication if configured
  if (config.apiKey) {
    app.use(apiKeyAuth(config.apiKey));
  }
  
  // API routes
  app.use('/api/agents', createAgentRouter(agentRegistry));
  app.use('/api/tasks', createTaskRouter(taskOrchestration));
  app.use('/api/analytics', createAnalyticsRouter(
    decisionEngine,
    agentRegistry,
    taskOrchestration
  ));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });
  
  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  });
  
  return app;
}