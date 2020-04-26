const mongoose = require("mongoose")
const Schema = mongoose.Schema

const categorySchema = new Schema({
  _id: String,
  name: String,
  icons: [String],
  images: [String],
  parent: String,
  createdAt    : { type: Date, required: true, default: Date.now }
})

module.exports = mongoose.model("category", categorySchema)
