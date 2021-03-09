const LoginRouterComposer = require('../composers/login-router-composer')
const { adapt } = require('../adapters/expressRouterAdapter')

module.exports = router => {
  router.post('/login', adapt(LoginRouterComposer.compose()))
}
