import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./styles/IdeaStatus.css";

const IdeaStatus = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    // First check if user is logged in
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserIdeas = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/user-ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ideas: ${response.status}`);
        }

        const data = await response.json();
        setIdeas(data);
      } catch (err) {
        console.error("Error fetching ideas:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchUserIdeas();
    }
  }, [user, navigate]);

  if (!user) {
    // This prevents any rendering before redirect happens
    return null;
  }

  if (loading) {
    return (
      <div className="idea-status-page">
        <Navbar />
        <div className="status-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your ideas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="idea-status-page">
        <Navbar />
        <div className="status-container">
          <div className="error-message">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="idea-status-page">
      <Navbar />
      <div className="status-container">
        <motion.div
          className="status-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>My Innovation Ideas</h1>
          <p>Track the progress and status of your submitted ideas</p>
        </motion.div>

        {ideas.length === 0 ? (
          <motion.div
            className="no-ideas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="no-ideas-icon">🔍</div>
            <h3>No Ideas Found</h3>
            <p>You haven't submitted any ideas yet. Ready to share your innovation?</p>
            <a href="/idea-submission" className="submit-idea-button">
              Submit Your First Idea
            </a>
          </motion.div>
        ) : (
          <motion.div
            className="ideas-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {ideas.map((idea, index) => (
              <motion.div
                key={idea._id || index}
                className={`idea-card ${idea.status || "pending"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="idea-header">
                  <div className="idea-title-section">
                    <h3>{idea.title}</h3>
                    <div className="status-badges">
                      <div className={`status-badge ${idea.status || "pending"}`}>
                        {idea.status === "approved" && "Approved"}
                        {idea.status === "rejected" && "Needs Revision"}
                        {(!idea.status || idea.status === "pending") && "Pending Approval"}
                      </div>
                      
                      {idea.status === "approved" && (
                        <div className={`status-badge mentor-status ${idea.mentorVerification || "pending"}`}>
                          {idea.mentorVerification === "accepted" && "Mentor Verified"}
                          {idea.mentorVerification === "rejected" && "Mentor Rejected"}
                          {(!idea.mentorVerification || idea.mentorVerification === "pending") && "Awaiting Mentor"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="idea-date">
                    Submitted on {idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : "N/A"}
                  </div>
                </div>

                <div className="idea-details">
                  <div className="idea-category">
                    <strong>Domain:</strong> {idea.domain || "N/A"} 
                    {idea.subDomain && `/ ${idea.subDomain}`}
                  </div>
                  <div className="idea-tags">
                    {Array.isArray(idea.tags) ? (
                      idea.tags.map((tag, tagIdx) => (
                        <span key={tagIdx} className="tag">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="tag">No tags</span>
                    )}
                  </div>
                </div>

                <div className="idea-description">
                  {idea.description ? (
                    idea.description.length > 150 ? 
                      `${idea.description.substring(0, 150)}...` : 
                      idea.description
                  ) : (
                    "No description available"
                  )}
                </div>

                {idea.adminFeedback && (
                  <div className="admin-feedback">
                    <h4>Admin Feedback:</h4>
                    <p>{idea.adminFeedback}</p>
                  </div>
                )}

                {idea.status === "approved" && (
                  <div className="mentor-status">
                    {idea.mentorId ? (
                      <div className="assigned-mentor">
                        <h4>Assigned Mentor:</h4>
                        <div className="mentor-info">
                          <div className="mentor-name">{idea.mentorId.name || "Unnamed Mentor"}</div>
                          <div className="mentor-expertise">
                            {idea.mentorId.expertise ? 
                              idea.mentorId.expertise.join(", ") : 
                              "General mentoring"}
                          </div>
                          {idea.mentorId.email && (
                            <a href={`mailto:${idea.mentorId.email}`} className="contact-mentor">
                              Contact Mentor
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="awaiting-mentor">
                        <p>Your idea is approved! Waiting for mentor assignment.</p>
                      </div>
                    )}
                  </div>
                )}

                {idea.mentorFeedback && (
                  <div className="mentor-feedback">
                    <h4>Mentor Feedback:</h4>
                    <p>{idea.mentorFeedback}</p>
                  </div>
                )}

                <div className="idea-actions">
                  <button className="view-details">View Full Details</button>
                  {idea.status === "rejected" && (
                    <button className="revise-idea">Revise Idea</button>
                  )}
                  {idea.status === "approved" && idea.mentorVerification === "accepted" && !idea.mentorId && (
                    <button className="find-mentor-btn" onClick={() => navigate('/find-mentor')}>
                      Find a Mentor
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="status-legend">
          <h4>Status Guide:</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color pending"></div>
              <div>
                <strong>Pending</strong>: Awaiting admin review
              </div>
            </div>
            <div className="legend-item">
              <div className="legend-color approved"></div>
              <div>
                <strong>Approved</strong>: Ready for mentor assignment
              </div>
            </div>
            <div className="legend-item">
              <div className="legend-color rejected"></div>
              <div>
                <strong>Needs Revision</strong>: Requires changes before approval
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaStatus;
