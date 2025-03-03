import { v4 as uuidv4 } from 'uuid';
import {
  AgentMemoryStore,
  MemoryEntry,
  StoreMemoryRequest,
  MemoryQuery,
  MemoryVisibility
} from './types';

/**
 * In-memory implementation of the Agent Memory Store
 * For production, this would be backed by a database and distributed storage
 */
export class InMemoryAgentMemoryStore implements AgentMemoryStore {
  private entries: Map<string, MemoryEntry> = new Map();
  
  /**
   * Store a new memory entry
   */
  async store(request: StoreMemoryRequest): Promise<MemoryEntry> {
    const id = uuidv4();
    const now = new Date();
    
    const entry: MemoryEntry = {
      id,
      agentId: request.agentId,
      key: request.key,
      value: request.value,
      visibility: request.visibility,
      sharedWith: request.sharedWith,
      metadata: request.metadata || {},
      createdAt: now,
      updatedAt: now,
      expiresAt: request.expiresAt
    };
    
    // Check if entry already exists with the same agent ID and key
    for (const existingEntry of this.entries.values()) {
      if (existingEntry.agentId === request.agentId && existingEntry.key === request.key) {
        // Update the existing entry
        const updatedEntry: MemoryEntry = {
          ...existingEntry,
          value: request.value,
          visibility: request.visibility,
          sharedWith: request.sharedWith,
          metadata: {
            ...existingEntry.metadata,
            ...request.metadata
          },
          updatedAt: now,
          expiresAt: request.expiresAt
        };
        
        this.entries.set(existingEntry.id, updatedEntry);
        return updatedEntry;
      }
    }
    
    // Store the new entry
    this.entries.set(id, entry);
    return entry;
  }
  
  /**
   * Retrieve a memory entry by agent ID and key
   */
  async retrieve(agentId: string, key: string): Promise<MemoryEntry | null> {
    // Clean up expired entries
    this.cleanupExpiredEntries();
    
    for (const entry of this.entries.values()) {
      if (entry.agentId === agentId && entry.key === key) {
        return entry;
      }
    }
    
    return null;
  }
  
  /**
   * Query memory entries based on criteria
   */
  async query(query: MemoryQuery): Promise<MemoryEntry[]> {
    // Clean up expired entries
    this.cleanupExpiredEntries();
    
    const result: MemoryEntry[] = [];
    
    for (const entry of this.entries.values()) {
      let matches = true;
      
      // Filter by agent ID
      if (query.agentId && entry.agentId !== query.agentId) {
        // If entry is not owned by the querying agent, check if it's accessible
        if (
          entry.visibility === MemoryVisibility.PRIVATE ||
          (entry.visibility === MemoryVisibility.SHARED && 
           !entry.sharedWith?.includes(query.agentId))
        ) {
          matches = false;
        }
      }
      
      // Filter by key
      if (query.key && entry.key !== query.key) {
        matches = false;
      }
      
      // Filter by visibility
      if (query.visibility && entry.visibility !== query.visibility) {
        matches = false;
      }
      
      // Filter by shared with
      if (query.sharedWith && 
          entry.visibility === MemoryVisibility.SHARED && 
          !entry.sharedWith?.includes(query.sharedWith)) {
        matches = false;
      }
      
      if (matches) {
        result.push(entry);
      }
    }
    
    return result;
  }
  
  /**
   * Update a memory entry
   */
  async update(
    id: string, 
    value: any, 
    metadata?: Record<string, any>
  ): Promise<MemoryEntry | null> {
    const entry = this.entries.get(id);
    
    if (!entry) {
      return null;
    }
    
    const updatedEntry: MemoryEntry = {
      ...entry,
      value,
      metadata: metadata ? { ...entry.metadata, ...metadata } : entry.metadata,
      updatedAt: new Date()
    };
    
    this.entries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  /**
   * Delete a memory entry
   */
  async delete(id: string): Promise<boolean> {
    if (!this.entries.has(id)) {
      return false;
    }
    
    this.entries.delete(id);
    return true;
  }
  
  /**
   * Clean up expired entries
   */
  private cleanupExpiredEntries() {
    const now = new Date();
    
    for (const [id, entry] of this.entries.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        this.entries.delete(id);
      }
    }
  }
}