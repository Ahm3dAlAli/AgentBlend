import express, { Request, Response } from 'express';
import { DecisionEngine } from '../../core/decision/types';
import { AgentRegistry } from '../../core/registry/types';
import { TaskOrchestrationEngine } from '../../core/orchestration/types';
import { TaskStatus } from '../../core/types';

/**
 * Create analytics router
 */
export function createAnalyticsRouter(
  decisionEngine: DecisionEngine,
  agentRegistry: AgentRegistry,
  taskOrchestration: TaskOrchestrationEngine
): express.Router {
  const router = express.Router();

  /**
   * Get agent performance stats
   */
  router.get('/agents/:id/performance', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if agent exists
      const agent = await agentRegistry.getAgent(id);
      
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }
      
      // Get performance stats
      const stats = await decisionEngine.getAgentPerformanceStats(id);
      
      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting agent performance stats:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to get agent performance stats'
      });
    }
  });

  /**
   * Get task statistics
   */
  router.get('/tasks/statistics', async (req: Request, res: Response) => {
    try {
      const { creator } = req.query;
      
      // Get all tasks
      const allTasks = await taskOrchestration.listTasks(
        creator as string | undefined
      );
      
      // Calculate statistics
      const statistics = {
        total: allTasks.length,
        byStatus: {
          [TaskStatus.CREATED]: 0,
          [TaskStatus.PENDING]: 0,
          [TaskStatus.RUNNING]: 0,
          [TaskStatus.COMPLETED]: 0,
          [TaskStatus.FAILED]: 0,
          [TaskStatus.CANCELED]: 0
        },
        completionRate: 0,
        averageSteps: 0
      };
      
      // Count tasks by status
      allTasks.forEach(task => {
        statistics.byStatus[task.status]++;
      });
      
      // Calculate completion rate (completed / total completed or failed)
      const completedOrFailed = statistics.byStatus[TaskStatus.COMPLETED] + 
                               statistics.byStatus[TaskStatus.FAILED];
      
      if (completedOrFailed > 0) {
        statistics.completionRate = statistics.byStatus[TaskStatus.COMPLETED] / completedOrFailed;
      }
      
      // Calculate average number of steps per task
      const totalSteps = allTasks.reduce(
        (sum, task) => sum + task.workflow.steps.length, 
        0
      );
      
      if (allTasks.length > 0) {
        statistics.averageSteps = totalSteps / allTasks.length;
      }
      
      return res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting task statistics:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to get task statistics'
      });
    }
  });

  /**
   * Get system overview
   */
  router.get('/system/overview', async (req: Request, res: Response) => {
    try {
      // Get all agents
      const agents = await agentRegistry.findAgents({});
      
      // Get all tasks
      const tasks = await taskOrchestration.listTasks();
      
      // Calculate system stats
      const overview = {
        agentCount: agents.length,
        taskCount: tasks.length,
        activeTaskCount: tasks.filter(
          task => task.status === TaskStatus.RUNNING
        ).length,
        completedTaskCount: tasks.filter(
          task => task.status === TaskStatus.COMPLETED
        ).length,
        // Agent capability coverage
        capabilities: {} as Record<string, number>
      };
      
      // Count agents per capability
      agents.forEach(agent => {
        agent.capabilities.forEach(capability => {
          if (!overview.capabilities[capability]) {
            overview.capabilities[capability] = 0;
          }
          overview.capabilities[capability]++;
        });
      });
      
      return res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      console.error('Error getting system overview:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to get system overview'
      });
    }
  });

  return router;
}