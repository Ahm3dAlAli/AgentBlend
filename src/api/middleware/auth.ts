import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';

/**
 * Simple authentication middleware using an API key
 * For a production system, this would be more robust
 */
export function apiKeyAuth(apiKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const providedKey = req.headers['x-api-key'];
    
    if (!providedKey || providedKey !== apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid API key'
      });
    }
    
    next();
  };
}

/**
 * Ethereum signature-based authentication
 * Validates requests are signed by the specified address
 */
export function ethSignatureAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { signature, address, message } = req.headers;
      
      // Only check routes that require authentication
      if (req.path.includes('/admin') || req.method !== 'GET') {
        if (!signature || !address || !message) {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized: Missing authentication parameters'
          });
        }
        
        // Verify the signature
        try {
          const messageHash = ethers.utils.hashMessage(message as string);
          const recoveredAddress = ethers.utils.recoverAddress(
            messageHash, 
            signature as string
          );
          
          if (recoveredAddress.toLowerCase() !== (address as string).toLowerCase()) {
            return res.status(401).json({
              success: false,
              error: 'Unauthorized: Invalid signature'
            });
          }
          
          // Attach the verified address to the request
          req.headers['verified-address'] = recoveredAddress;
        } catch (error) {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized: Invalid signature format'
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Authentication error'
      });
    }
  };
}