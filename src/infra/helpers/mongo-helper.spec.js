const MongoHelper = require('./mongo-helper')

describe('Mongo Helper', () => {
  test('Should have a valid db after connected', async () => {
    const sut = new MongoHelper()
    await sut.connect(process.env.MONGO_URL)
    expect(sut.db).toBeTruthy()
    await sut.disconnect()
  })

  test('Should have a null db after disconnected', async () => {
    const sut = new MongoHelper()
    await sut.connect(process.env.MONGO_URL)
    await sut.disconnect()
    expect(sut.db).toBeFalsy()
  })

  test('Should reconnect when getDb() is invoked and client is intentionally disconnected', async () => {
    const sut = new MongoHelper()
    await sut.connect(process.env.MONGO_URL)
    await sut.disconnect()
    await sut.getDb()
    expect(sut.db).toBeTruthy()
    await sut.disconnect()
  })

  test('Should reconnect when getDb() is invoked and client is accidentally disconnected', async () => {
    const sut = new MongoHelper()
    await sut.connect(process.env.MONGO_URL)
    await sut.client.close()
    await sut.getDb()
    expect(sut.client.isConnected()).toBeTruthy()
    await sut.disconnect()
  })
})
