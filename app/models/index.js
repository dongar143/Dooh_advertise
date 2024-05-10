const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.screen = require("./screen.model");

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;