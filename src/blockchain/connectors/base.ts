/**
 * Base interface for blockchain connectors
 */
export interface BlockchainConnector {
    /**
     * Get the name of the blockchain
     */
    getName(): string;
    
    /**
     * Connect to the blockchain
     */
    connect(): Promise<boolean>;
    
    /**
     * Check if connected to the blockchain
     */
    isConnected(): boolean;
    
    /**
     * Disconnect from the blockchain
     */
    disconnect(): Promise<void>;
    
    /**
     * Submit a transaction to the blockchain
     */
    submitTransaction(transaction: any): Promise<string>;
    
    /**
     * Get the status of a transaction
     */
    getTransactionStatus(txHash: string): Promise<TransactionStatus>;
    
    /**
     * Get account balance
     */
    getBalance(address: string): Promise<{
      amount: string;
      symbol: string;
    }>;
  }
  
  /**
   * Transaction status
   */
  export enum TransactionStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    FAILED = 'FAILED'
  }