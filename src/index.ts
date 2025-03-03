import dotenv from 'dotenv';
import { createApp } from './api';
import config from './config/default';
import { logger } from './utils/logger';

// Core components
import { AgentRegistryImpl } from './core/registry';
import { 
  TaskOrchestrationEngineImpl, 
  WorkflowEngineImpl,
  AgentSelectorImpl
} from './core/orchestration';
import { DecisionEngineImpl } from './core/decision';
import { AgentMemoryStoreImpl } from './core/memory';

// Blockchain connectors
import { BlockchainConnectorImpl } from './blockchain';

// Load environment variables
dotenv.config();

/**
 * Initialize and start the AgentBlend server
 */
async function bootstrap() {
  try {
    logger.info('Starting AgentBlend server...');
    
    // Initialize components
    logger.info('Initializing core components...');
    
    // Agent Registry
    const agentRegistry = new AgentRegistryImpl();
    
    // Decision Engine
    const decisionEngine = new DecisionEngineImpl();
    
    // Agent Selector
    const agentSelector = new AgentSelectorImpl();
    
    // Workflow Engine
    const workflowEngine = new WorkflowEngineImpl();
    
    // Task Orchestration Engine
    const taskOrchestration = new TaskOrchestrationEngineImpl(
      agentRegistry,
      agentSelector,
      workflowEngine
    );
    
    // Agent Memory Store
    const memoryStore = new AgentMemoryStoreImpl();
    
    // Blockchain Connector
    const blockchainConnector = new BlockchainConnectorImpl(
      config.blockchain.ethereum.rpcUrl,
      config.blockchain.ethereum.privateKey
    );
    
    // Connect to blockchain
    logger.info('Connecting to blockchain...');
    try {
      await blockchainConnector.connect();
      logger.info('Successfully connected to blockchain');
    } catch (error) {
      logger.warn(`Failed to connect to blockchain: ${error.message}`);
      logger.warn('Continuing without blockchain connection');
    }
    
    // Create Express app
    const app = createApp(
      agentRegistry,
      taskOrchestration,
      decisionEngine,
      config.api
    );
    
    // Start server
    const { port, host } = config.server;
    app.listen(port, () => {
      logger.info(`AgentBlend server listening at http://${host}:${port}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
    /**
     * Gracefully shut down the server
     */
    async function shutdown() {
      logger.info('Shutting down AgentBlend server...');
      
      // Disconnect from blockchain
      if (blockchainConnector.isConnected()) {
        await blockchainConnector.disconnect();
        logger.info('Disconnected from blockchain');
      }
      
      // Additional cleanup can be added here
      
      process.exit(0);
    }
  } catch (error) {
    logger.error('Failed to start AgentBlend server:', error);
    process.exit(1);
  }
}

// Start the server
bootstrap();