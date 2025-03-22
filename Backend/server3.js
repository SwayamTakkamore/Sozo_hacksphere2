const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const authenticateToken = require('./middleware/authenticateToken');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Session Middleware
app.use(
    session({
      secret: "random_string",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
      cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
    })
  );
  

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// User Schema & Model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["student", "mentor", "admin"], required: true },
  expertise: [String]
});

const User = mongoose.model("User", userSchema);

// Modify Idea Schema
const ideaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  domain: { type: String, required: true },
  subDomain: { type: String, required: true },
  tags: [{ type: String }],
  description: { type: String, required: true },
  pdf: { type: String }, // Store PDF file path or URL
  status: { type: String, default: "pending" },
  email: { type: String, required: true },
});


  const Idea = mongoose.model("Idea", ideaSchema);

// Handle File Upload (if using Multer)
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Files stored in "uploads" folder

// Middleware to Check Authentication
const requireLogin = (req, res, next) => {
  if (!req.session.user) return res.status(401).json({ message: "Not logged in" });
  next();
};

// User Registration
app.post("/register", async (req, res) => {
  const { name, email, password, role, expertise } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const newUser = new User({ name, email, password: hashedPassword, role, expertise });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) return res.status(400).json({ message: "User not found" });
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  
    // Store user details in session
    req.session.user = { id: user._id, name: user.name, email: user.email };
    res.json({ message: "Login successful", user: req.session.user });
  });
  
  

// User Logout
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out successfully" });
});

// Get all ideas
app.get("/ideas", async (req, res) => {
    try {
      const ideas = await Idea.find();
      res.json(ideas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ideas" });
    }
  });

// Get ideas by user email
app.get("/idea", async (req, res) => {
  try {
    const { email } = req.query; // Get email from query parameters
    let query = {};
    if (email) {
      query = { email }; // Filter ideas by email if provided
    }
    const ideas = await Idea.find(query); // Fetch ideas based on the query
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
});

// Verify an idea
app.put("/ideas/:id/verify", async (req, res) => {
    try {
      const { id } = req.params;
      await Idea.findByIdAndUpdate(id, { status: "verified" });
      res.status(200).json({ message: "Idea verified successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify idea" });
    }
  });

  app.put("/ideas/:id/not-verify", async (req, res) => {
    try {
      await Idea.findByIdAndUpdate(req.params.id, { status: "pending" });
      res.json({ message: "Idea status reset to pending" });
    } catch (error) {
      res.status(500).json({ error: "Error resetting idea status" });
    }
  });
  

app.post("/ideas", upload.single("pdf"), async (req, res) => {
  try {
    const { title, domain, subDomain, tags, description, uid, email } = req.body;
    const pdfPath = req.file ? req.file.path : null;

    console.log("Receiving idea submission:", { title, domain, email });
  
    if (!title || !domain || !subDomain || !description || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newIdea = new Idea({
      title,
      domain,
      subDomain,
      tags: tags.split(",").map((tag) => tag.trim()), // Convert CSV string to array
      description,
      uid,
      pdf: pdfPath,
      email,
      status: "pending"
    });

    await newIdea.save();
    res.json({ message: "Idea submitted successfully", idea: newIdea });
  
    res.status(201).json({ 
      message: "Idea submitted successfully", 
      idea: newIdea 
    });
  } catch (error) {
    res.status(500).json({ error: "Error submitting idea" });
  }
});

// Delete an idea
app.delete("/ideas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Idea.findByIdAndDelete(id);
    res.status(200).json({ message: "Idea deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete idea" });
  }
});

app.post("/user-ideas", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const ideas = await Idea.find({ email });
    res.json(ideas);
  } catch (error) {
    console.error("Error fetching ideas:", error);
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
});

// Delete Idea (Only Owner)
// app.delete("/idea/:id", requireLogin, async (req, res) => {
//   const idea = await Idea.findById(req.params.id);
//   if (!idea || idea.studentId.toString() !== req.session.user._id)
//     return res.status(403).json({ message: "Unauthorized or idea not found" });

//   await Idea.findByIdAndDelete(req.params.id);
//   res.json({ message: "Idea deleted successfully" });
// });

// Mentor List
app.get("/mentors", async (req, res) => {
  const mentors = await User.find({ role: "mentor" }, "name expertise");
  res.json(mentors);
});

// Get a single mentor by ID
app.get("/mentors/:id", async (req, res) => {
  try {
    const mentor = await User.findOne({ _id: req.params.id, role: "mentor" }, "name expertise");
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student List
app.get("/students", async (req, res) => {
    const students = await User.find({ role: "student" }, "name expertise");
    res.json(students);
});

// Get a single student by ID
app.get("/students/:id", async (req, res) => {
    try {
      const student = await User.findOne({ _id: req.params.id, role: "student" }, "name expertise");
      if (!student) return res.status(404).json({ message: "Student not found" });
      res.json(student);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});


// Pitch Idea to Mentor
app.post("/pitch", requireLogin, async (req, res) => {
  if (req.session.user.role !== "student") return res.status(403).json({ message: "Only students can pitch ideas" });

  const { ideaId, mentorId } = req.body;
  const newPitch = new Pitch({ ideaId, mentorId });
  await newPitch.save();
  res.json({ message: "Idea pitched to mentor" });
});


// Accept/Reject Pitch (Mentor Only)
app.put("/pitch/:id", requireLogin, async (req, res) => {
  if (req.session.user.role !== "mentor") return res.status(403).json({ message: "Only mentors can modify pitches" });

  const { status, feedback } = req.body;
  await Pitch.findByIdAndUpdate(req.params.id, { status, feedback });
  res.json({ message: "Pitch status updated" });
});

// Fetch User Profile and Ideas
app.post('/user-profile', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const ideas = await Idea.find({ email });
    res.json({ user, ideas });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});
  
// Fetch User Role
app.post('/user-role', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user role' });
  }
});

// Fetch User Data by Email
app.get("/user", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email }, "name email role expertise");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));