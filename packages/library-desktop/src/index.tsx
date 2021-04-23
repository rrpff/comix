import React from 'react'
import ReactDOM from 'react-dom'
import reportWebVitals from './reportWebVitals'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <span>hello world</span>
  </React.StrictMode>,
  document.getElementById('root')
)

if (process.env.NODE_ENV === 'development')
  reportWebVitals(console.log)
