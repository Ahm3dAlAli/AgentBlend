/**
 * Custom error classes for the AgentBlend framework
 */

/**
 * Base error class for AgentBlend
 */
export class AgentBlendError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AgentBlendError';
    }
  }
  
  /**
   * Error for validation failures
   */
  export class ValidationError extends AgentBlendError {
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  }
  
  /**
   * Error for when a resource is not found
   */
  export class NotFoundError extends AgentBlendError {
    constructor(resource: string, id: string) {
      super(`${resource} not found with id ${id}`);
      this.name = 'NotFoundError';
    }
  }
  
  /**
   * Error for blockchain-related issues
   */
  export class BlockchainError extends AgentBlendError {
    constructor(message: string) {
      super(message);
      this.name = 'BlockchainError';
    }
  }
  
  /**
   * Error for authorization failures
   */
  export class AuthorizationError extends AgentBlendError {
    constructor(message: string) {
      super(message);
      this.name = 'AuthorizationError';
    }
  }
  
  /**
   * Error for agent-related issues
   */
  export class AgentError extends AgentBlendError {
    constructor(message: string) {
      super(message);
      this.name = 'AgentError';
    }
  }
  
  /**
   * Error for task-related issues
   */
  export class TaskError extends AgentBlendError {
    constructor(message: string) {
      super(message);
      this.name = 'TaskError';
    }
  }
  
  /**
   * Handle and format an error
   */
  export function handleError(error: any): {
    status: number;
    message: string;
  } {
    if (error instanceof ValidationError) {
      return {
        status: 400,
        message: error.message
      };
    }
    
    if (error instanceof NotFoundError) {
      return {
        status: 404,
        message: error.message
      };
    }
    
    if (error instanceof AuthorizationError) {
      return {
        status: 401,
        message: error.message
      };
    }
    
    if (error instanceof BlockchainError) {
      return {
        status: 503,
        message: error.message
      };
    }
    
    if (error instanceof AgentError || error instanceof TaskError) {
      return {
        status: 400,
        message: error.message
      };
    }
    
    // Default handling for unknown errors
    console.error('Unhandled error:', error);
    
    return {
      status: 500,
      message: 'Internal server error'
    };
  }