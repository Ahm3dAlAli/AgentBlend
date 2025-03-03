import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Middleware for validating request body
 */
export function validateBody(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.message}`
      });
    }
    
    next();
  };
}

/**
 * Middleware for validating query parameters
 */
export function validateQuery(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.message}`
      });
    }
    
    next();
  };
}

/**
 * Middleware for validating route parameters
 */
export function validateParams(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.message}`
      });
    }
    
    next();
  };
}

/**
 * Common validation schemas
 */
export const schemas = {
  // UUID validation
  id: Joi.string().uuid().required(),
  
  // Agent registration schema
  agentRegistration: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    owner: Joi.string().required(),
    capabilities: Joi.array().items(Joi.string()).required(),
    supportedNetworks: Joi.array().items(Joi.string()).required(),
    endpoint: Joi.string().uri().required(),
    publicKey: Joi.string().required(),
    metadata: Joi.object().optional()
  }),
  
  // Task creation schema
  taskCreation: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    creator: Joi.string().required(),
    workflow: Joi.object({
      steps: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        agentRequirements: Joi.object({
          capabilities: Joi.array().items(Joi.string()).required(),
          networks: Joi.array().items(Joi.string()).optional()
        }).required(),
        input: Joi.object().allow(null).optional(),
        dependsOn: Joi.array().items(Joi.string()).required()
      })).required()
    }).required(),
    budget: Joi.object({
      amount: Joi.string().required(),
      token: Joi.string().required()
    }).optional(),
    deadline: Joi.date().iso().optional()
  })
};