if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//   res.sendFile(__dirname + "/views/index.html"); want to use html

const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const Forum = require("./public/js/forum")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const collection = require("./public/js/mongods");
const initializePassport = require("./public/js/passport");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const nodemailer = require("nodemailer");
const { log } = require("console");
const multer = require("multer");
const { name } = require("ejs");
const LocalStrategy = require('passport-local').Strategy;
const OpenAI = require("openai");
const router = express.Router();
//const Project = require('./models/Project'); // Adjust the path to your Project model
//const User = require('./models/User'); // Adjust the path to your User model
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
const Review = require('./public/js/reviews'); // Import the Review model
const HelpdeskTicket = require("./public/js/HelpdeskTicket"); // Import the HelpdeskTicket model

const JWT_SECRET = "2jkeu2oi3o5o4nfsdkfsgweklu32jor";

app.set("view engine", "ejs");

app.use('/public', express.static(path.join(__dirname, 'public')));

// Function to get user by email
const getUserByEmail = async (email) => {
  try {
    return await collection.findOne({ email: email });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Function to get user by ID
const getUserById = async (id) => {
  try {
    return await collection.findById(id);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  try {
      const user = await getUserById(id);
      done(null, user);
  } catch (err) {
      done(err);
  }
});

initializePassport(passport, getUserByEmail, getUserById);

const users = [];
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false,
    cookie: {secure: false}
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// router
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.get("/home", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.sendFile(__dirname + "/views/home.html");
});

app.get("/service", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.sendFile(__dirname + "/views/service.html");
});

app.get("/project-listing", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.sendFile(__dirname + "/views/project-listing.html");
});

app.get("/forum", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.sendFile(__dirname + "/views/forum.html");
});

app.get("/addforum", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "views", "addforum.html"));
});

app.get("/view-detailed-forum", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "views", "view-detailed-forum.html"));
});
app.get("/FAQ", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.sendFile(__dirname + "/views/FAQ.html");
});
app.get("/live_chat.html", (req, res) => {
  res.sendFile(__dirname + "/html/live_chat.html");
});
app.get("/FAQ.html", (req, res) => {
  res.sendFile(__dirname + "/views/FAQ.html");
});
app.get("/HelpDesk.html", (req, res) => {
  res.sendFile(__dirname + "/html/HelpDesk.html");
});

app.get("/profile_with_data_and_skills", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  const user = await collection.findById(req.user.id).exec();
  res.render("profile", { user });
});

app.get("/forgot_pass", (req, res) => {
  res.render("forgot_pass.ejs");
});

app.get("/otp", (req, res) => {
  res.render("otp", { email: userEmail });
});

app.get("/reset", (req, res) => {
  res.render("reset-password");
});

app.get("/edit_profile", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  const user = await collection.findById(req.user.id);
  res.render("edit_profile", { user });
});

app.get("/project-listing-detailed-view", (req, res) => {
  res.render('project-listing-detailed-view.ejs')});


// Reviews functionality
app.get('/reviews/:serviceId', async (req, res) => {
  const { serviceId } = req.params;
  const { rating, date } = req.query;
  const filters = {};

  if (rating && rating !== 'all') {
    filters.rating = parseInt(rating);
  }
  
  if (date) {
    filters.date = { $gte: new Date(date) };
  }

  try {
    const reviews = await Review.find({ serviceId, ...filters });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to post a review
app.post('/reviews', async (req, res) => {
  try {
    const { name, serviceId, rating, comment } = req.body;
    const newReview = new Review({ name, serviceId, rating, comment });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to update a review
app.put('/reviews/:id', async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedReview) return res.status(404).json({ error: 'Review not found' });
    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to delete a review
app.delete('/reviews/:id', async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Services functionality

app.set('views', path.join(__dirname, 'views'));
app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'service.html'));
});


const Service = require('./public/js/Service');


app.get('/api/services', async (req, res) => {
  try {
    const { search, category, page } = req.query;
    const pageSize = 9; // Number of services per page

    let filter = {};

    if (search) {
      const searchWords = search.split(' ').map(word => `(?=.*${word})`).join('');
      const searchRegex = new RegExp(searchWords, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    if (category) {
      const categoryRegex = new RegExp(category.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      filter.category = categoryRegex;
    }

    const query = Service.find(filter);

    if (page) {
      const pageNumber = parseInt(page) || 1;
      const skip = (pageNumber - 1) * pageSize;
      query.skip(skip).limit(pageSize);
    }

    const services = await query.exec();
    const totalServices = await Service.countDocuments(filter).exec();
    const totalPages = Math.ceil(totalServices / pageSize);

    res.json({ services, totalPages });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MyDB', { useNewUrlParser: true, useUnifiedTopology: true });

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    freelancerName: { type: String, required: true },
    freelancerEmail: { type: String, required: true },
    freelancerPhone: { type: String, required: true },
    freelancerLocation: { type: String, required: true },
    ordercompleted: { type: Number, required: true },
});

app.post('/api/forum', async (req, res) => {
  try {
    const { title, description } = req.body;
    // Validate inputs
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    // Save forum to MongoDB
    const forum = new Forum({ title, description });
    await forum.save();
    // Get all users
    const users = await User.find({}, 'email');
    // Send email notification to each user
    users.forEach(user => {
      sendEmail(user.email, title);
    });
    res.status(201).json(forum);
  } catch (error) {
    console.error('Error adding forum:', error);
    res.status(500).json({ error: 'Failed to add forum', details: error.message });
  }
});
app.get('/api/forum', async (req, res) => {
  try {
    const forums = await Forum.find();
    res.status(200).json(forums);
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ error: 'Failed to fetch forums' });
  }
});
app.get('/api/forum/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const forum = await Forum.findById(id);
    if (!forum) {
      return res.status(404).json({ error: 'Forum not found' });
    }
    res.status(200).json(forum);
  } catch (error) {
    console.error('Error fetching forum by ID:', error);
    res.status(500).json({ error: 'Failed to fetch forum' });
  }
});

// Check if storage and upload are already defined
if (!global.storage) {
    global.storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "public/uploads/");
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        },
    });
}

if (!global.upload) {
    global.upload = multer({ storage: global.storage });
}

app.post('/api/services', global.upload.single('imageUrl'), async (req, res) => {
    try {
        const { title, description, price, freelancerName, freelancerEmail, freelancerPhone, freelancerLocation, ordercompleted } = req.body;
        const imageUrl = req.file ? req.file.path : '';

        const service = new Service({ title, description, price, imageUrl, freelancerName, freelancerEmail, freelancerPhone, freelancerLocation, ordercompleted });
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(400).json({ error: 'Service validation failed', details: error.message });
    }
});

app.put('/api/services/:id', global.upload.single('imageUrl'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, freelancerName, freelancerEmail, freelancerPhone, freelancerLocation, ordercompleted } = req.body;
        const imageUrl = req.file ? req.file.path : '';

        const service = await Service.findByIdAndUpdate(id, { title, description, price, imageUrl, freelancerName, freelancerEmail, freelancerPhone, freelancerLocation, ordercompleted }, { new: true, runValidators: true });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(400).json({ error: 'Service validation failed', details: error.message });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByIdAndDelete(id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(400).json({ error: 'Service validation failed', details: error.message });
    }
});




// Example endpoint to fetch a specific service by ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve the HTML file for service description page
app.get('/servicedesc.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'servicedesc.html'));
});

app.get('/manageservice.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'manageservice.html'));
});


// POST route for helpdesk ticket submission
app.post("/submit", async (req, res) => {
  const { name, email, priority, category, description } = req.body;

  try {
    const newTicket = new HelpdeskTicket({
      name,
      email,
      priority,
      category,
      description,
    });

    await newTicket.save();
    res.redirect('/HelpDesk.html');
  } catch (error) {
    console.error("Error submitting ticket:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: "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", // This is also the default, can be omitted
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [{ role: "user", content: userMessage }],
    });
    const botMessage = response.choices[0].message.content;
    res.json({ message: botMessage });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error connecting to OpenAI API" });
  }
});

app.get("/start-fine-tune", async (req, res) => {
  const result = await fineTuneModel();
  res.json(result);
});

async function fineTuneModel() {
  try {
    const fileUploadResponse = await openai.files.create({
      file: fs.createReadStream("dataset.jsonl"),
      purpose: "fine-tune",
    });
    const fileId = fileUploadResponse.id;
    console.log(`Uploaded file ID: ${fileId}`);

    const fineTuneResponse = await openai.fineTunes.create({
      training_file: fileId,
      model: "gpt-3.5-turbo-0125",
    });
    const fineTuneId = fineTuneResponse.id;
    console.log(`Fine-tune job ID: ${fineTuneId}`);

    let status = fineTuneResponse.status;
    while (status !== "succeeded" && status !== "failed") {
      await new Promise((r) => setTimeout(r, 10000));
      const fineTuneStatusResponse = await openai.fineTunes.retrieve(
        fineTuneId
      );
      status = fineTuneStatusResponse.status;
      console.log(`Fine-tuning status: ${status}`);
    }

    if (status === "succeeded") {
      console.log("Fine-tuning succeeded!");
      return { success: true, message: "Fine-tuning succeeded!" };
    } else {
      console.log("Fine-tuning failed.");
      return { success: false, message: "Fine-tuning failed." };
    }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error(error.status);
      console.error(error.message);
      console.error(error.code);
      console.error(error.type);
    } else {
      console.log(error);
    }
    return { success: false, message: "An error occurred during fine-tuning." };
  }
}
// send email to user

let userEmail = "user@example.com";
let generatedOTP = Math.floor(1000 + Math.random() * 9000);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "Lolsquadmemberz@gmail.com",
    pass: "xrww dtbt vync cykt",
  },
});

function sendOTP(email, otp) {
  const mailOptions = {
    from: "Lolsquadmemberz@gmail.com",
    to: email,
    subject: "Your OTP Code",
    html: `<!DOCTYPE html>
    <html lang="en" >
    <head>
      <meta charset="UTF-8">
      <title>ServiceSavvy OTP Email</title>
    
    </head>
    <body>
    <!-- partial:index.partial.html -->
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">ServiceSavvy</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Thank you for choosing ServiceSavvy. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />ServiceSavvy</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>ServiceSavvy Inc</p>
        </div>
      </div>
    </div>
    <!-- partial -->
    </body>
    </html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Email sent: " + info.response);
  });
}
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
app.post(
  "/forgot_pass",
  passport.authenticate("local", {
    successRedirect: "/login",
    failureRedirect: "/forgot_pass",
    failureFlash: true,
  })
);

// app.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     // Check if the user already exists
//     const existingUser = await collection.findOne({ email: email });
//     if (existingUser) {
//       return res.status(400).json("User already exists");
//     }

//     // Create new user with hashed password
//     const newUser = new collection({
//       id: Date.now().toString(),
//       name: name,
//       email: email,
//       password: password,
//     });

//     // Save user to the database
//     await newUser.save();

//     res.redirect("/login");
//   } catch (error) {
//     console.error(error);
//     res.status(500).json("Internal server error");
//   }
// });

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await collection.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json("User already exists");
    }

    // Create new user
    const newUser = new collection({
      name: name,
      email: email,
      password: password,
    });

    // Save user to the database
    await newUser.save();

    res.status(200).json("Registration successful! Redirecting to login...");
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error");
  }
});

//debugging
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    console.log("Authentication triggered.");
    if (err) {
      console.error(err);
      return next(err);
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error(err);
        return next(err);
      } else console.log("Authentication successful:", user);
      return res.redirect("/home");
    });
  })(req, res, next);
});

app.post("forgot_pass", (req, res) => {
  const { email } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.send({ Status: "User not existed" });
    }
    const token = jwt.sign(
      { id: user.id },
      "kjevnjenkjr349544kjfnwekj9438522rewff",
      { expiresIn: "1d" }
    );
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "youremail@gmail.com",
        pass: "yourpassword",
      },
    });

    var mailOptions = {
      from: "youremail@gmail.com",
      to: "myfriend@yahoo.com",
      subject: "Reset your password",
      text: `http://localhost:3000/reset_pass/${user.id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.send({ Status: "Success" });
      }
    });
    console.log("Authentication successful:", user);
    return res.redirect("/login");
  });
});

app.post("/send-otp", async (req, res) => {
  userEmail = req.body.email;
  const user = await collection.findOne({ email: userEmail });
  if (user && user.email === userEmail) {
    generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP and timestamp to user in database
    await collection.findOneAndUpdate(
      { email: userEmail },
      { otp: generatedOTP, otpTimestamp: Date.now() },
      { upsert: true } // Create the document if it doesn't exist
    );

    sendOTP(userEmail, generatedOTP);
    res.redirect("/otp");
  } else {
    res.send("No user with that email");
  }
});

// app.post("/verify-otp", async (req, res) => {
//   const { otp, email } = req.body;
//   console.log("Received OTP:", otp);
//   console.log("Received Email:", email);

//   try {
//     const user = await collection.findOne({ email: email });
//     console.log("User found:", user);
//     if (user && user.otp === otp && Date.now() - user.otpTimestamp < 300000) {
//       // OTP valid for 5 minutes
//       res.json({ success: true });
//     } else {
//       res.json({
//         success: false,
//         message: "Invalid or expired OTP. Please try again.",
//       });
//     }
//   } catch (err) {
//     console.error("Error verifying OTP:", err);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });
app.post("/verify-otp", async (req, res) => {
  const { otp, email } = req.body;
  console.log("Received email:", email);
  console.log("Received OTP:", otp);

  try {
    const user = await collection.findOne({ email: email });
    console.log(user);

    if (user && user.otp === otp && Date.now() - user.otpTimestamp < 300000) {
      // OTP valid for 5 minutes
      res.json({ success: true, redirect: "/reset" });
    } else {
      res.json({
        success: false,
        message: "Invalid or expired OTP. Please try again.",
      });
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { newPassword } = req.body;

  // Hash the new password before saving it
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password in the database
  await collection.findOneAndUpdate(
    { email: userEmail },
    { password: hashedPassword }
  );

  console.log(`Password has been reset to: ${newPassword}`);
  res.render("confirmation");
});

// Route to handle profile update
app.post("/update_profile", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  const { fullName, email, phone, mobile, address } = req.body;

  try {
    await collection.findByIdAndUpdate(req.user.id, {
      fullName,
      email,
      phone,
      mobile,
      address,
    });

    req.flash("success", "Profile updated successfully");
    res.redirect("/profile_with_data_and_skills");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update profile");
    res.redirect("/edit_profile");
  }
});

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

app.post("/pfp_update", upload.single("profilePicture"), async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const userId = req.user.id; // Assuming user ID is available in the request object
  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const user = await collection.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.profilePicture = imageUrl;
    await user.save();

    res.json({ success: true, imageUrl: imageUrl });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating profile picture",
    });
  }
});

// Middleware to parse JSON data
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}));
//app.use(express.urlencoded({ extended: true}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/MyDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Route to serve project listing detailed view and fetch project details by id
app.get('/project-listing-detailed-view', async (req, res) => {
  const { id } = req.query;

  try {
    const project = await Project.findById(id);

    if (project) {
      res.render('project-listing-detailed-view', { project });
    } else {
      res.status(404).send('Project not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/project-edit', async (req, res) => {
  try {
      const projectId = req.query.id;
      const project = await Project.findById(projectId);
      res.render('project-edit', { project });
  } catch (err) {
      res.status(500).send('Error fetching project details');
  }
});


// Schema for the project listing data
const projectSchema = new mongoose.Schema({
  name: String,
  overview: String,
  requirements: String,
  budget: Number,
  email: String,
  phone: String,
  completionDate: Date,
  contractor: String
});

// Model based on schema
const Project = mongoose.model('Project', projectSchema);

// Schema for user data
const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String
});

// Model for User
// Model for User
let User;
try {
  User = mongoose.model('User');
} catch (error) {
  const userSchema = new mongoose.Schema({
    email: String,
    // Add more fields as needed
  });
  User = mongoose.model('User', userSchema);
}

// Initialize session
// app.use(session({
//  secret: 'jkafbaskassdsdsds',
//  resave: false,
//  saveUninitialized: true
// }));

// app.post('/login', async (req, res) => {
//  try {
//      const { email, password } = req.body;
//      const user = await User.findOne({ email, password });
//
//      if (user) {
//          req.session.userId = user._id;
 //         console.log(`User ID set in session: ${req.session.userId}`); // Log user ID
//          res.redirect('/my-projects.html');
//      } else {
//          res.status(401).send('Invalid credentials');
//      }
//  } catch (err) {
//      console.error('Login error:', err);
//      res.status(500).send('Internal Server Error');
//  }
//});


// Serve static files from the 'public' directory
// app.use(express.static('public'));

// Route to handle form submission
app.post('/submit-project', async (req, res) => {
  try {
      if (!req.isAuthenticated()) {
          return res.status(401).send('User not authenticated');
      }
      
      const userId = req.user._id;
      console.log(`User ID from session: ${userId}`); // Log the user ID

      const user = await getUserById(userId);
      console.log(`User fetched from DB: ${user}`); // Log the user data

      if (!user) {
          return res.status(404).send('User not found');
      }

      const newProject = new Project({
          name: req.body.name,
          overview: req.body.overview,
          requirements: req.body.requirements,
          budget: req.body.budget,
          email: user.email, // Use email from user data
          phone: req.body.phone,
          completionDate: req.body.completionDate
      });

      await newProject.save();

      res.send('<script>alert("Project submitted successfully!"); window.location.href = "/my-projects.html";</script>');
  } catch (err) {
      console.error('Error submitting project data:', err);
      res.status(500).send('Internal Server Error');
  }
});

// Route to fetch all projects
app.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).send('Error fetching projects: ' + error.message);
  }
});

// Ensure this part is in your server.js
app.get('/projects/:id', async (req, res) => {
  try {
      const project = await Project.findById(req.params.id);
      if (project) {
          res.json(project);
      } else {
          res.status(404).send('Project not found');
      }
  } catch (err) {
      res.status(500).send(err);
  }
});

// Display projects uploaded by user fetch using their email
app.get('/my-projects', async (req, res) => {
  if (!req.isAuthenticated()) {
      return res.redirect('/login');
  }

  const userEmail = req.user.email; // Fetch the email from the authenticated user

  try {
      const projects = await Project.find({ email: userEmail });
      console.log('Fetched projects:', projects); // Debug log to check the fetched projects
      res.render('my-projects', { projects: projects });
  } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching projects");
  }
});

// Route to fetch project details for editing
app.get('/project-edit', async (req, res) => {
  const projectId = req.query.id;
  try {
      const project = await Project.findOne({ _id: new ObjectId(projectId) });
      res.render('project-edit', { project });
  } catch (err) {
      console.error('Error fetching project:', err);
      res.status(500).send('Error fetching project');
  }
});


// Route to update a project
app.post('/update-project/:id', async (req,res) => {
  const projectId = req.params.id;
  const updatedData = {
    name: req.body.name,
    overview: req.body.overview,
    requirements: req.body.requirements,
    budget: req.body.budget,
    phone: req.body.phone,
    completionDate: req.body.completionDate,
    contractor: req.body.contractor
  };

  try {
    await Project.updateOne({ _id: projectId }, { $set: updatedData });
    console.log('Updated');
    res.redirect('/my-projects');
  } catch(err) {
    console.error('Error updating project:', err);
    res.status(500).send('Error updating project');
  }
});

// Router to delete a project
// Route handler to delete a project by ID
app.delete('/projects/:id', async (req, res) => {
  try {
      const { id } = req.params;
      await Project.findByIdAndDelete(id);
      res.status(200).send({ message: 'Project deleted successfully' });
  } catch (error) {
      res.status(500).send({ message: 'Error deleting project', error });
  }
});

// end router
app.listen(3000, () => {
  console.log("port 3000 connected");
});
