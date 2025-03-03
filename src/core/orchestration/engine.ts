import { v4 as uuidv4 } from 'uuid';
import { 
  Task, 
  TaskStatus, 
  Workflow, 
  WorkflowStep, 
  StepStatus 
} from '../types';
import { 
  TaskOrchestrationEngine, 
  CreateTaskRequest, 
  TaskExecutionResult, 
  TaskExecution,
  StepExecutionResult,
  WorkflowEngine,
  AgentSelector
} from './types';
import { AgentRegistry } from '../registry/types';
import { DefaultWorkflowEngine } from './workflow';

/**
 * In-memory implementation of the Task Orchestration Engine
 * For production, this would be backed by a database and/or blockchain
 */
export class InMemoryTaskOrchestrationEngine implements TaskOrchestrationEngine {
  private tasks: Map<string, Task> = new Map();
  private executions: Map<string, TaskExecution> = new Map();
  private workflowEngine: WorkflowEngine;
  private agentRegistry: AgentRegistry;
  private agentSelector: AgentSelector;
  
  constructor(
    agentRegistry: AgentRegistry, 
    agentSelector: AgentSelector,
    workflowEngine?: WorkflowEngine
  ) {
    this.agentRegistry = agentRegistry;
    this.agentSelector = agentSelector;
    this.workflowEngine = workflowEngine || new DefaultWorkflowEngine();
  }

  /**
   * Create a new task
   */
  async createTask(request: CreateTaskRequest): Promise<Task> {
    const id = uuidv4();
    const now = new Date();
    
    // Validate the workflow
    if (!this.workflowEngine.validateWorkflow(request.workflow)) {
      throw new Error('Invalid workflow: contains cycles or references non-existent steps');
    }
    
    // Initialize the workflow (sets all steps to PENDING)
    const initializedWorkflow = await this.workflowEngine.initialize(request.workflow);
    
    const task: Task = {
      id,
      name: request.name,
      description: request.description,
      creator: request.creator,
      workflow: initializedWorkflow,
      status: TaskStatus.CREATED,
      budget: request.budget,
      deadline: request.deadline,
      createdAt: now,
      updatedAt: now
    };
    
    this.tasks.set(id, task);
    return task;
  }

  /**
   * Get a task by ID
   */
  async getTask(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  /**
   * List tasks filtered by creator and/or status
   */
  async listTasks(creator?: string, status?: TaskStatus): Promise<Task[]> {
    const results: Task[] = [];
    
    for (const task of this.tasks.values()) {
      if (creator && task.creator !== creator) {
        continue;
      }
      
      if (status && task.status !== status) {
        continue;
      }
      
      results.push(task);
    }
    
    return results;
  }

  /**
   * Execute a task
   * Initiates task execution and returns immediately
   * The actual execution happens asynchronously
   */
  async executeTask(id: string): Promise<TaskExecutionResult> {
    const task = this.tasks.get(id);
    
    if (!task) {
      return {
        task: { id } as Task,
        success: false,
        error: 'Task not found'
      };
    }
    
    if (task.status === TaskStatus.RUNNING) {
      return {
        task,
        success: false,
        error: 'Task is already running'
      };
    }
    
    if (task.status === TaskStatus.COMPLETED) {
      return {
        task,
        success: false,
        error: 'Task is already completed'
      };
    }
    
    // Update task status to RUNNING
    const updatedTask: Task = {
      ...task,
      status: TaskStatus.RUNNING,
      startedAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tasks.set(id, updatedTask);
    
    // Initialize task execution
    const execution: TaskExecution = {
      taskId: id,
      completedSteps: [],
      failedSteps: [],
      startTime: new Date(),
      lastUpdated: new Date()
    };
    
    this.executions.set(id, execution);
    
    // Start async execution process
    this.processTask(id).catch(error => {
      console.error(`Error processing task ${id}:`, error);
      this.handleTaskFailure(id, error.message);
    });
    
    return {
      task: updatedTask,
      success: true
    };
  }

  /**
   * Cancel a running task
   */
  async cancelTask(id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    
    if (!task || task.status !== TaskStatus.RUNNING) {
      return false;
    }
    
    const updatedTask: Task = {
      ...task,
      status: TaskStatus.CANCELED,
      updatedAt: new Date()
    };
    
    this.tasks.set(id, updatedTask);
    return true;
  }

  /**
   * Get the current execution state of a task
   */
  async getTaskExecution(id: string): Promise<TaskExecution | null> {
    return this.executions.get(id) || null;
  }

  /**
   * Handle a step execution result
   * Called by agents when they complete a step
   */
  async handleStepResult(result: StepExecutionResult): Promise<void> {
    const { taskId, stepId, success, output, error } = result;
    const task = this.tasks.get(taskId);
    const execution = this.executions.get(taskId);
    
    if (!task || !execution) {
      throw new Error('Task not found');
    }
    
    // Update the step status in the workflow
    const status = success ? StepStatus.COMPLETED : StepStatus.FAILED;
    const updatedWorkflow = this.workflowEngine.updateStepStatus(
      task.workflow,
      stepId,
      status,
      output,
      error
    );
    
    // Update the task with the new workflow
    const updatedTask: Task = {
      ...task,
      workflow: updatedWorkflow,
      updatedAt: new Date()
    };
    
    this.tasks.set(taskId, updatedTask);
    
    // Update the execution record
    if (success) {
      execution.completedSteps.push(stepId);
    } else {
      execution.failedSteps.push(stepId);
    }
    
    execution.currentStepId = undefined;
    execution.lastUpdated = new Date();
    this.executions.set(taskId, execution);
    
    // Continue processing the task
    this.processTask(taskId).catch(error => {
      console.error(`Error processing task ${taskId}:`, error);
      this.handleTaskFailure(taskId, error.message);
    });
  }

  /**
   * Process a task by executing its next steps
   * This is called recursively until the task is complete
   */
  private async processTask(id: string): Promise<void> {
    const task = this.tasks.get(id);
    const execution = this.executions.get(id);
    
    if (!task || !execution) {
      return;
    }
    
    // If the task is not running, don't process it
    if (task.status !== TaskStatus.RUNNING) {
      return;
    }
    
    // Check if the workflow is complete
    if (this.workflowEngine.isComplete(task.workflow)) {
      await this.handleTaskCompletion(id);
      return;
    }
    
    // Get the next steps to execute
    const nextSteps = this.workflowEngine.getNextSteps(
      task.workflow,
      execution.completedSteps
    );
    
    if (nextSteps.length === 0) {
      // If there are no next steps but the workflow is not complete,
      // it means some steps have failed and we can't proceed
      const failedSteps = task.workflow.steps.filter(
        step => step.status === StepStatus.FAILED
      );
      
      if (failedSteps.length > 0) {
        await this.handleTaskFailure(
          id,
          `Task failed due to failed steps: ${failedSteps.map(s => s.id).join(', ')}`
        );
      }
      
      return;
    }
    
    // Assign agents to each step and start execution
    const assignmentPromises = nextSteps.map(async step => {
      try {
        // Select an agent for this step
        const agentId = await this.agentSelector.selectAgentForStep(step, this.agentRegistry);
        
        if (!agentId) {
          // If no agent is available, mark the step as failed
          console.warn(`No agent available for step ${step.id}`);
          const updatedWorkflow = this.workflowEngine.updateStepStatus(
            task.workflow,
            step.id,
            StepStatus.FAILED,
            undefined,
            'No agent available'
          );
          
          const updatedTask: Task = {
            ...task,
            workflow: updatedWorkflow,
            updatedAt: new Date()
          };
          
          this.tasks.set(id, updatedTask);
          execution.failedSteps.push(step.id);
          
          return;
        }
        
        // Mark the step as assigned
        const updatedWorkflow = this.workflowEngine.updateStepStatus(
          task.workflow,
          step.id,
          StepStatus.ASSIGNED,
          undefined,
          undefined
        );
        
        const updatedTask: Task = {
          ...task,
          workflow: updatedWorkflow,
          updatedAt: new Date()
        };
        
        this.tasks.set(id, updatedTask);
        
        // In a real implementation, we would send a request to the agent
        // to execute the step. For this MVP, we'll simulate it with a
        // setTimeout to complete the step after a short delay
        
        // Simulate agent execution (in a real system, this would be an API call)
        setTimeout(() => {
          const success = Math.random() > 0.2; // 80% success rate for simulation
          
          this.handleStepResult({
            taskId: id,
            stepId: step.id,
            success,
            output: success ? { result: `Executed step ${step.id}` } : undefined,
            error: success ? undefined : `Failed to execute step ${step.id}`
          }).catch(error => {
            console.error(`Error handling step result for ${step.id}:`, error);
          });
        }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
      } catch (error) {
        console.error(`Error assigning agent for step ${step.id}:`, error);
        // If there's an error assigning an agent, mark the step as failed
        const updatedWorkflow = this.workflowEngine.updateStepStatus(
          task.workflow,
          step.id,
          StepStatus.FAILED,
          undefined,
          error.message
        );
        
        const updatedTask: Task = {
          ...task,
          workflow: updatedWorkflow,
          updatedAt: new Date()
        };
        
        this.tasks.set(id, updatedTask);
        execution.failedSteps.push(step.id);
      }
    });
    
    // Wait for all assignments to complete
    await Promise.all(assignmentPromises);
  }

  /**
   * Handle task completion
   */
  private async handleTaskCompletion(id: string): Promise<void> {
    const task = this.tasks.get(id);
    
    if (!task) {
      return;
    }
    
    // Count failed steps
    const failedSteps = task.workflow.steps.filter(
      step => step.status === StepStatus.FAILED
    );
    
    // Determine final status based on step results
    const finalStatus = failedSteps.length > 0
      ? TaskStatus.FAILED
      : TaskStatus.COMPLETED;
    
    // Collect the outputs from all completed steps as the task result
    const result = task.workflow.steps
      .filter(step => step.status === StepStatus.COMPLETED)
      .reduce((acc, step) => {
        if (step.output) {
          acc[step.id] = step.output;
        }
        return acc;
      }, {} as Record<string, any>);
    
    // Update the task
    const updatedTask: Task = {
      ...task,
      status: finalStatus,
      result,
      error: failedSteps.length > 0
        ? `Task failed due to ${failedSteps.length} failed steps`
        : undefined,
      completedAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tasks.set(id, updatedTask);
  }

  /**
   * Handle task failure
   */
  private async handleTaskFailure(id: string, error: string): Promise<void> {
    const task = this.tasks.get(id);
    
    if (!task) {
      return;
    }
    
    const updatedTask: Task = {
      ...task,
      status: TaskStatus.FAILED,
      error,
      completedAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tasks.set(id, updatedTask);
  }
}