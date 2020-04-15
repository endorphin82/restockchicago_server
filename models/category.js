const mongoose = require("mongoose")
const Schema = mongoose.Schema

const categorySchema = new Schema({
  _id: String,
  name: String,
  icons: [String],
  images: [String],
  products: [String],
})

module.exports = mongoose.model("category", categorySchema)
