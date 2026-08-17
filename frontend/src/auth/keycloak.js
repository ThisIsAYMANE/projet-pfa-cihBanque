import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8085',
  realm: 'restriction-registry',
  clientId: 'frontend-app'
});

export default keycloak;
