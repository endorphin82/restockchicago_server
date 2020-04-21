const express = require("express")
const graphqlHTTP = require("express-graphql")
const schema = require("../schema/schema")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3005
const HOST = process.env.HOST || "http://localhost"
const MONGO_URL =  process.env.MONGO_URL || "mongodb://localhost:27017/restockchicago"

const logData = (req, res, next) => {
  const originalSend = res.send
  res.send = function (data) {
    console.info(data)

    originalSend.call(res, data)

    // originalSend.bind(res, data)()
    // originalSend(data);
  }
  next()
}

app.use([cors(), logData])

mongoose.connect(MONGO_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
)

const dbConnection = mongoose.connection
dbConnection.on("error", (err) => {
  console.log(`Connection error: ${err}`)
})

dbConnection.once("open", () => {
  console.log("Connected to DB")
})

app.listen(PORT, (err) => {
  err
    ? console.log(err)
    : console.log(
        `Mongo Server ${MONGO_URL} The server is running at ${HOST}:${PORT}/graphql`
      )
})