
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppRoutes from './app'; // Import the updated Routes component
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
