const app = require('./config/app')

app.get('/api/gabs', (req, res) => {
  res.send('gabs')
})

app.listen(8080, () => console.log('server running'))
