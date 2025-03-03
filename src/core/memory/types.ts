/**
 * Types for the Agent Memory Store
 */

export enum MemoryVisibility {
    PRIVATE = 'PRIVATE',   // Only accessible to the agent that created it
    SHARED = 'SHARED',     // Accessible to specific agents
    PUBLIC = 'PUBLIC'      // Accessible to all agents
  }
  
  export interface MemoryEntry {
    id: string;
    agentId: string;
    key: string;
    value: any;
    visibility: MemoryVisibility;
    sharedWith?: string[];  // Array of agent IDs for SHARED visibility
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
  }
  
  export interface StoreMemoryRequest {
    agentId: string;
    key: string;
    value: any;
    visibility: MemoryVisibility;
    sharedWith?: string[];
    metadata?: Record<string, any>;
    expiresAt?: Date;
  }
  
  export interface MemoryQuery {
    agentId?: string;
    key?: string;
    visibility?: MemoryVisibility;
    sharedWith?: string;
  }
  
  export interface AgentMemoryStore {
    store(request: StoreMemoryRequest): Promise<MemoryEntry>;
    retrieve(agentId: string, key: string): Promise<MemoryEntry | null>;
    query(query: MemoryQuery): Promise<MemoryEntry[]>;
    update(id: string, value: any, metadata?: Record<string, any>): Promise<MemoryEntry | null>;
    delete(id: string): Promise<boolean>;
  }