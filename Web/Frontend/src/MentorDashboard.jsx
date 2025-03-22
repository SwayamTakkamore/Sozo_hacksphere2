import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './styles/MentorDashboard.css';

const MentorDashboard = () => {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [currentTab, setCurrentTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  // Check if user is a mentor
  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await fetch('http://localhost:5000/user-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user?.email })
        });
        
        if (!response.ok) {
          throw new Error('Failed to verify user role');
        }
        
        const data = await response.json();
        if (data.role !== 'mentor') {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking role:', error);
        navigate('/');
      }
    };
    
    if (user?.email) {
      checkRole();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch ideas based on mentor's expertise
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        let url;
        
        if (currentTab === 'pending') {
          // For pending ideas, get ideas from user's expertise domains
          const response = await fetch('http://localhost:5000/mentor/ideas-to-review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: user.expertise?.join('|') || '' })
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch ideas');
          }
          
          const data = await response.json();
          setIdeas(data);
        } else {
          // For accepted/rejected, get all ideas the mentor has reviewed
          const response = await fetch(`http://localhost:5000/ideas/mentor-status/${currentTab}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mentorEmail: user.email })
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch ideas');
          }
          
          const data = await response.json();
          setIdeas(data);
        }
      } catch (error) {
        console.error('Error fetching ideas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.email) {
      fetchIdeas();
    }
  }, [currentTab, user]);

  const openModal = (idea, action) => {
    setSelectedIdea(idea);
    setActionType(action);
    setFeedbackText('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedIdea(null);
    setFeedbackText('');
  };

  const handleAction = async () => {
    try {
      const url = actionType === 'accept' 
        ? `http://localhost:5000/mentor/ideas/${selectedIdea._id}/accept`
        : `http://localhost:5000/mentor/ideas/${selectedIdea._id}/reject`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feedback: feedbackText,
          mentorEmail: user.email
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${actionType} idea`);
      }
      
      // Refresh ideas list
      const updatedIdeas = ideas.filter(idea => idea._id !== selectedIdea._id);
      setIdeas(updatedIdeas);
      closeModal();
    } catch (error) {
      console.error(`Error ${actionType}ing idea:`, error);
    }
  };

  return (
    <div className="mentor-dashboard">
      <Navbar />
      <div className="mentor-container">
        <motion.div 
          className="mentor-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Mentor Dashboard</h1>
          <p>Review and provide feedback on innovation ideas</p>
        </motion.div>
        
        <div className="mentor-content">
          <div className="tabs-container">
            <button 
              className={`tab ${currentTab === 'pending' ? 'active' : ''}`} 
              onClick={() => setCurrentTab('pending')}
            >
              Pending Review
            </button>
            <button 
              className={`tab ${currentTab === 'accepted' ? 'active' : ''}`}
              onClick={() => setCurrentTab('accepted')}
            >
              Accepted
            </button>
            <button 
              className={`tab ${currentTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setCurrentTab('rejected')}
            >
              Rejected
            </button>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading ideas...</p>
            </div>
          ) : (
            <div className="ideas-container">
              {ideas.length === 0 ? (
                <div className="no-items">
                  <p>No {currentTab} ideas found matching your expertise</p>
                </div>
              ) : (
                ideas.map((idea) => (
                  <motion.div 
                    key={idea._id}
                    className="mentor-idea-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="idea-main-content">
                      <div className="idea-domain-badge">{idea.domain}</div>
                      <h3>{idea.title}</h3>
                      <div className="idea-meta">
                        <span className="idea-subdomain">{idea.subDomain}</span>
                        <span className="idea-date">
                          Submitted: {new Date(idea.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="idea-description">
                        {idea.description.substring(0, 200)}
                        {idea.description.length > 200 ? '...' : ''}
                      </p>
                      <div className="idea-tags">
                        {idea.tags.map((tag, index) => (
                          <span key={index} className="idea-tag">{tag}</span>
                        ))}
                      </div>
                      <div className="submitter-info">
                        <span className="submitter-email">By: {idea.email}</span>
                      </div>
                    </div>
                    
                    <div className="idea-actions">
                      {currentTab === 'pending' && (
                        <>
                          <button 
                            className="accept-btn"
                            onClick={() => openModal(idea, 'accept')}
                          >
                            Accept Idea
                          </button>
                          <button 
                            className="reject-btn"
                            onClick={() => openModal(idea, 'reject')}
                          >
                            Reject Idea
                          </button>
                        </>
                      )}
                      {currentTab === 'accepted' || currentTab === 'rejected' ? (
                        <div className="feedback-preview">
                          <h4>Your Feedback:</h4>
                          <p>{idea.mentorFeedback || 'No feedback provided.'}</p>
                        </div>
                      ) : null}
                      <button className="view-btn">View Details</button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="expertise-section">
          <h3>Your Expertise Areas</h3>
          <div className="expertise-tags">
            {user?.expertise?.map((skill, index) => (
              <span key={index} className="expertise-tag">{skill}</span>
            )) || <span className="no-expertise">No expertise areas set</span>}
          </div>
          <p className="expertise-note">You'll only see ideas related to your expertise areas</p>
        </div>
      </div>
      
      {modalOpen && selectedIdea && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{actionType === 'accept' ? 'Accept Idea' : 'Reject Idea'}</h2>
            <h3>{selectedIdea.title}</h3>
            <div className="feedback-form">
              <label htmlFor="feedback">Feedback for the student:</label>
              <textarea 
                id="feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={actionType === 'accept' ? 
                  "Provide guidance or next steps..." : 
                  "Explain what needs improvement..."
                }
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button 
                className={actionType === 'accept' ? 'accept-btn' : 'reject-btn'}
                onClick={handleAction}
              >
                {actionType === 'accept' ? 'Accept' : 'Reject'} Idea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
