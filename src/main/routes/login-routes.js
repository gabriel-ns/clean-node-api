const loginRouter = require('../composers/login-router-composer')
const ExpressRouterAdapter = require('../adapters/expressRouterAdapter')

module.exports = router => {
  router.post('/login', ExpressRouterAdapter.adapt(loginRouter))
}
