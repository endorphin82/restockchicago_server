const mongoose = require("mongoose")
const Schema = mongoose.Schema

const categorySchema = new Schema({
  _id: String,
  name: String,
  icons: [String],
  images: [String],
  parent: String
    // https://docs.mongodb.com/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/
  // products: [String],
})

module.exports = mongoose.model("category", categorySchema)
