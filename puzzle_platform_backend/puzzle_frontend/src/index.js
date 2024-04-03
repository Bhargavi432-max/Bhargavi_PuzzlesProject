import { StrictMode } from 'react' // <--- if you want to stop double rendering even while in development remove this
import { createRoot } from 'react-dom/client'

import App from './App'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)

root.render(
  //   <StrictMode>
  <App />
  //   </StrictMode>
)
