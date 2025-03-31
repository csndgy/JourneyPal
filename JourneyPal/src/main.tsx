import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId='657605945054-cqvc0348b99aijcf5f2oet9ud7n4efkj.apps.googleusercontent.com'>
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>,
)
