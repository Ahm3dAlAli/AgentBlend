import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';
import { Agent, AgentStatus } from '../types';
import { 
  AgentRegistry, 
  AgentRegistrationRequest, 
  AgentRegistrationResponse,
  AgentQuery 
} from './types';

/**
 * In-memory implementation of the Agent Registry
 * For production, this would be backed by a database and blockchain
 */
export class InMemoryAgentRegistry implements AgentRegistry {
  private agents: Map<string, Agent> = new Map();
  private challenges: Map<string, string> = new Map();

  /**
   * Register a new agent in the registry
   */
  async registerAgent(request: AgentRegistrationRequest): Promise<AgentRegistrationResponse> {
    const id = uuidv4();
    const now = new Date();
    
    const agent: Agent = {
      id,
      ...request,
      status: AgentStatus.PENDING,
      metadata: request.metadata || {},
      createdAt: now,
      updatedAt: now
    };
    
    this.agents.set(id, agent);
    
    // Generate a challenge for agent verification
    const challenge = ethers.utils.randomBytes(32);
    const challengeHex = ethers.utils.hexlify(challenge);
    this.challenges.set(id, challengeHex);
    
    return {
      agent,
      verificationChallenge: challengeHex
    };
  }

  /**
   * Get an agent by ID
   */
  async getAgent(id: string): Promise<Agent | null> {
    const agent = this.agents.get(id);
    return agent || null;
  }

  /**
   * Find agents that match the given criteria
   */
  async findAgents(query: AgentQuery): Promise<Agent[]> {
    const result: Agent[] = [];
    
    for (const agent of this.agents.values()) {
      let matches = true;
      
      // Filter by capabilities
      if (query.capabilities && query.capabilities.length > 0) {
        const hasAllCapabilities = query.capabilities.every(
          cap => agent.capabilities.includes(cap)
        );
        if (!hasAllCapabilities) {
          matches = false;
        }
      }
      
      // Filter by networks
      if (query.networks && query.networks.length > 0) {
        const supportsAnyNetwork = query.networks.some(
          network => agent.supportedNetworks.includes(network)
        );
        if (!supportsAnyNetwork) {
          matches = false;
        }
      }
      
      // Filter by status
      if (query.status && agent.status !== query.status) {
        matches = false;
      }
      
      // Filter by owner
      if (query.owner && agent.owner !== query.owner) {
        matches = false;
      }
      
      if (matches) {
        result.push(agent);
      }
    }
    
    return result;
  }

  /**
   * Update the status of an agent
   */
  async updateAgentStatus(id: string, status: AgentStatus): Promise<Agent | null> {
    const agent = this.agents.get(id);
    
    if (!agent) {
      return null;
    }
    
    const updatedAgent: Agent = {
      ...agent,
      status,
      updatedAt: new Date()
    };
    
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  /**
   * Verify an agent using a signed challenge
   */
  async verifyAgent(id: string, signature: string): Promise<boolean> {
    const agent = this.agents.get(id);
    const challenge = this.challenges.get(id);
    
    if (!agent || !challenge) {
      return false;
    }
    
    try {
      // Recover the signer from the signature
      const messageHash = ethers.utils.hashMessage(challenge);
      const recoveredAddress = ethers.utils.recoverAddress(messageHash, signature);
      
      // Check if the signer matches the agent's owner
      if (recoveredAddress.toLowerCase() === agent.owner.toLowerCase()) {
        // If verification succeeds, update agent status to ACTIVE
        await this.updateAgentStatus(id, AgentStatus.ACTIVE);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying agent signature:', error);
      return false;
    }
  }

  /**
   * Deregister an agent from the registry
   */
  async deregisterAgent(id: string): Promise<boolean> {
    const agent = this.agents.get(id);
    
    if (!agent) {
      return false;
    }
    
    this.agents.delete(id);
    this.challenges.delete(id);
    
    return true;
  }
}