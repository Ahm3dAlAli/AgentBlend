/**
 * Default configuration for the AgentBlend framework
 */
export default {
    // Server configuration
    server: {
      port: process.env.PORT || 3000,
      host: process.env.HOST || 'localhost'
    },
    
    // API configuration
    api: {
      apiKey: process.env.API_KEY,
      enableCors: true
    },
    
    // Blockchain configuration
    blockchain: {
      ethereum: {
        rpcUrl: process.env.ETH_RPC_URL || 'http://localhost:8545',
        privateKey: process.env.ETH_PRIVATE_KEY
      }
    },
    
    // Agent configuration
    agents: {
      verificationTimeout: 5 * 60 * 1000  // 5 minutes in milliseconds
    },
    
    // Task configuration
    tasks: {
      maxStepsPerTask: 50,
      defaultDeadline: 24 * 60 * 60 * 1000  // 24 hours in milliseconds
    },
    
    // Logging configuration
    logging: {
      level: process.env.LOG_LEVEL || 'info'
    }
  };