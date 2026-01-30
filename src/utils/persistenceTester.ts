import LocalStorageManager from '../services/LocalStorageManager';
import { StorageKey } from '../types/storage';

export class PersistenceTester {
  private storage: LocalStorageManager;

  constructor() {
    this.storage = LocalStorageManager;
  }

  async testBasicPersistence(): Promise<boolean> {
    try {
      const testData = {
        theme: {
          primaryColor: '#3b82f6',
          secondaryColor: '#10b981',
        },
        timestamp: Date.now(),
      };

      await this.storage.setItem('test-persistence', testData);
      
      const retrieved = await this.storage.getItem('test-persistence');
      
      await this.storage.removeItem('test-persistence');
      
      return retrieved !== null && 
             retrieved.theme.primaryColor === testData.theme.primaryColor &&
             retrieved.timestamp === testData.timestamp;
    } catch (error) {
      console.error('Persistence test failed:', error);
      return false;
    }
  }

  async testExpiry(): Promise<boolean> {
    try {
      const testData = { message: 'This should expire' };
      
      await this.storage.setItemWithExpiry('test-expiry', testData, 1000); // 1 second
      
      const immediate = await this.storage.getItem('test-expiry');
      
      await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for expiry
      
      const expired = await this.storage.getItem('test-expiry');
      
      await this.storage.removeItem('test-expiry');
      
      return immediate !== null && expired === null;
    } catch (error) {
      console.error('Expiry test failed:', error);
      return false;
    }
  }

  async testStorageStats(): Promise<boolean> {
    try {
      const stats = await this.storage.getStats();
      
      return stats.totalSize > 0 && 
             stats.usedSize >= 0 && 
             stats.itemCount >= 0;
    } catch (error) {
      console.error('Storage stats test failed:', error);
      return false;
    }
  }

  async testEventListeners(): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        let eventTriggered = false;
        
        const listener = () => { eventTriggered = true; };
        
        this.storage.addEventListener('test-events', listener);
        
        await this.storage.setItem('test-events', { test: true });
        
        setTimeout(() => {
          this.storage.removeEventListener('test-events', listener);
          this.storage.removeItem('test-events');
          resolve(eventTriggered);
        }, 100);
        
      } catch (error) {
        console.error('Event listener test failed:', error);
        resolve(false);
      }
    });
  }

  async runAllTests(): Promise<{ [key: string]: boolean }> {
    const results = {
      basicPersistence: await this.testBasicPersistence(),
      expiry: await this.testExpiry(),
      storageStats: await this.testStorageStats(),
      eventListeners: await this.testEventListeners(),
    };

    console.log('Persistence Test Results:', results);
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`Overall: ${allPassed ? 'PASSED' : 'FAILED'}`);

    return results;
  }
}

export default PersistenceTester;