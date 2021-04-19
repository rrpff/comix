const path = require('path')
const express = require('express')
const cors = require('cors')

const FIXTURES_PATH = path.join(__dirname, 'dev', 'fixtures')
const PORT = 9001

const app = express()

app.use(cors())
app.use('/fixtures', express.static(FIXTURES_PATH))

app.listen(PORT, () => {
  console.log(`Story Server is running on http://localhost:${PORT}`)
})
