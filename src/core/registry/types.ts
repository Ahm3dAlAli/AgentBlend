import { Agent, AgentCapability, BlockchainNetwork, AgentStatus } from '../types';

export interface AgentRegistrationRequest {
  name: string;
  description: string;
  owner: string;
  capabilities: AgentCapability[];
  supportedNetworks: BlockchainNetwork[];
  endpoint: string;
  publicKey: string;
  metadata?: Record<string, any>;
}

export interface AgentRegistrationResponse {
  agent: Agent;
  verificationChallenge: string;
  registryTxHash?: string;
}

export interface AgentQuery {
  capabilities?: AgentCapability[];
  networks?: BlockchainNetwork[];
  status?: AgentStatus;
  owner?: string;
}

export interface AgentRegistry {
  registerAgent(request: AgentRegistrationRequest): Promise<AgentRegistrationResponse>;
  getAgent(id: string): Promise<Agent | null>;
  findAgents(query: AgentQuery): Promise<Agent[]>;
  updateAgentStatus(id: string, status: AgentStatus): Promise<Agent | null>;
  verifyAgent(id: string, signature: string): Promise<boolean>;
  deregisterAgent(id: string): Promise<boolean>;
}