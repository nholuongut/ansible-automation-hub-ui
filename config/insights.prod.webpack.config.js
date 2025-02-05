const webpackBase = require('./webpack.base.config');

// Compile configuration for deploying to insights
module.exports = webpackBase({
  API_HOST: '',
  API_BASE_PATH: '/api/automation-hub/',
  PULP_API_BASE_PATH: '/api/automation-hub/pulp/api/v3/',
  UI_BASE_PATH: '',
  DEPLOYMENT_MODE: 'insights',
  NAMESPACE_TERM: 'partners',
  UI_USE_HTTPS: false,
  UI_DEBUG: false,
  TARGET_ENVIRONMENT: 'prod',
  APPLICATION_NAME: 'Automation Hub',
  USE_FAVICON: false,
});
