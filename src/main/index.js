const MongoHelper = require('../infra/helpers/mongo-helper')
const env = require('./config/env')

const mongoHelper = new MongoHelper()

mongoHelper.connect(env.mongoUrl)
  .then(() => {
    const app = require('./config/app')
    app.listen(8080, () => console.log('server running'))
  })
  .catch(console.error)
