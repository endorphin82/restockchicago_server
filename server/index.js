const MONGO_URL = require("../keys").MONGO_URL

const express = require("express")
const graphqlHTTP = require("express-graphql")
const schema = require("../schema/schema")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 3005
const _MONGO_URL = process.env.MONGO_URL || MONGO_URL

let demoLogger = (req, res, next) => {
  let originalSend = res.send;
    res.send = function (data) {
        console.info(data);
        originalSend.apply(res, Array.from(arguments));
    }
    next();
}

// if (process.env.NODE_ENV === 'production') {
// console.log("NODE_ENV", process.env.NODE_ENV)
// } else {
app.use([cors(), demoLogger])

// app.use(httpLogger);
// }

mongoose.connect(_MONGO_URL, { useNewUrlParser: true })

// app.use(cors())

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
        `Mongo Sever ${MONGO_URL} The server is running at http://localhost:${PORT}/graphql`
      )
})
