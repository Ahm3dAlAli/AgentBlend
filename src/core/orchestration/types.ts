import { Task, TaskStatus, Workflow, WorkflowStep, StepStatus } from '../types';
import { AgentRegistry } from '../registry/types';

export interface CreateTaskRequest {
  name: string;
  description: string;
  creator: string;
  workflow: Workflow;
  budget?: {
    amount: string;
    token: string;
  };
  deadline?: Date;
}

export interface TaskExecutionResult {
  task: Task;
  success: boolean;
  error?: string;
}

export interface TaskExecution {
  taskId: string;
  currentStepId?: string;
  completedSteps: string[];
  failedSteps: string[];
  startTime: Date;
  lastUpdated: Date;
}

export interface StepExecutionResult {
  stepId: string;
  taskId: string;
  success: boolean;
  output?: Record<string, any>;
  error?: string;
}

export interface TaskOrchestrationEngine {
  createTask(request: CreateTaskRequest): Promise<Task>;
  getTask(id: string): Promise<Task | null>;
  listTasks(creator?: string, status?: TaskStatus): Promise<Task[]>;
  executeTask(id: string): Promise<TaskExecutionResult>;
  cancelTask(id: string): Promise<boolean>;
  getTaskExecution(id: string): Promise<TaskExecution | null>;
  handleStepResult(result: StepExecutionResult): Promise<void>;
}

export interface WorkflowEngine {
  initialize(workflow: Workflow): Promise<Workflow>;
  getNextSteps(workflow: Workflow, completedStepIds: string[]): WorkflowStep[];
  isComplete(workflow: Workflow): boolean;
  updateStepStatus(workflow: Workflow, stepId: string, status: StepStatus, output?: Record<string, any>, error?: string): Workflow;
  validateWorkflow(workflow: Workflow): boolean;
}

export interface AgentSelector {
  selectAgentForStep(step: WorkflowStep, registry: AgentRegistry): Promise<string | null>;
}