const MongoHelper = require('../infra/helpers/mongo-helper')
const app = require('./config/app')
const env = require('./config/env')

const mongoHelper = new MongoHelper()
  .then(() => {
    mongoHelper.connect(env.mongoUrl)
    app.listen(8080, () => console.log('server running'))
  })
  .catch(console.error)
