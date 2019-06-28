const express = require('express')
const app = express()
const fs = require('fs')

const port = 3005

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST')
  next()
})

const dataLocation = './data'
const dataFilename = () => `${dataLocation}/datafile.json`

const readDataFile = () => JSON.parse(fs.readFileSync(dataFilename()))
const writeDataFile = json => fs.writeFileSync(dataFilename(), JSON.stringify(json))

app.get('/load', (request, response) => response.send(readDataFile()))

app.post('/save', (request, response) => {
  console.log('saving', request.body)
  writeDataFile(request.body)
  response.status(200).end()
})

app.listen(port, (err) => {
  if (err) return console.log('ERROR: ', err)
  console.log(`data server listening on ${port}`)
})
