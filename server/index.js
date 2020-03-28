const MONGO_URL = require("../keys").MONGO_URL

const express = require("express")
const graphqlHTTP = require("express-graphql")
const schema = require("../schema/schema")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3005
const _MONGO_URL = process.env.MONGO_URL || MONGO_URL

mongoose.connect(_MONGO_URL, {useNewUrlParser: true})

if (process.env.NODE_ENV === 'production') {
  app.use()
} else {
  app.use(cors())
}

// app.use(cors())

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}))

const dbConnection = mongoose.connection;
dbConnection.on("error", err => {
  console.log(`Connection error: ${err}`)
})

dbConnection.once("open", () => {
  console.log("Connected to DB")
})

app.listen(PORT, err => {
  err ? console.log(err) : console.log(`The server is running at http://localhost:${PORT}/graphql`)
})