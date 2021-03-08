const request = require('supertest')
const app = require('../config/app')

describe('Content Type Middleware', () => {
  test('Should set JSON as content-type header by default', async () => {
    app.get('/test_content_type', (req, res) => {
      res.send('')
    })

    const response = await request(app).get('/test_content_type')
    expect(response.headers['content-type']).toMatch(/json/)
  })

  test('Should return XML as content-type header when required', async () => {
    app.get('/test_content_type_xml', (req, res) => {
      res.type('xml')
      res.send('')
    })

    const response = await request(app).get('/test_content_type_xml')
    expect(response.headers['content-type']).toMatch(/xml/)
  })
})
