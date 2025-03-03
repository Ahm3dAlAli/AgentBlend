import { Workflow, WorkflowStep, StepStatus } from '../types';
import { WorkflowEngine } from './types';

/**
 * Implementation of the Workflow Engine
 * Responsible for workflow validation and execution logic
 */
export class DefaultWorkflowEngine implements WorkflowEngine {
  /**
   * Initialize a new workflow by setting all steps to PENDING
   */
  async initialize(workflow: Workflow): Promise<Workflow> {
    return {
      steps: workflow.steps.map(step => ({
        ...step,
        status: StepStatus.PENDING,
      })),
    };
  }

  /**
   * Get all steps that are ready to be executed
   * A step is ready when all of its dependencies have been completed
   */
  getNextSteps(workflow: Workflow, completedStepIds: string[]): WorkflowStep[] {
    return workflow.steps.filter(step => {
      // Skip steps that are already completed, running, or failed
      if (
        step.status === StepStatus.COMPLETED ||
        step.status === StepStatus.RUNNING ||
        step.status === StepStatus.FAILED ||
        step.status === StepStatus.ASSIGNED
      ) {
        return false;
      }
      
      // Check if all dependencies are completed
      const allDependenciesCompleted = step.dependsOn.every(
        dependencyId => completedStepIds.includes(dependencyId)
      );
      
      return allDependenciesCompleted;
    });
  }

  /**
   * Check if the workflow is complete (all steps are either completed or failed)
   */
  isComplete(workflow: Workflow): boolean {
    return workflow.steps.every(
      step => 
        step.status === StepStatus.COMPLETED || 
        step.status === StepStatus.FAILED ||
        step.status === StepStatus.SKIPPED
    );
  }

  /**
   * Update the status of a step in the workflow
   */
  updateStepStatus(
    workflow: Workflow, 
    stepId: string, 
    status: StepStatus, 
    output?: Record<string, any>, 
    error?: string
  ): Workflow {
    return {
      steps: workflow.steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            status,
            output: output || step.output,
            error: error || step.error,
            endTime: [StepStatus.COMPLETED, StepStatus.FAILED, StepStatus.SKIPPED].includes(status) 
              ? new Date() 
              : step.endTime,
            startTime: status === StepStatus.RUNNING && !step.startTime 
              ? new Date() 
              : step.startTime
          };
        }
        return step;
      }),
    };
  }

  /**
   * Validate a workflow
   * Checks for cycles and ensures all step dependencies exist
   */
  validateWorkflow(workflow: Workflow): boolean {
    const { steps } = workflow;
    
    // Check that all step IDs are unique
    const stepIds = steps.map(step => step.id);
    if (new Set(stepIds).size !== stepIds.length) {
      return false;
    }
    
    // Check that all dependencies reference existing steps
    for (const step of steps) {
      for (const depId of step.dependsOn) {
        if (!stepIds.includes(depId)) {
          return false;
        }
      }
    }
    
    // Check for cycles in the dependency graph
    const visited = new Set<string>();
    const recStack = new Set<string>();
    
    const isCyclic = (stepId: string): boolean => {
      if (!visited.has(stepId)) {
        visited.add(stepId);
        recStack.add(stepId);
        
        const step = steps.find(s => s.id === stepId);
        if (step) {
          for (const depId of step.dependsOn) {
            if (!visited.has(depId) && isCyclic(depId)) {
              return true;
            } else if (recStack.has(depId)) {
              return true;
            }
          }
        }
      }
      
      recStack.delete(stepId);
      return false;
    };
    
    for (const step of steps) {
      if (!visited.has(step.id) && isCyclic(step.id)) {
        return false;
      }
    }
    
    return true;
  }
}