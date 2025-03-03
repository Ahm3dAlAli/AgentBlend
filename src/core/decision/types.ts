import { AgentCapability, BlockchainNetwork } from '../types';

/**
 * Decision context for agent selection
 */
export interface AgentSelectionContext {
  requiredCapabilities: AgentCapability[];
  requiredNetworks?: BlockchainNetwork[];
  taskId?: string;
  stepId?: string;
  priority?: number;
  deadline?: Date;
  budget?: {
    amount: string;
    token: string;
  };
}

/**
 * Agent candidate for a task
 */
export interface AgentCandidate {
  agentId: string;
  score: number;
  matchedCapabilities: AgentCapability[];
  matchedNetworks: BlockchainNetwork[];
  estimatedCost?: {
    amount: string;
    token: string;
  };
  estimatedTime?: number; // in milliseconds
}

/**
 * Decision Engine interface
 * Responsible for making decisions about agent selection,
 * task scheduling, and other optimization problems
 */
export interface DecisionEngine {
  selectAgent(context: AgentSelectionContext, candidates: AgentCandidate[]): Promise<string | null>;
  recordAgentPerformance(agentId: string, taskId: string, stepId: string, success: boolean, executionTime: number): Promise<void>;
  getAgentPerformanceStats(agentId: string): Promise<AgentPerformanceStats>;
}

/**
 * Agent performance statistics
 */
export interface AgentPerformanceStats {
  agentId: string;
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  averageExecutionTime: number; // in milliseconds
  successRate: number; // between 0 and 1
}