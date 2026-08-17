import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'
import keycloak from './auth/keycloak'
import axios from 'axios'

keycloak.init({ onLoad: 'login-required', checkLoginIframe: false }).then(authenticated => {
  if (!authenticated) {
    window.location.reload();
  } else {
    // Intercepter toutes les requêtes pour rafraîchir le token si nécessaire (avant son expiration)
    axios.interceptors.request.use(async (config) => {
      try {
        await keycloak.updateToken(30); // Rafraîchit si le token expire dans moins de 30 secondes
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } catch (error) {
        console.error(error);
        keycloak.login(); // Rediriger vers login si le rafraîchissement échoue (session expirée)
      }
      return config;
    });

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  }
}).catch(console.error);
