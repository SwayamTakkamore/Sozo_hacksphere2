import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [currentTab, setCurrentTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  // Check if user is admin
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
        if (data.role !== 'admin') {
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

  // Fetch ideas by status
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/ideas/status/${currentTab}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch ideas');
        }
        
        const data = await response.json();
        setIdeas(data);
      } catch (error) {
        console.error('Error fetching ideas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIdeas();
  }, [currentTab]);

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
      const url = actionType === 'approve' 
        ? `http://localhost:5000/admin/ideas/${selectedIdea._id}/approve`
        : `http://localhost:5000/admin/ideas/${selectedIdea._id}/reject`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackText })
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
    <div className="admin-dashboard">
      <Navbar />
      <div className="admin-container">
        <motion.div 
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Admin Dashboard</h1>
          <p>Manage and review idea submissions</p>
        </motion.div>
        
        <div className="admin-content">
          <div className="tabs-container">
            <button 
              className={`tab ${currentTab === 'pending' ? 'active' : ''}`} 
              onClick={() => setCurrentTab('pending')}
            >
              Pending Review
            </button>
            <button 
              className={`tab ${currentTab === 'approved' ? 'active' : ''}`}
              onClick={() => setCurrentTab('approved')}
            >
              Approved
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
                  <p>No {currentTab} ideas found</p>
                </div>
              ) : (
                ideas.map((idea) => (
                  <motion.div 
                    key={idea._id}
                    className="admin-idea-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="idea-main-content">
                      <h3>{idea.title}</h3>
                      <div className="idea-meta">
                        <span className="idea-domain">{idea.domain} / {idea.subDomain}</span>
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
                        <span className="submitter-email">{idea.email}</span>
                      </div>
                    </div>
                    
                    <div className="idea-actions">
                      {currentTab === 'pending' && (
                        <>
                          <button 
                            className="approve-btn"
                            onClick={() => openModal(idea, 'approve')}
                          >
                            Approve
                          </button>
                          <button 
                            className="reject-btn"
                            onClick={() => openModal(idea, 'reject')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {currentTab === 'approved' || currentTab === 'rejected' ? (
                        <div className="feedback-preview">
                          <h4>Feedback:</h4>
                          <p>{idea.adminFeedback || 'No feedback provided.'}</p>
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
      </div>
      
      {modalOpen && selectedIdea && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{actionType === 'approve' ? 'Approve Idea' : 'Reject Idea'}</h2>
            <h3>{selectedIdea.title}</h3>
            <div className="feedback-form">
              <label htmlFor="feedback">Feedback for the student:</label>
              <textarea 
                id="feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={actionType === 'approve' ? 
                  "Provide any positive feedback or next steps..." : 
                  "Explain why the idea needs revision..."
                }
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button 
                className={actionType === 'approve' ? 'approve-btn' : 'reject-btn'}
                onClick={handleAction}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'} Idea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
