import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import './index.css';

// Get preloaded state from localStorage if available
const preloadedState = {
  auth: { 
    user: JSON.parse(localStorage.getItem('user')) || null 
  }
};

// Create a Redux reducer for authentication
const authReducer = (state = { user: null }, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
};

// Create Redux store with error handling
let store;
try {
  store = configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState
  });

  // Subscribe to store changes to sync with localStorage
  store.subscribe(() => {
    const { user } = store.getState().auth;
    localStorage.setItem('user', JSON.stringify(user));
  });
} catch (error) {
  console.error('Failed to create Redux store:', error);
  // Fallback store with just the initial state
  store = configureStore({
    reducer: { auth: (state = preloadedState.auth) => state }
  });
}

// Check if the root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  // Create a root element if it doesn't exist
  const rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
  console.warn('Root element was missing and has been created.');
}

// Use createRoot API with proper error handling
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render React application:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h2>Application Error</h2>
      <p>Sorry, there was a problem loading the application. Please try refreshing the page.</p>
    </div>
  `;
}
