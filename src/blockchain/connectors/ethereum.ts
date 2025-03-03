import { ethers } from 'ethers';
import { BlockchainConnector, TransactionStatus } from './base';

/**
 * Ethereum Blockchain Connector
 */
export class EthereumConnector implements BlockchainConnector {
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private rpcUrl: string;
  private privateKey?: string;
  
  constructor(rpcUrl: string, privateKey?: string) {
    this.rpcUrl = rpcUrl;
    this.privateKey = privateKey;
  }
  
  /**
   * Get the name of the blockchain
   */
  getName(): string {
    return 'ethereum';
  }
  
  /**
   * Connect to the Ethereum blockchain
   */
  async connect(): Promise<boolean> {
    try {
      this.provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
      
      // Test connection
      await this.provider.getNetwork();
      
      // If private key is provided, create a wallet
      if (this.privateKey) {
        this.wallet = new ethers.Wallet(this.privateKey, this.provider);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Ethereum:', error);
      this.provider = null;
      this.wallet = null;
      return false;
    }
  }
  
  /**
   * Check if connected to the blockchain
   */
  isConnected(): boolean {
    return this.provider !== null;
  }
  
  /**
   * Disconnect from the blockchain
   */
  async disconnect(): Promise<void> {
    this.provider = null;
    this.wallet = null;
  }
  
  /**
   * Submit a transaction to the blockchain
   */
  async submitTransaction(transaction: any): Promise<string> {
    if (!this.provider) {
      throw new Error('Not connected to Ethereum');
    }
    
    if (!this.wallet) {
      throw new Error('No wallet available for signing transactions');
    }
    
    const tx = await this.wallet.sendTransaction(transaction);
    return tx.hash;
  }
  
  /**
   * Get the status of a transaction
   */
  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    if (!this.provider) {
      throw new Error('Not connected to Ethereum');
    }
    
    const tx = await this.provider.getTransaction(txHash);
    
    if (!tx) {
      return TransactionStatus.PENDING;
    }
    
    if (!tx.blockNumber) {
      return TransactionStatus.PENDING;
    }
    
    const receipt = await this.provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return TransactionStatus.PENDING;
    }
    
    return receipt.status === 1 
      ? TransactionStatus.CONFIRMED 
      : TransactionStatus.FAILED;
  }
  
  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<{
    amount: string;
    symbol: string;
  }> {
    if (!this.provider) {
      throw new Error('Not connected to Ethereum');
    }
    
    const balance = await this.provider.getBalance(address);
    
    return {
      amount: ethers.utils.formatEther(balance),
      symbol: 'ETH'
    };
  }
}