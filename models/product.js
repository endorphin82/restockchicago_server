const mongoose = require("mongoose")
const Schema = mongoose.Schema
const mongooseUtils = require('mongoose/lib/utils');

const productSchema = new Schema({
  name: String,
  categoryId: String,
  price: String,
  images: [String],
  icon: String
})
// price: { type: Number, get: getPrice, set: setPrice },
// function getPrice(num) {
//   return (num / 100).toFixed(2);
// }
//
// function setPrice(num) {
//   return num * 100
// }

module.exports = mongoose.model("products", productSchema)