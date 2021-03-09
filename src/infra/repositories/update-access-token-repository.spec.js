
const { MissingParamError } = require('../../utils/errors/index')
const MongoHelper = require('../helpers/mongo-helper')
const UpdateAccessTokenRepository = require('./update-access-token-repository')
let db
let createdUserId

const makeSut = () => {
  const sut = new UpdateAccessTokenRepository()
  return sut
}

describe('UpdateAccessToken repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
    db = await MongoHelper.getDb()
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany()
    const userModel = db.collection('users')
    const createdUser = await userModel.insertOne({
      email: 'valid@email.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'any_password'
    })
    createdUserId = createdUser.ops[0]._id
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('Should update the user with the given accessToken', async () => {
    const sut = makeSut()
    await sut.update(createdUserId, 'valid_token')
    const updatedFakeUser = await db.collection('users').findOne({ _id: createdUserId })
    expect(updatedFakeUser.accessToken).toBe('valid_token')
  })

  test('Should throw if no params are provided', async () => {
    const sut = makeSut()
    await expect(sut.update()).rejects.toThrow(new MissingParamError('userId'))
    await expect(sut.update(createdUserId)).rejects.toThrow(new MissingParamError('accessToken'))
  })
})
