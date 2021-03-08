
const { MissingParamError } = require('../../utils/errors/index')
const MongoHelper = require('../helpers/mongo-helper')
let db

class UpdateAccessTokenRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async update (userId, accessToken) {
    if (!userId) {
      throw new MissingParamError('userId')
    }
    if (!accessToken) {
      throw new MissingParamError('accessToken')
    }
    await this.userModel.updateOne({
      _id: userId
    }, {
      $set: {
        accessToken
      }
    })
  }
}

const makeSut = () => {
  const userModel = db.collection('users')
  const sut = new UpdateAccessTokenRepository(userModel)
  return {
    userModel,
    sut
  }
}

describe('UpdateAccessToken repository', () => {
  const mongoHelper = new MongoHelper()

  beforeAll(async () => {
    await mongoHelper.connect(process.env.MONGO_URL)
    db = await mongoHelper.getDb()
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany()
  })

  afterAll(async () => {
    await mongoHelper.disconnect()
  })

  test('Should update the user with the given accessToken', async () => {
    const { sut, userModel } = makeSut()
    const createdUser = await userModel.insertOne({
      email: 'valid@email.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'any_password'
    })
    const userId = createdUser.ops[0]._id
    await sut.update(userId, 'valid_token')
    const updatedFakeUser = await userModel.findOne({ _id: userId })
    expect(updatedFakeUser.accessToken).toBe('valid_token')
  })

  test('Should throw if no userModel is provided', async () => {
    const sut = new UpdateAccessTokenRepository()
    const userModel = db.collection('users')
    const createdUser = await userModel.insertOne({
      email: 'valid@email.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'any_password'
    })
    const userId = createdUser.ops[0]._id
    const promise = sut.update(userId, 'any_token')
    await expect(promise).rejects.toThrow()
  })

  test('Should throw if no params are provided', async () => {
    const { sut, userModel } = makeSut()
    const createdUser = await userModel.insertOne({
      email: 'valid@email.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'any_password'
    })
    const userId = createdUser.ops[0]._id
    await expect(sut.update()).rejects.toThrow(new MissingParamError('userId'))
    await expect(sut.update(userId)).rejects.toThrow(new MissingParamError('accessToken'))
  })
})
