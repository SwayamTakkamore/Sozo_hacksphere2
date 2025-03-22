import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/IdeaSubmission.css";

const IdeaSubmission = () => {
  const user = useSelector((state) => state.auth.user) || JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    domain: "",
    subDomain: "",
    tags: "",
    description: "",
    pdf: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "pdf" && files.length > 0) {
      setFormData({ ...formData, pdf: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData object to handle file uploads
      const ideaData = new FormData();
      
      // Add text fields
      ideaData.append("title", formData.title);
      ideaData.append("domain", formData.domain);
      ideaData.append("subDomain", formData.subDomain);
      ideaData.append("tags", formData.tags);
      ideaData.append("description", formData.description);
      ideaData.append("email", user.email);
      
      // Add PDF file if present
      if (formData.pdf) {
        ideaData.append("pdf", formData.pdf);
      }

      // Send to server
      const response = await axios.post(
        "http://localhost:5000/ideas", 
        ideaData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Submission response:", response.data);
      setSubmitted(true);
      
    } catch (err) {
      console.error("Error submitting idea:", err);
      setError(err.message || "Failed to submit idea. Please try again.");
      
      // Simulate submission for debugging (remove in production)
      if (process.env.NODE_ENV !== 'production') {
        console.log("Debug mode: Simulating successful submission");
        setTimeout(() => {
          setSubmitted(true);
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      title: "",
      domain: "",
      subDomain: "",
      tags: "",
      description: "",
      pdf: null,
    });
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Domain options
  const domainOptions = [
    "Technology",
    "Healthcare",
    "Education",
    "Environment",
    "Business",
    "Social Impact",
    "Entertainment",
    "Transportation",
    "Other",
  ];

  // Subdomain mapping
  const subDomainMapping = {
    "Technology": ["AI/ML", "Web Development", "Mobile Apps", "Blockchain", "IoT", "Cloud Computing", "Cybersecurity"],
    "Healthcare": ["Medical Devices", "Health Apps", "Biotech", "Mental Health", "Healthcare Systems", "Telemedicine"],
    "Education": ["EdTech", "Learning Platforms", "Classroom Tools", "Assessment Systems", "Special Education", "Language Learning"],
    "Environment": ["Sustainability", "Clean Energy", "Waste Management", "Conservation", "Climate Tech", "Green Buildings"],
    "Business": ["E-commerce", "FinTech", "MarketTech", "Productivity", "Analytics", "HR Solutions"],
    "Social Impact": ["Community Tools", "Nonprofit Solutions", "Accessibility", "Civic Engagement", "Crisis Response"],
    "Entertainment": ["Games", "Media", "Virtual Reality", "Content Creation", "Sports Technology"],
    "Transportation": ["Urban Mobility", "Electric Vehicles", "Logistics", "Delivery Systems", "Navigation"],
    "Other": ["General"],
  };

  // If not logged in, don't render the form
  if (!user) return null;

  return (
    <div>
      <Navbar />
      <div className="idea-submission-container">
        {!submitted ? (
          <>
            <div className="submission-header">
              <motion.div 
                className="header-content"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1>Submit Your Innovation Idea</h1>
                <p>
                  Turn your creative spark into a reality. Share your idea with our community
                  of mentors, innovators, and fellow students to bring it to life.
                </p>
              </motion.div>

              <motion.div
                className="header-illustration"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="animation-container">
                  <div className="floating-idea">
                    <span className="idea-icon">💡</span>
                    <div className="pulse-rings">
                      <div className="ring ring1"></div>
                      <div className="ring ring2"></div>
                      <div className="ring ring3"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="form-container-wrapper">
              <div className="inspiration-sidebar">
                <motion.div 
                  className="inspiration-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <h3>What Makes a Great Idea?</h3>
                  <ul className="inspiration-list">
                    <motion.li 
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="list-icon">🎯</span>
                      <div>
                        <strong>Clear Problem Statement</strong>
                        <p>Define the specific issue you're solving</p>
                      </div>
                    </motion.li>
                    <motion.li 
                      whileHover={{ x: 5 }} 
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="list-icon">⚡</span>
                      <div>
                        <strong>Innovative Approach</strong>
                        <p>How is your solution different or better?</p>
                      </div>
                    </motion.li>
                    <motion.li 
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="list-icon">👥</span>
                      <div>
                        <strong>Target Audience</strong>
                        <p>Who will benefit from your innovation?</p>
                      </div>
                    </motion.li>
                    <motion.li 
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="list-icon">🔄</span>
                      <div>
                        <strong>Implementation Path</strong>
                        <p>Initial thoughts on making it real</p>
                      </div>
                    </motion.li>
                    <motion.li 
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="list-icon">📈</span>
                      <div>
                        <strong>Potential Impact</strong>
                        <p>What positive change could result?</p>
                      </div>
                    </motion.li>
                  </ul>

                  <div className="success-example">
                    <h4>Featured Success</h4>
                    <div className="example-card">
                      <div className="example-icon blue-gradient">
                        <span>🌊</span>
                      </div>
                      <p>
                        <strong>WaterPure</strong> started as a student idea submission
                        and now provides clean water technology to 3 countries.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.form 
                className="form-container" 
                onSubmit={handleSubmit}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="form-group" variants={fadeInUp}>
                  <label>Idea Title:</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter a catchy, descriptive title"
                  />
                </motion.div>

                <motion.div className="form-row" variants={fadeInUp}>
                  <div className="form-group">
                    <label>Domain:</label>
                    <select
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Domain</option>
                      {domainOptions.map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Sub-Domain:</label>
                    <select
                      name="subDomain"
                      value={formData.subDomain}
                      onChange={handleChange}
                      required
                      disabled={!formData.domain}
                    >
                      <option value="">Select Sub-Domain</option>
                      {formData.domain &&
                        subDomainMapping[formData.domain]?.map((subDomain) => (
                          <option key={subDomain} value={subDomain}>
                            {subDomain}
                          </option>
                        ))}
                    </select>
                  </div>
                </motion.div>

                <motion.div className="form-group" variants={fadeInUp}>
                  <label>Tags: <span className="hint-text">(Comma separated)</span></label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g. mobile, healthcare, AI, sustainability"
                  />
                </motion.div>

                <motion.div className="form-group" variants={fadeInUp}>
                  <label>Description:</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Describe your idea in detail. What problem does it solve? How is it innovative? What technologies would be involved?"
                  />
                </motion.div>

                <motion.div className="form-group" variants={fadeInUp}>
                  <label>Supporting Document: <span className="hint-text">(PDF, optional)</span></label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      name="pdf"
                      onChange={handleChange}
                      accept=".pdf"
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="file-upload-button">
                      <span className="upload-icon">📎</span>
                      {formData.pdf ? formData.pdf.name : "Choose a file"}
                    </label>
                  </div>
                </motion.div>

                <motion.div className="form-row" variants={fadeInUp}>
                  <div className="form-group">
                    <label>Your Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Your Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Your email address"
                    />
                  </div>
                </motion.div>

                <motion.div className="form-group submit-section" variants={fadeInUp}>
                  <div className="terms-checkbox">
                    <input type="checkbox" id="terms" required />
                    <label htmlFor="terms">
                      I agree to the terms and conditions for idea submission
                    </label>
                  </div>

                  <motion.button 
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? (
                      <div className="loading-spinner">
                        <div className="spinner"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      "Submit Idea"
                    )}
                  </motion.button>
                </motion.div>
              </motion.form>
            </div>

            <motion.div 
              className="innovation-steps"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <h2>What Happens After Your Submission?</h2>
              <div className="steps-container">
                <div className="step-item">
                  <div className="step-icon review-icon">
                    <span>1</span>
                  </div>
                  <h4>Expert Review</h4>
                  <p>Your idea will be reviewed by our panel of industry experts and mentors</p>
                </div>
                <div className="step-connector">
                  <div className="connector-line"></div>
                </div>
                <div className="step-item">
                  <div className="step-icon feedback-icon">
                    <span>2</span>
                  </div>
                  <h4>Constructive Feedback</h4>
                  <p>Receive detailed feedback and suggestions to refine your concept</p>
                </div>
                <div className="step-connector">
                  <div className="connector-line"></div>
                </div>
                <div className="step-item">
                  <div className="step-icon develop-icon">
                    <span>3</span>
                  </div>
                  <h4>Development Support</h4>
                  <p>Get connected with resources, mentors, and potential team members</p>
                </div>
                <div className="step-connector">
                  <div className="connector-line"></div>
                </div>
                <div className="step-item">
                  <div className="step-icon launch-icon">
                    <span>4</span>
                  </div>
                  <h4>Launch Your Idea</h4>
                  <p>Transform your concept into reality with ongoing guidance and support</p>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div 
            className="success-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="success-animation">
              <div className="checkmark-circle">
                <div className="checkmark"></div>
              </div>
              <div className="success-spark spark1"></div>
              <div className="success-spark spark2"></div>
              <div className="success-spark spark3"></div>
              <div className="success-spark spark4"></div>
            </div>
            <h2>Thank You for Your Submission!</h2>
            <p>Your innovative idea has been received. Our team will review it and get back to you soon.</p>
            <p className="reference-note">Reference ID: INN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            
            <motion.button 
              className="submit-button"
              onClick={resetForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Another Idea
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default IdeaSubmission;
