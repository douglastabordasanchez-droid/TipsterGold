import React from 'react'
import ReactDOM from 'react-dom/client'
import Blog from './Blog'
import ErrorBoundary from './ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Blog />
    </ErrorBoundary>
  </React.StrictMode>,
)
