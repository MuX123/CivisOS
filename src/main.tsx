import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import { store } from './store'
import { initializeStore } from './store/storeInitializer'
import App from './App.tsx'

// Initialize store with persisted data before rendering
initializeStore().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>
    </React.StrictMode>,
  )
}).catch(error => {
  console.error('Failed to initialize app:', error);
  // Fallback rendering without persisted data
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>
    </React.StrictMode>,
  )
});