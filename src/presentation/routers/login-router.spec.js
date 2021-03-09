const LoginRouter = require('./login-router')
const { UnauthorizedError, ServerError } = require('../errors')
const { MissingParamError, InvalidParamError } = require('../../utils/errors')

const makeSut = () => {
  const authUseCase = makeAuthUseCase()
  const emailValidator = makeEmailValidator()
  authUseCase.accessToken = 'valid_token'
  emailValidator.isEmailValid = true
  const sut = new LoginRouter({ authUseCase, emailValidator })
  return { sut, authUseCase, emailValidator }
}

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    async auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }

  return new AuthUseCaseSpy()
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth () {
      throw new Error()
    }
  }

  return new AuthUseCaseSpy()
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid (email) {
      this.email = email
      return this.isEmailValid
    }
  }
  return new EmailValidatorSpy()
}

const makeEmailValidatorWithError = () => {
  class EmailValidatorSpy {
    isValid (email) {
      throw new Error()
    }
  }
  return new EmailValidatorSpy()
}

describe('Login Router', () => {
  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 500 if no httpRequest has no body is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {}
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should call AuthUserCase with correct params', async () => {
    const { sut, authUseCase } = makeSut()
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any_password'
      }
    }
    await sut.route(httpRequest)
    expect(authUseCase.email).toBe(httpRequest.body.email)
    expect(authUseCase.password).toBe(httpRequest.body.password)
  })

  test('Should return 401 when invalid credentials are provided', async () => {
    const { sut, authUseCase } = makeSut()
    authUseCase.accessToken = null
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'invalid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('Should return 200 when valid credentials are provided', async () => {
    const { sut, authUseCase } = makeSut()
    const httpRequest = {
      body: {
        email: 'valid@email.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCase.accessToken)
  })

  test('Should return 500 if AuthUseCase throws', async () => {
    const authUseCase = makeAuthUseCaseWithError()
    const sut = new LoginRouter(authUseCase)
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidator } = makeSut()
    emailValidator.isEmailValid = false
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('Should return 500 if AuthUseCase throws', async () => {
    const authUseCase = makeAuthUseCase()
    const emailValidator = makeEmailValidatorWithError()
    const sut = new LoginRouter(authUseCase, emailValidator)
    const httpRequest = {
      body: {
        email: 'any@email.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('Should call EmailValidator with correct params', async () => {
    const { sut, emailValidator } = makeSut()
    const httpRequest = {
      body: {
        email: 'invalid@email.com',
        password: 'any_password'
      }
    }
    await sut.route(httpRequest)
    expect(emailValidator.email).toBe(httpRequest.body.email)
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const authUseCase = makeAuthUseCase()
    const suts = [].concat(
      new LoginRouter(),
      new LoginRouter({}),
      new LoginRouter({
        authUseCase: null
      }),
      new LoginRouter({
        authUseCase: invalid
      }),
      new LoginRouter({
        authUseCase,
        emailValidator: null
      }),
      new LoginRouter({
        authUseCase,
        emailValidator: invalid
      })
    )
    for (const sut of suts) {
      const httpRequest = {
        body: {
          email: 'any@email.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    }
  })
})
