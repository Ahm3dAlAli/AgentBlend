// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title AgentBlend Agent Registry
 * @dev Registry for AI agents in the AgentBlend framework
 */
contract AgentRegistry {
    // Agent Status enum
    enum AgentStatus { PENDING, ACTIVE, INACTIVE, SUSPENDED }
    
    // Agent struct
    struct Agent {
        bytes32 id;
        address owner;
        string name;
        string description;
        string[] capabilities;
        string[] supportedNetworks;
        string endpoint;
        bytes publicKey;
        AgentStatus status;
        uint256 reputation;
        uint256 registeredAt;
        uint256 updatedAt;
    }
    
    // Events
    event AgentRegistered(bytes32 indexed id, address indexed owner, string name);
    event AgentStatusChanged(bytes32 indexed id, AgentStatus status);
    event AgentUpdated(bytes32 indexed id);
    
    // Mapping from ID to Agent
    mapping(bytes32 => Agent) public agents;
    
    // Mapping for capability-based lookups
    mapping(string => bytes32[]) public agentsByCapability;
    
    // Mapping for network-based lookups
    mapping(string => bytes32[]) public agentsByNetwork;
    
    // Mapping from owner to agent IDs
    mapping(address => bytes32[]) public agentsByOwner;
    
    // Array of all agent IDs
    bytes32[] public allAgentIds;
    
    // Modifier to check if the sender is the agent owner
    modifier onlyAgentOwner(bytes32 agentId) {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        _;
    }
    
    /**
     * @dev Register a new agent
     * @param id Unique identifier for the agent
     * @param name Name of the agent
     * @param description Description of the agent
     * @param capabilities List of capabilities
     * @param supportedNetworks List of supported networks
     * @param endpoint API endpoint for the agent
     * @param publicKey Public key for verification
     * @return success Boolean indicating if registration was successful
     */
    function registerAgent(
        bytes32 id,
        string memory name,
        string memory description,
        string[] memory capabilities,
        string[] memory supportedNetworks,
        string memory endpoint,
        bytes memory publicKey
    ) public returns (bool success) {
        // Ensure agent ID doesn't exist
        require(agents[id].owner == address(0), "Agent ID already exists");
        
        // Create the agent
        Agent storage agent = agents[id];
        agent.id = id;
        agent.owner = msg.sender;
        agent.name = name;
        agent.description = description;
        agent.capabilities = capabilities;
        agent.supportedNetworks = supportedNetworks;
        agent.endpoint = endpoint;
        agent.publicKey = publicKey;
        agent.status = AgentStatus.PENDING;
        agent.reputation = 0;
        agent.registeredAt = block.timestamp;
        agent.updatedAt = block.timestamp;
        
        // Add to owner's agents
        agentsByOwner[msg.sender].push(id);
        
        // Add to all agents
        allAgentIds.push(id);
        
        // Add to capability mappings
        for (uint i = 0; i < capabilities.length; i++) {
            agentsByCapability[capabilities[i]].push(id);
        }
        
        // Add to network mappings
        for (uint i = 0; i < supportedNetworks.length; i++) {
            agentsByNetwork[supportedNetworks[i]].push(id);
        }
        
        // Emit event
        emit AgentRegistered(id, msg.sender, name);
        
        return true;
    }
    
    /**
     * @dev Update agent status
     * @param agentId ID of the agent to update
     * @param status New status
     * @return success Boolean indicating if update was successful
     */
    function updateAgentStatus(
        bytes32 agentId, 
        AgentStatus status
    ) public onlyAgentOwner(agentId) returns (bool success) {
        agents[agentId].status = status;
        agents[agentId].updatedAt = block.timestamp;
        
        emit AgentStatusChanged(agentId, status);
        
        return true;
    }
    
    /**
     * @dev Update agent details
     * @param agentId ID of the agent to update
     * @param name New name
     * @param description New description
     * @param endpoint New endpoint
     * @return success Boolean indicating if update was successful
     */
    function updateAgentDetails(
        bytes32 agentId,
        string memory name,
        string memory description,
        string memory endpoint
    ) public onlyAgentOwner(agentId) returns (bool success) {
        Agent storage agent = agents[agentId];
        
        agent.name = name;
        agent.description = description;
        agent.endpoint = endpoint;
        agent.updatedAt = block.timestamp;
        
        emit AgentUpdated(agentId);
        
        return true;
    }
    
    /**
     * @dev Get agent details
     * @param agentId ID of the agent
     * @return owner Agent owner address
     * @return name Agent name
     * @return description Agent description
     * @return endpoint Agent endpoint
     * @return status Agent status
     * @return reputation Agent reputation
     */
    function getAgentDetails(
        bytes32 agentId
    ) public view returns (
        address owner,
        string memory name,
        string memory description,
        string memory endpoint,
        AgentStatus status,
        uint256 reputation
    ) {
        Agent storage agent = agents[agentId];
        
        return (
            agent.owner,
            agent.name,
            agent.description,
            agent.endpoint,
            agent.status,
            agent.reputation
        );
    }
    
    /**
     * @dev Get agent capabilities
     * @param agentId ID of the agent
     * @return capabilities List of capabilities
     */
    function getAgentCapabilities(
        bytes32 agentId
    ) public view returns (string[] memory capabilities) {
        return agents[agentId].capabilities;
    }
    
    /**
     * @dev Get agent supported networks
     * @param agentId ID of the agent
     * @return supportedNetworks List of supported networks
     */
    function getAgentSupportedNetworks(
        bytes32 agentId
    ) public view returns (string[] memory supportedNetworks) {
        return agents[agentId].supportedNetworks;
    }
    
    /**
     * @dev Get all agent IDs
     * @return ids Array of all agent IDs
     */
    function getAllAgentIds() public view returns (bytes32[] memory) {
        return allAgentIds;
    }
    
    /**
     * @dev Get count of registered agents
     * @return count Number of registered agents
     */
    function getAgentCount() public view returns (uint256 count) {
        return allAgentIds.length;
    }
}