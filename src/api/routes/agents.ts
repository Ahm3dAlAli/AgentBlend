import express, { Request, Response } from 'express';
import { AgentRegistry } from '../../core/registry/types';
import { AgentStatus } from '../../core/types';

/**
 * Create agent router
 */
export function createAgentRouter(registry: AgentRegistry): express.Router {
  const router = express.Router();

  /**
   * Register a new agent
   */
  router.post('/register', async (req: Request, res: Response) => {
    try {
      const { name, description, owner, capabilities, supportedNetworks, endpoint, publicKey, metadata } = req.body;
      
      // Validate required fields
      if (!name || !description || !owner || !capabilities || !supportedNetworks || !endpoint || !publicKey) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      const result = await registry.registerAgent({
        name,
        description,
        owner,
        capabilities,
        supportedNetworks,
        endpoint,
        publicKey,
        metadata
      });
      
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error registering agent:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to register agent'
      });
    }
  });

  /**
   * Get agent by ID
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const agent = await registry.getAgent(id);
      
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }
      
      return res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      console.error('Error getting agent:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to get agent'
      });
    }
  });

  /**
   * Find agents by query
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { capabilities, networks, status, owner } = req.query;
      
      const query: {
        capabilities?: string[];
        networks?: string[];
        status?: AgentStatus;
        owner?: string;
      } = {};
      
      // Parse query parameters
      if (capabilities) {
        query.capabilities = Array.isArray(capabilities) 
          ? capabilities as string[] 
          : [capabilities as string];
      }
      
      if (networks) {
        query.networks = Array.isArray(networks) 
          ? networks as string[] 
          : [networks as string];
      }
      
      if (status && Object.values(AgentStatus).includes(status as AgentStatus)) {
        query.status = status as AgentStatus;
      }
      
      if (owner) {
        query.owner = owner as string;
      }
      
      const agents = await registry.findAgents(query);
      
      return res.json({
        success: true,
        data: agents
      });
    } catch (error) {
      console.error('Error finding agents:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to find agents'
      });
    }
  });

  /**
   * Update agent status
   */
  router.put('/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate status
      if (!status || !Object.values(AgentStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status'
        });
      }
      
      const agent = await registry.updateAgentStatus(id, status);
      
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }
      
      return res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      console.error('Error updating agent status:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to update agent status'
      });
    }
  });

  /**
   * Verify agent
   */
  router.post('/:id/verify', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { signature } = req.body;
      
      // Validate signature
      if (!signature) {
        return res.status(400).json({
          success: false,
          error: 'Missing signature'
        });
      }
      
      const verified = await registry.verifyAgent(id, signature);
      
      return res.json({
        success: verified,
        data: { verified }
      });
    } catch (error) {
      console.error('Error verifying agent:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to verify agent'
      });
    }
  });

  /**
   * Deregister agent
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const deregistered = await registry.deregisterAgent(id);
      
      if (!deregistered) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }
      
      return res.json({
        success: true,
        data: { deregistered }
      });
    } catch (error) {
      console.error('Error deregistering agent:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to deregister agent'
      });
    }
  });

  return router;
}