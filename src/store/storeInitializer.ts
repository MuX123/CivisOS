import { store, rehydrate } from './index';

export async function initializeStore(): Promise<void> {
  try {
    const persistedState = await rehydrate();
    
    if (Object.keys(persistedState).length > 0) {
      // Dispatch actions to rehydrate each slice with persisted data
      for (const [sliceName, sliceData] of Object.entries(persistedState)) {
        if (sliceData && typeof sliceData === 'object') {
          // Find the corresponding action type for rehydration
          const actionType = `${sliceName}/rehydrate`;
          
          try {
            store.dispatch({
              type: actionType,
              payload: sliceData,
            });
          } catch (error) {
            console.warn(`Failed to rehydrate ${sliceName} slice:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to initialize store with persisted data:', error);
  }
}

// Hook for components to ensure store is initialized
export function useStoreInitialization(): void {
  // This would typically be called in a root component
  // For now, we'll rely on the initialization call in main.tsx
}