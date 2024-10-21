const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose
  .connect("mongodb://localhost:27017/MyDB")
  .then(() => {
    console.log("mongodb user connected");
  })
  .catch(() => {
    console.log("failed to connect");
  });
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
