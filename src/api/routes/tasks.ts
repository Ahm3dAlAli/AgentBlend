import express, { Request, Response } from 'express';
import { TaskOrchestrationEngine } from '../../core/orchestration/types';
import { TaskStatus } from '../../core/types';

/**
 * Create task router
 */
export function createTaskRouter(orchestrationEngine: TaskOrchestrationEngine): express.Router {
  const router = express.Router();

  /**
   * Create a new task
   */
  router.post('/create', async (req: Request, res: Response) => {
    try {
      const { name, description, creator, workflow, budget, deadline } = req.body;
      
      // Validate required fields
      if (!name || !description || !creator || !workflow) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      // Validate workflow steps
      if (!workflow.steps || !Array.isArray(workflow.steps) || workflow.steps.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Workflow must contain at least one step'
        });
      }
      
      // Create the task
      const task = await orchestrationEngine.createTask({
        name,
        description,
        creator,
        workflow,
        budget,
        deadline: deadline ? new Date(deadline) : undefined
      });
      
      return res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Error creating task:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create task'
      });
    }
  });

  /**
   * Get task by ID
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const task = await orchestrationEngine.getTask(id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }
      
      return res.json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Error getting task:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to get task'
      });
    }
  });

  /**
   * List tasks
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { creator, status } = req.query;
      
      // Validate status if provided
      if (status && !Object.values(TaskStatus).includes(status as TaskStatus)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status'
        });
      }
      
      const tasks = await orchestrationEngine.listTasks(
        creator as string,
        status as TaskStatus
      );
      
      return res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Error listing tasks:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to list tasks'
      });
    }
  });

  /**
   * Execute a task
   */
  router.post('/:id/execute', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await orchestrationEngine.executeTask(id);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
      
      return res.json({
        success: true,
        data: result.task
      });
    } catch (error) {
      console.error('Error executing task:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to execute task'
      });
    }
  });

  /**
   * Cancel a task
   */
  router.post('/:id/cancel', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const canceled = await orchestrationEngine.cancelTask(id);
      
      if (!canceled) {
        return res.status(400).json({
          success: false,
          error: 'Failed to cancel task'
        });
      }
      
      return res.json({
        success: true,
        data: { canceled }
      });
    } catch (error) {
      console.error('Error canceling task:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel task'
      });
    }
  });

  /**
   * Get task execution status
   */
  router.get('/:id/execution', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const execution = await orchestrationEngine.getTaskExecution(id);
      
      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Task execution not found'
        });
      }
      
      return res.json({
        success: true,
        data: execution
      });
    } catch (error) {
      console.error('Error getting task execution:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to get task execution'
      });
    }
  });

  /**
   * Submit step result
   */
  router.post('/:taskId/steps/:stepId/result', async (req: Request, res: Response) => {
    try {
      const { taskId, stepId } = req.params;
      const { success, output, error } = req.body;
      
      // Validate parameters
      if (success === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing success parameter'
        });
      }
      
      // Handle step result
      await orchestrationEngine.handleStepResult({
        taskId,
        stepId,
        success,
        output,
        error
      });
      
      return res.json({
        success: true,
        data: { acknowledged: true }
      });
    } catch (error) {
      console.error('Error handling step result:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to handle step result'
      });
    }
  });

  return router;
}