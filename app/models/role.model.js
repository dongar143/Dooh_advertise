const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const Role = mongoose.model(
  "Role",
  new mongoose.Schema({
    name: String
  })
);

module.exports = Role;
