const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
mongoose
  .connect("mongodb://localhost:27017/MyDB")
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log("failed to connect");
  });

const LogInSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  otp: String,
  otpTimestamp: Date,
  fullName: String,
  phone: String,
  mobile: String,
  address: String,
  profilePicture: String,
});

// Hash the password before saving the user model
LogInSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
LogInSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const collection = new mongoose.model("ServiceSavvyData", LogInSchema);

module.exports = collection;
