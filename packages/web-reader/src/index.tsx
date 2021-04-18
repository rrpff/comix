import React from 'react'
import ReactDOM from 'react-dom'
import reportWebVitals from './reportWebVitals'
import './index.css'

const App = () => <span>hello world</span>

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

if (process.env.NODE_ENV === 'development')
  reportWebVitals(console.log)
