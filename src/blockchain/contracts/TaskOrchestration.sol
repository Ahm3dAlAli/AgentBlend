// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./AgentRegistry.sol";

/**
 * @title AgentBlend Task Orchestration
 * @dev Orchestrates tasks across multiple agents in the AgentBlend framework
 */
contract TaskOrchestration {
    // Task Status enum
    enum TaskStatus { CREATED, PENDING, RUNNING, COMPLETED, FAILED, CANCELED }
    
    // Step Status enum
    enum StepStatus { PENDING, ASSIGNED, RUNNING, COMPLETED, FAILED, SKIPPED }
    
    // Step struct
    struct Step {
        bytes32 id;
        string name;
        string[] requiredCapabilities;
        string[] requiredNetworks;
        bytes32[] dependsOn;
        bytes32 assignedAgent;
        StepStatus status;
        uint256 startTime;
        uint256 endTime;
    }
    
    // Task struct
    struct Task {
        bytes32 id;
        address creator;
        string name;
        string description;
        TaskStatus status;
        uint256 budget;
        uint256 deadline;
        uint256 createdAt;
        uint256 startedAt;
        uint256 completedAt;
        bytes32[] stepIds;
        mapping(bytes32 => Step) steps;
    }
    
    // Events
    event TaskCreated(bytes32 indexed id, address indexed creator, string name);
    event TaskStatusChanged(bytes32 indexed id, TaskStatus status);
    event StepAssigned(bytes32 indexed taskId, bytes32 indexed stepId, bytes32 indexed agentId);
    event StepStatusChanged(bytes32 indexed taskId, bytes32 indexed stepId, StepStatus status);
    
    // Reference to the Agent Registry
    AgentRegistry public agentRegistry;
    
    // Mapping from ID to Task
    mapping(bytes32 => Task) public tasks;
    
    // Mapping from creator to task IDs
    mapping(address => bytes32[]) public tasksByCreator;
    
    // Array of all task IDs
    bytes32[] public allTaskIds;
    
    /**
     * @dev Constructor
     * @param _agentRegistry Address of the Agent Registry contract
     */
    constructor(address _agentRegistry) {
        agentRegistry = AgentRegistry(_agentRegistry);
    }
    
    /**
     * @dev Create a new task
     * @param id Task ID
     * @param name Task name
     * @param description Task description
     * @param budget Task budget (in wei)
     * @param deadline Deadline timestamp
     * @param stepIds Array of step IDs
     * @param stepNames Array of step names
     * @param stepRequiredCapabilities Array of arrays of required capabilities for each step
     * @param stepRequiredNetworks Array of arrays of required networks for each step
     * @param stepDependsOn Array of arrays of step dependencies
     * @return success Boolean indicating if task creation was successful
     */
    function createTask(
        bytes32 id,
        string memory name,
        string memory description,
        uint256 budget,
        uint256 deadline,
        bytes32[] memory stepIds,
        string[] memory stepNames,
        string[][] memory stepRequiredCapabilities,
        string[][] memory stepRequiredNetworks,
        bytes32[][] memory stepDependsOn
    ) public payable returns (bool success) {
        // Ensure task ID doesn't exist
        require(tasks[id].creator == address(0), "Task ID already exists");
        
        // Ensure arrays are of equal length
        require(stepIds.length == stepNames.length, "Step arrays length mismatch");
        require(stepIds.length == stepRequiredCapabilities.length, "Step arrays length mismatch");
        require(stepIds.length == stepRequiredNetworks.length, "Step arrays length mismatch");
        require(stepIds.length == stepDependsOn.length, "Step arrays length mismatch");
        
        // If budget is specified, ensure enough value is sent
        if (budget > 0) {
            require(msg.value >= budget, "Insufficient funds sent");
        }
        
        // Create the task
        Task storage task = tasks[id];
        task.id = id;
        task.creator = msg.sender;
        task.name = name;
        task.description = description;
        task.status = TaskStatus.CREATED;
        task.budget = budget;
        task.deadline = deadline;
        task.createdAt = block.timestamp;
        task.stepIds = stepIds;
        
        // Add steps to the task
        for (uint i = 0; i < stepIds.length; i++) {
            Step storage step = task.steps[stepIds[i]];
            step.id = stepIds[i];
            step.name = stepNames[i];
            step.requiredCapabilities = stepRequiredCapabilities[i];
            step.requiredNetworks = stepRequiredNetworks[i];
            step.dependsOn = stepDependsOn[i];
            step.status = StepStatus.PENDING;
        }
        
        // Add to creator's tasks
        tasksByCreator[msg.sender].push(id);
        
        // Add to all tasks
        allTaskIds.push(id);
        
        // Emit event
        emit TaskCreated(id, msg.sender, name);
        
        return true;
    }
    
    /**
     * @dev Start a task
     * @param taskId ID of the task to start
     * @return success Boolean indicating if start was successful
     */
    function startTask(bytes32 taskId) public returns (bool success) {
        Task storage task = tasks[taskId];
        
        // Ensure task exists and is in CREATED status
        require(task.creator != address(0), "Task not found");
        require(task.status == TaskStatus.CREATED, "Task not in CREATED status");
        
        // Only the creator can start the task
        require(task.creator == msg.sender, "Not task creator");
        
        // Update task status
        task.status = TaskStatus.RUNNING;
        task.startedAt = block.timestamp;
        
        emit TaskStatusChanged(taskId, TaskStatus.RUNNING);
        
        return true;
    }
    
    /**
     * @dev Assign an agent to a step
     * @param taskId ID of the task
     * @param stepId ID of the step
     * @param agentId ID of the agent to assign
     * @return success Boolean indicating if assignment was successful
     */
    function assignStepToAgent(
        bytes32 taskId, 
        bytes32 stepId, 
        bytes32 agentId
    ) public returns (bool success) {
        Task storage task = tasks[taskId];
        
        // Ensure task exists and is running
        require(task.creator != address(0), "Task not found");
        require(task.status == TaskStatus.RUNNING, "Task not in RUNNING status");
        
        // Only the creator can assign agents
        require(task.creator == msg.sender, "Not task creator");
        
        // Get the step
        Step storage step = task.steps[stepId];
        
        // Ensure step exists and is in PENDING status
        require(step.id == stepId, "Step not found");
        require(step.status == StepStatus.PENDING, "Step not in PENDING status");
        
        // Check all dependencies are completed
        for (uint i = 0; i < step.dependsOn.length; i++) {
            bytes32 depId = step.dependsOn[i];
            require(
                task.steps[depId].status == StepStatus.COMPLETED,
                "Dependency not completed"
            );
        }
        
        // Assign the agent
        step.assignedAgent = agentId;
        step.status = StepStatus.ASSIGNED;
        
        emit StepAssigned(taskId, stepId, agentId);
        emit StepStatusChanged(taskId, stepId, StepStatus.ASSIGNED);
        
        return true;
    }
    
    /**
     * @dev Update step status
     * @param taskId ID of the task
     * @param stepId ID of the step
     * @param status New status
     * @return success Boolean indicating if update was successful
     */
    function updateStepStatus(
        bytes32 taskId, 
        bytes32 stepId, 
        StepStatus status
    ) public returns (bool success) {
        Task storage task = tasks[taskId];
        
        // Ensure task exists and is running
        require(task.creator != address(0), "Task not found");
        require(task.status == TaskStatus.RUNNING, "Task not in RUNNING status");
        
        // Get the step
        Step storage step = task.steps[stepId];
        
        // Ensure step exists
        require(step.id == stepId, "Step not found");
        
        // Only the creator can update step status
        // In a real implementation, we would check that the message sender
        // is either the task creator or the assigned agent
        require(task.creator == msg.sender, "Not authorized");
        
        // Update step status
        step.status = status;
        
        // Update timestamps
        if (status == StepStatus.RUNNING) {
            step.startTime = block.timestamp;
        } else if (status == StepStatus.COMPLETED || status == StepStatus.FAILED || status == StepStatus.SKIPPED) {
            step.endTime = block.timestamp;
        }
        
        emit StepStatusChanged(taskId, stepId, status);
        
        // Check if all steps are completed or failed
        bool allDone = true;
        bool anyFailed = false;
        
        for (uint i = 0; i < task.stepIds.length; i++) {
            bytes32 id = task.stepIds[i];
            StepStatus stepStatus = task.steps[id].status;
            
            if (stepStatus != StepStatus.COMPLETED && stepStatus != StepStatus.FAILED && stepStatus != StepStatus.SKIPPED) {
                allDone = false;
                break;
            }
            
            if (stepStatus == StepStatus.FAILED) {
                anyFailed = true;
            }
        }
        
        // If all steps are done, update task status
        if (allDone) {
            TaskStatus newStatus = anyFailed ? TaskStatus.FAILED : TaskStatus.COMPLETED;
            task.status = newStatus;
            task.completedAt = block.timestamp;
            
            emit TaskStatusChanged(taskId, newStatus);
        }
        
        return true;
    }
    
    /**
     * @dev Cancel a task
     * @param taskId ID of the task to cancel
     * @return success Boolean indicating if cancellation was successful
     */
    function cancelTask(bytes32 taskId) public returns (bool success) {
        Task storage task = tasks[taskId];
        
        // Ensure task exists and is not completed or cancelled
        require(task.creator != address(0), "Task not found");
        require(
            task.status != TaskStatus.COMPLETED && 
            task.status != TaskStatus.FAILED && 
            task.status != TaskStatus.CANCELED,
            "Task already completed or cancelled"
        );
        
        // Only the creator can cancel the task
        require(task.creator == msg.sender, "Not task creator");
        
        // Update task status
        task.status = TaskStatus.CANCELED;
        
        emit TaskStatusChanged(taskId, TaskStatus.CANCELED);
        
        // Refund remaining budget if any
        // In a real implementation, we would only refund unused portions
        if (task.budget > 0) {
            payable(task.creator).transfer(task.budget);
        }
        
        return true;
    }
    
    /**
     * @dev Get task details
     * @param taskId ID of the task
     * @return creator Task creator
     * @return name Task name
     * @return description Task description
     * @return status Task status
     * @return budget Task budget
     * @return deadline Task deadline
     * @return createdAt Task creation timestamp
     * @return startedAt Task start timestamp
     * @return completedAt Task completion timestamp
     */
    function getTaskDetails(
        bytes32 taskId
    ) public view returns (
        address creator,
        string memory name,
        string memory description,
        TaskStatus status,
        uint256 budget,
        uint256 deadline,
        uint256 createdAt,
        uint256 startedAt,
        uint256 completedAt
    ) {
        Task storage task = tasks[taskId];
        
        return (
            task.creator,
            task.name,
            task.description,
            task.status,
            task.budget,
            task.deadline,
            task.createdAt,
            task.startedAt,
            task.completedAt
        );
    }
    
    /**
     * @dev Get task step IDs
     * @param taskId ID of the task
     * @return stepIds Array of step IDs
     */
    function getTaskStepIds(
        bytes32 taskId
    ) public view returns (bytes32[] memory stepIds) {
        return tasks[taskId].stepIds;
    }
    
    /**
     * @dev Get step details
     * @param taskId ID of the task
     * @param stepId ID of the step
     * @return name Step name
     * @return assignedAgent Assigned agent ID
     * @return status Step status
     * @return startTime Step start timestamp
     * @return endTime Step end timestamp
     */
    function getStepDetails(
        bytes32 taskId,
        bytes32 stepId
    ) public view returns (
        string memory name,
        bytes32 assignedAgent,
        StepStatus status,
        uint256 startTime,
        uint256 endTime
    ) {
        Step storage step = tasks[taskId].steps[stepId];
        
        return (
            step.name,
            step.assignedAgent,
            step.status,
            step.startTime,
            step.endTime
        );
    }
}