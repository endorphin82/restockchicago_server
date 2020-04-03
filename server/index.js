const express = require("express")
const graphqlHTTP = require("express-graphql")
const schema = require("../schema/schema")
const mongoose = require("mongoose")
const cors = require("cors")
// const MONGO_URL = require("../keys").MONGO_URL
// const PORT = require("../keys").PORT

const app = express()
const PORT = process.env.PORT || 3005
const _MONGO_URL = process.env.MONGO_URL
console.log("process.env.NODE_ENV",process.env.NODE_ENV)
console.log("process.env.MONGO_URL",process.env.MONGO_URL)

// logging all data in console
const logData = (req, res, next) => {
  const originalSend = res.send
  res.send = function(data) {
    console.info(data)

    originalSend.call(res, data)
    
    // originalSend.bind(res, data)()
    // originalSend(data);
  }
  next()
}

app.use([cors(), logData])

mongoose.connect(_MONGO_URL, { useNewUrlParser: true })

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true
  })
)

const dbConnection = mongoose.connection
dbConnection.on("error", err => {
  console.log(`Connection error: ${err}`)
})

dbConnection.once("open", () => {
  console.log("Connected to DB")
})

app.listen(PORT, err => {
  err
    ? console.log(err)
    : console.log(
        `Mongo Server ${_MONGO_URL} The server is running at http://localhost:${PORT}/graphql`
      )
})
