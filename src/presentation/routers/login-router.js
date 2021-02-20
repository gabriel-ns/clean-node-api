const HttpResponse = require('../helpers/http-response')
const { InvalidParamError, MissingParamError } = require('../../utils/errors')
module.exports = class LoginRouter {
  constructor (authUseCase, emailValidator) {
    this.authUseCase = authUseCase
    this.emailValidator = emailValidator
  }

  async route (httpRequest) {
    try {
      const { email, password } = httpRequest.body
      if (!email) {
        const error = new MissingParamError('email')
        return HttpResponse.badRequest(error)
      }
      if (!this.emailValidator.isValid(email)) {
        const error = new InvalidParamError('email')
        return HttpResponse.badRequest(error)
      }
      if (!password) {
        const error = new MissingParamError('password')
        return HttpResponse.badRequest(error)
      }
      const accessToken = await this.authUseCase.auth(email, password)
      if (!accessToken) {
        return HttpResponse.unauthorizedError()
      }
      return HttpResponse.ok({ accessToken })
    } catch (error) {
      return HttpResponse.serverError(error)
    }
  }
}
