const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const Screen = mongoose.model(
  "Screen",
  new mongoose.Schema({
    image: String,
    location: String,
    description: String,
    expected_impression: Number,
    screen_height: Number,
    screen_width: Number,
    price:Number
  })
);

module.exports = Screen;
