import { AgentStatus } from '../types';
import { AgentRegistry } from '../registry/types';
import { WorkflowStep } from '../types';
import { AgentSelector } from './types';

/**
 * Default implementation of the Agent Selector
 * Selects agents based on capabilities and network requirements
 */
export class DefaultAgentSelector implements AgentSelector {
  /**
   * Select the best agent for a given workflow step
   * For the MVP, we'll use a simple matching algorithm
   * In a production system, this would include more advanced selection
   * criteria like reputation, cost, performance, etc.
   */
  async selectAgentForStep(
    step: WorkflowStep, 
    registry: AgentRegistry
  ): Promise<string | null> {
    const { capabilities, networks } = step.agentRequirements;
    
    // Find agents that match the required capabilities and networks
    const agents = await registry.findAgents({
      capabilities,
      networks,
      status: AgentStatus.ACTIVE
    });
    
    if (agents.length === 0) {
      return null;
    }
    
    // For MVP, just select the first matching agent
    // In a real system, we would apply a more sophisticated selection algorithm
    return agents[0].id;
  }
}