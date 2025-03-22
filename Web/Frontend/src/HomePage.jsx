import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { motion } from "framer-motion";
import "./styles/HomePage.css";

function HomePage() {
  const [ideas, setIdeas] = useState(520);
  const [collaborations, setCollaborations] = useState(132);
  const [projects, setProjects] = useState(45);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdeas((prev) => prev + Math.floor(Math.random() * 3));
      setCollaborations((prev) => prev + Math.floor(Math.random() * 2));
      setProjects((prev) => prev + Math.floor(Math.random() * 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div>
      <Navbar />

      {/* Hero Section with Interactive Elements */}
      <header className="hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="hero-text">
            <motion.h1 
              initial={{ opacity: 0, y: -50 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
            >
              Turning Bright Ideas into Reality
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              ThinkBridZ connects innovative students with mentors, resources, and collaborators
              to transform concepts into impactful solutions.
            </motion.p>
            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <a href="/idea-submission" className="cta-button">Submit Your Idea</a>
              <a href="/idea-bot" className="secondary-button">Ask AI Assistant</a>
            </motion.div>
          </div>
          <motion.div 
            className="hero-image"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-placeholder">
              <div className="hero-icon">💡</div>
              <h3>Innovation Hub</h3>
              <div className="floating-elements">
                <span className="floating-element">🚀</span>
                <span className="floating-element">⚙️</span>
                <span className="floating-element">🔍</span>
                <span className="floating-element">💻</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Live Stats Section with Animated Numbers */}
      <section className="stats-section">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          variants={fadeIn}
        >
          Our Innovation Ecosystem
        </motion.h2>
        <div className="stats-grid">
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            variants={fadeIn}
          >
            <div className="stat-circle pulse-animation">💡</div>
            <h3>{ideas}+</h3>
            <p>Ideas Submitted</p>
            <div className="stat-growth">↑ 12% this month</div>
          </motion.div>
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            variants={fadeIn}
          >
            <div className="stat-circle pulse-animation">🤝</div>
            <h3>{collaborations}+</h3>
            <p>Mentor Collaborations</p>
            <div className="stat-growth">↑ 8% this month</div>
          </motion.div>
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05 }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            variants={fadeIn}
          >
            <div className="stat-circle pulse-animation">🚀</div>
            <h3>{projects}+</h3>
            <p>Projects Launched</p>
            <div className="stat-growth">↑ 15% this month</div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Carousel */}
      <section className="featured-projects">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          variants={fadeIn}
        >
          Featured Innovation Projects
        </motion.h2>
        <div className="project-carousel">
          <motion.div 
            className="project-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeIn}
            whileHover={{ y: -10 }}
          >
            <div className="project-image">
              <div className="image-placeholder blue-gradient">
                <span className="placeholder-icon">🏙️</span>
              </div>
            </div>
            <div className="project-badge">FEATURED</div>
            <h3>Smart Urban Solutions</h3>
            <p>AI-powered urban infrastructure that optimizes traffic flow and reduces energy consumption by 40%</p>
            <div className="project-tags">
              <span>AI</span>
              <span>IoT</span>
              <span>Sustainability</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="project-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            variants={fadeIn}
            whileHover={{ y: -10 }}
          >
            <div className="project-image">
              <div className="image-placeholder green-gradient">
                <span className="placeholder-icon">🌱</span>
              </div>
            </div>
            <div className="project-badge">TRENDING</div>
            <h3>Eco-Tech Innovations</h3>
            <p>Biodegradable smart sensors for agricultural monitoring that increase crop yield while reducing water usage</p>
            <div className="project-tags">
              <span>CleanTech</span>
              <span>Agriculture</span>
              <span>Sensors</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="project-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            variants={fadeIn}
            whileHover={{ y: -10 }}
          >
            <div className="project-image">
              <div className="image-placeholder red-gradient">
                <span className="placeholder-icon">❤️</span>
              </div>
            </div>
            <div className="project-badge">NEW</div>
            <h3>Health Innovation Lab</h3>
            <p>Wearable diagnostic device that monitors vital signs and predicts potential health issues before symptoms appear</p>
            <div className="project-tags">
              <span>MedTech</span>
              <span>AI</span>
              <span>Wearables</span>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="view-all-button"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <a href="/projects" className="outline-button">Explore All Projects</a>
        </motion.div>
      </section>

      {/* How It Works Section with Visual Process Flow */}
      <section className="how-it-works">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          Your Journey From Idea to Impact
        </motion.h2>
        <div className="process-flow">
          <motion.div 
            className="process-step"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeIn}
          >
            <div className="step-number">1</div>
            <div className="step-image blue-gradient">
              <span className="placeholder-icon">📝</span>
            </div>
            <h3>Submit Your Idea</h3>
            <p>Share your innovative concept through our structured submission system with details and supporting materials.</p>
            <div className="step-features">
              <span>✓ Guided templates</span>
              <span>✓ AI feedback</span>
              <span>✓ Immediate validation</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="process-connector"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          />
          
          <motion.div 
            className="process-step"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            variants={fadeIn}
          >
            <div className="step-number">2</div>
            <div className="step-image green-gradient">
              <span className="placeholder-icon">👥</span>
            </div>
            <h3>Connect with Mentors</h3>
            <p>Receive guidance and feedback from our network of industry mentors and technical specialists.</p>
            <div className="step-features">
              <span>✓ Expert reviews</span>
              <span>✓ Technical guidance</span>
              <span>✓ Market insights</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="process-connector"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
          />
          
          <motion.div 
            className="process-step"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            variants={fadeIn}
          >
            <div className="step-number">3</div>
            <div className="step-image purple-gradient">
              <span className="placeholder-icon">🚀</span>
            </div>
            <h3>Build & Launch</h3>
            <p>Transform your concept into reality with collaborative teams, resources, and ongoing support.</p>
            <div className="step-features">
              <span>✓ Team formation</span>
              <span>✓ Resource access</span>
              <span>✓ Launch support</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="success-stories">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          Student Success Stories
        </motion.h2>
        <div className="story-container">
          <motion.div 
            className="story-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeIn}
            whileHover={{ y: -5 }}
          >
            <div className="student-photo blue-gradient">
              <span>RS</span>
            </div>
            <div className="quote">"</div>
            <p>With ThinkBridZ's mentorship, my smart recycling system concept evolved from an idea to a working prototype being tested in multiple campuses!</p>
            <div className="student-info">
              <h4>Raj Sharma</h4>
              <p>Computer Science, Final Year</p>
            </div>
            <div className="story-achievement">
              <span className="achievement-badge">🏆 Regional Tech Award Winner</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="story-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            variants={fadeIn}
            whileHover={{ y: -5 }}
          >
            <div className="student-photo green-gradient">
              <span>PP</span>
            </div>
            <div className="quote">"</div>
            <p>The feedback from industry mentors helped us pivot our healthcare app to address real user needs. Now we're partnered with two local hospitals!</p>
            <div className="student-info">
              <h4>Priya Patel</h4>
              <p>Healthcare Management, Third Year</p>
            </div>
            <div className="story-achievement">
              <span className="achievement-badge">💰 Secured $50K Funding</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="technologies-section">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          Cutting-Edge Technologies
        </motion.h2>
        <p className="section-subtitle">Our students work with the latest tools and frameworks</p>
        
        <div className="tech-grid">
          <motion.div 
            className="tech-card"
            whileHover={{ y: -15 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="stat-circle">🧠</div>
            <h3>Artificial Intelligence</h3>
            <p>Machine Learning, Neural Networks, NLP</p>
          </motion.div>
          
          <motion.div 
            className="tech-card"
            whileHover={{ y: -15 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="stat-circle">⛓️</div>
            <h3>Blockchain</h3>
            <p>Smart Contracts, DeFi, Web3</p>
          </motion.div>
          
          <motion.div 
            className="tech-card"
            whileHover={{ y: -15 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="stat-circle">👓</div>
            <h3>VR/AR</h3>
            <p>Immersive Experiences, 3D Modeling</p>
          </motion.div>
          
          <motion.div 
            className="tech-card"
            whileHover={{ y: -15 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="stat-circle">📱</div>
            <h3>IoT</h3>
            <p>Sensors, Smart Devices, Connected Systems</p>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <motion.section 
        className="join-cta"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="cta-background">
          <div className="particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle"></div>
            ))}
          </div>
        </div>
        <div className="cta-content">
          <h2>Ready to Begin Your Innovation Journey?</h2>
          <p>Join our community of 1000+ student innovators and industry mentors to turn your ideas into impact.</p>
          <div className="cta-buttons">
            <motion.a 
              href="/register" 
              className="cta-button"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Create Account
            </motion.a>
            <motion.a 
              href="/idea-bot" 
              className="secondary-button"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Try AI Idea Assistant
            </motion.a>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>ThinkBridZ</h3>
            <p>Empowering student innovation through mentorship, resources, and community.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/idea-submission">Submit Idea</a></li>
              <li><a href="/find-mentor">Find Mentors</a></li>
              <li><a href="/idea-bot">AI Assistant</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a href="https://github.com/Yash11778" target="_blank" rel="noreferrer">
                <span className="social-icon">📂</span> GitHub
              </a>
              <a href="https://www.linkedin.com/in/yash-dharme-b0ab0b225/" target="_blank" rel="noreferrer">
                <span className="social-icon">💼</span> LinkedIn
              </a>
              <a href="mailto:support@innovationhub.com">
                <span className="social-icon">📧</span> Email
              </a>
            </div>
          </div>
        </div>
        <div className="copyright">
          <p>© {new Date().getFullYear()} ThinkBridZ  | All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
