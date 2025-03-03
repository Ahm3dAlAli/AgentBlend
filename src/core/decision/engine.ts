import { 
    DecisionEngine, 
    AgentSelectionContext, 
    AgentCandidate, 
    AgentPerformanceStats 
  } from './types';
  
  /**
   * Simple implementation of the Decision Engine
   * For the MVP, this uses a basic scoring mechanism
   * In a production system, this would use more advanced
   * algorithms like reinforcement learning
   */
  export class SimpleDecisionEngine implements DecisionEngine {
    private performanceData: Map<string, {
      taskExecutions: Array<{
        taskId: string;
        stepId: string;
        success: boolean;
        executionTime: number;
        timestamp: Date;
      }>;
    }> = new Map();
    
    /**
     * Select the best agent from a list of candidates
     * based on the given context
     */
    async selectAgent(
      context: AgentSelectionContext, 
      candidates: AgentCandidate[]
    ): Promise<string | null> {
      if (candidates.length === 0) {
        return null;
      }
      
      // Calculate a score for each candidate
      const scoredCandidates = candidates.map(candidate => {
        let score = candidate.score;
        
        // Get agent performance data if available
        const performanceData = this.performanceData.get(candidate.agentId);
        if (performanceData) {
          // Calculate success rate
          const executions = performanceData.taskExecutions;
          const successRate = executions.length > 0
            ? executions.filter(e => e.success).length / executions.length
            : 0.5; // Default to 0.5 if no data
          
          // Adjust score based on past performance
          score *= (0.5 + successRate); // Scale between 0.5x and 1.5x
        }
        
        // If deadline is provided, consider estimated time
        if (context.deadline && candidate.estimatedTime) {
          const now = new Date();
          const timeUntilDeadline = context.deadline.getTime() - now.getTime();
          
          // Penalize agents that might not meet the deadline
          if (candidate.estimatedTime > timeUntilDeadline) {
            score *= 0.5;
          }
        }
        
        // If budget is provided, consider estimated cost
        if (context.budget && candidate.estimatedCost) {
          // Simple comparison assuming same token
          if (context.budget.token === candidate.estimatedCost.token) {
            const budgetAmount = parseFloat(context.budget.amount);
            const costAmount = parseFloat(candidate.estimatedCost.amount);
            
            // Penalize agents that exceed the budget
            if (costAmount > budgetAmount) {
              score *= 0.5;
            }
          }
        }
        
        return {
          ...candidate,
          adjustedScore: score
        };
      });
      
      // Sort by adjusted score (descending)
      scoredCandidates.sort((a, b) => b.adjustedScore - a.adjustedScore);
      
      // Return the ID of the highest-scoring candidate
      return scoredCandidates[0].agentId;
    }
    
    /**
     * Record agent performance data
     */
    async recordAgentPerformance(
      agentId: string, 
      taskId: string, 
      stepId: string, 
      success: boolean, 
      executionTime: number
    ): Promise<void> {
      // Get or create performance data for this agent
      let agentData = this.performanceData.get(agentId);
      
      if (!agentData) {
        agentData = {
          taskExecutions: []
        };
        this.performanceData.set(agentId, agentData);
      }
      
      // Add new execution data
      agentData.taskExecutions.push({
        taskId,
        stepId,
        success,
        executionTime,
        timestamp: new Date()
      });
      
      // Keep only the last 100 executions to limit memory usage
      if (agentData.taskExecutions.length > 100) {
        agentData.taskExecutions = agentData.taskExecutions.slice(-100);
      }
    }
    
    /**
     * Get performance statistics for an agent
     */
    async getAgentPerformanceStats(agentId: string): Promise<AgentPerformanceStats> {
      const agentData = this.performanceData.get(agentId);
      
      if (!agentData || agentData.taskExecutions.length === 0) {
        // Return default stats if no data
        return {
          agentId,
          totalTasks: 0,
          successfulTasks: 0,
          failedTasks: 0,
          averageExecutionTime: 0,
          successRate: 0
        };
      }
      
      const executions = agentData.taskExecutions;
      const totalTasks = executions.length;
      const successfulTasks = executions.filter(e => e.success).length;
      const failedTasks = totalTasks - successfulTasks;
      
      // Calculate average execution time
      const totalExecutionTime = executions.reduce(
        (sum, execution) => sum + execution.executionTime, 
        0
      );
      const averageExecutionTime = totalExecutionTime / totalTasks;
      
      return {
        agentId,
        totalTasks,
        successfulTasks,
        failedTasks,
        averageExecutionTime,
        successRate: successfulTasks / totalTasks
      };
    }
  }