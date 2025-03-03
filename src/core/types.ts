/**
 * Core types for the AgentBlend framework
 */

// Agent capabilities
export type AgentCapability = string;

// Supported blockchain networks
export type BlockchainNetwork = 
  | 'ethereum'
  | 'polygon'
  | 'arbitrum'
  | 'optimism'
  | 'base'
  | 'solana';

// Agent status
export enum AgentStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

// Agent interface
export interface Agent {
  id: string;
  name: string;
  description: string;
  owner: string; // Wallet address of agent owner
  capabilities: AgentCapability[];
  supportedNetworks: BlockchainNetwork[];
  endpoint: string; // API endpoint for agent
  publicKey: string;
  status: AgentStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Task status
export enum TaskStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED'
}

// Step execution status
export enum StepStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

// Workflow step
export interface WorkflowStep {
  id: string;
  name: string;
  agentRequirements: {
    capabilities: AgentCapability[];
    networks?: BlockchainNetwork[];
  };
  input: Record<string, any> | null;
  dependsOn: string[]; // IDs of steps that must complete before this one
  output?: Record<string, any>;
  status: StepStatus;
  assignedAgent?: string; // ID of the agent assigned to this step
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

// Task workflow
export interface Workflow {
  steps: WorkflowStep[];
}

// Task interface
export interface Task {
  id: string;
  name: string;
  description: string;
  creator: string; // Wallet address of task creator
  workflow: Workflow;
  status: TaskStatus;
  result?: Record<string, any>;
  error?: string;
  budget?: {
    amount: string;
    token: string;
  };
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}