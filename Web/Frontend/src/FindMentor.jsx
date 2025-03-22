import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/FindMentor.css";

const FindMentor = () => {
  // Implement a safe useSelector pattern with a fallback
  const useReduxUser = () => {
    try {
      return useSelector((state) => state.auth.user);
    } catch (error) {
      console.warn('Redux store not available, using localStorage fallback');
      // Fallback to localStorage if Redux is not available
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
  };

  const user = useReduxUser();
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifiedIdeas, setVerifiedIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [allowMentorSelection, setAllowMentorSelection] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    expertise: "",
    availability: "",
    searchQuery: ""
  });
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  // Sample mentor data for fallback
  const sampleMentors = [
    {
      _id: "sample1",
      name: "Dr. Sarah Johnson",
      role: "Senior AI Researcher",
      company: "TechVision Inc.",
      expertise: ["Artificial Intelligence", "Machine Learning", "Neural Networks"],
      rating: 4.9,
      reviews: 43,
      availability: "Full-time",
      imgUrl: "https://randomuser.me/api/portraits/women/23.jpg",
      background: "10+ years in AI research with focus on computer vision applications",
      achievements: "Published 20+ papers in leading journals, 2 patents in ML"
    },
    {
      _id: "sample2",
      name: "Michael Chen",
      role: "Product Manager",
      company: "InnovateTech",
      expertise: ["Product Strategy", "UX Design", "Market Research"],
      rating: 4.7,
      reviews: 31,
      availability: "Part-time",
      imgUrl: "https://randomuser.me/api/portraits/men/45.jpg",
      background: "Led product teams at InnovateTech and previously at Google",
      achievements: "Launched 5 successful products with >1M users each"
    },
    {
      _id: "sample3",
      name: "Prof. Elena Rodriguez",
      role: "Biotechnology Researcher",
      company: "BioCatalyst Labs",
      expertise: ["Biotechnology", "Genomics", "Medical Devices"],
      rating: 4.8,
      reviews: 27,
      availability: "Weekly",
      imgUrl: "https://randomuser.me/api/portraits/women/58.jpg",
      background: "Professor of Biotechnology with research focus on synthetic biology",
      achievements: "Founded 2 successful biotech startups, multiple research grants"
    }
  ];

  // Fetch user's verified ideas
  useEffect(() => {
    const fetchVerifiedIdeas = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        
        // Try to get real data from API
        try {
          // Get all user ideas
          const response = await axios.post("http://localhost:5000/user-profile", { 
            email: user.email 
          });
          
          if (response.data && response.data.ideas) {
            // Filter for verified/approved ideas
            const verified = response.data.ideas.filter(idea => 
              idea.status === "verified" || idea.status === "approved"
            );
            
            setVerifiedIdeas(verified);
            setAllowMentorSelection(verified.length > 0);
            
            if (verified.length > 0) {
              setSelectedIdea(verified[0]);
            }
          }
        } catch (e) {
          console.log("Error fetching from API, using sample data");
          // Use sample data (code from previous implementation)
          setTimeout(() => {
            setVerifiedIdeas(sampleIdeas);
            setAllowMentorSelection(true);
            setSelectedIdea(sampleIdeas[0]);
            setLoading(false);
          }, 1000);
          return;
        }
      } catch (error) {
        console.error("Error fetching verified ideas:", error);
        // Set sample data as fallback
        setVerifiedIdeas(sampleIdeas);
        setAllowMentorSelection(true);
        setSelectedIdea(sampleIdeas[0]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchVerifiedIdeas();
    }
  }, [user]);

  // Fetch domain-specific mentors when an idea is selected
  useEffect(() => {
    const fetchMentors = async () => {
      if (!selectedIdea) {
        setMentors([]);
        setFilteredMentors([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try to fetch mentors from API based on domain
        try {
          // First try domain-specific endpoint
          const domainEndpoint = `http://localhost:5000/mentors/domain/${encodeURIComponent(selectedIdea.domain)}`;
          let response = await axios.get(domainEndpoint);
          
          if (response.data && response.data.length > 0) {
            const enrichedData = response.data.map(mentor => ({
              ...mentor,
              rating: mentor.rating || 4.5 + Math.random() * 0.5,
              reviews: mentor.reviews || Math.floor(Math.random() * 50) + 10,
              availability: mentor.availability || ["Full-time", "Part-time", "Weekly"][Math.floor(Math.random() * 3)],
              role: mentor.role || `${selectedIdea.domain} Expert`,
              company: mentor.company || "Independent Mentor",
              background: mentor.background || `Expert in ${selectedIdea.domain} with several years of experience.`,
              achievements: mentor.achievements || `Specialist in ${selectedIdea.domain} technologies and systems.`,
              imgUrl: mentor.imgUrl || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`
            }));
            
            setMentors(enrichedData);
            setFilteredMentors(enrichedData);
          } else {
            // Fall back to all mentors if no domain-specific ones
            response = await axios.get("http://localhost:5000/mentors");
            
            if (response.data && response.data.length > 0) {
              const allMentors = response.data.map(mentor => ({
                ...mentor,
                rating: mentor.rating || 4.5 + Math.random() * 0.5,
                reviews: mentor.reviews || Math.floor(Math.random() * 50) + 10,
                availability: mentor.availability || ["Full-time", "Part-time", "Weekly"][Math.floor(Math.random() * 3)],
                role: mentor.role || `${selectedIdea.domain} Expert`,
                company: mentor.company || "Independent Mentor",
                background: mentor.background || `Expert in ${selectedIdea.domain} with several years of experience.`,
                achievements: mentor.achievements || `Specialist in ${selectedIdea.domain} technologies and systems.`,
                imgUrl: mentor.imgUrl || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`
              }));
              
              // Filter mentors whose expertise matches the idea domain
              const relevantMentors = allMentors.filter(mentor => 
                mentor.expertise && mentor.expertise.some(skill => 
                  selectedIdea.domain.toLowerCase().includes(skill.toLowerCase()) ||
                  skill.toLowerCase().includes(selectedIdea.domain.toLowerCase())
                )
              );
              
              setMentors(relevantMentors.length > 0 ? relevantMentors : allMentors);
              setFilteredMentors(relevantMentors.length > 0 ? relevantMentors : allMentors);
            } else {
              // If API returns no mentors, use sample data from previous implementation
              setTimeout(() => {
                const domainMentors = sampleMentors.filter(mentor => 
                  mentor.expertise.some(skill => 
                    selectedIdea.domain.toLowerCase().includes(skill.toLowerCase()) ||
                    skill.toLowerCase().includes(selectedIdea.domain.toLowerCase())
                  )
                );
                setMentors(domainMentors.length > 0 ? domainMentors : sampleMentors);
                setFilteredMentors(domainMentors.length > 0 ? domainMentors : sampleMentors);
                setLoading(false);
              }, 800);
              return;
            }
          }
        } catch (e) {
          console.log("Error fetching mentors from API:", e);
          // Use sample data after a delay (from previous implementation)
          setTimeout(() => {
            const domainMentors = sampleMentors.filter(mentor => 
              mentor.expertise.some(skill => 
                selectedIdea.domain.toLowerCase().includes(skill.toLowerCase()) ||
                skill.toLowerCase().includes(selectedIdea.domain.toLowerCase())
              )
            );
            setMentors(domainMentors.length > 0 ? domainMentors : sampleMentors);
            setFilteredMentors(domainMentors.length > 0 ? domainMentors : sampleMentors);
            setLoading(false);
          }, 800);
          return;
        }
      } catch (error) {
        console.error("Error fetching mentors:", error);
        // Use sample data as fallback
        setMentors(sampleMentors);
        setFilteredMentors(sampleMentors);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [selectedIdea]);

  // Filter mentors based on user criteria
  useEffect(() => {
    if (!mentors.length) return;
    
    try {
      let results = [...mentors];
      
      if (filter.expertise) {
        results = results.filter(mentor => 
          mentor.expertise && mentor.expertise.some(skill => 
            skill.toLowerCase().includes(filter.expertise.toLowerCase())
          )
        );
      }
      
      if (filter.availability && filter.availability !== "Any") {
        results = results.filter(mentor => 
          mentor.availability === filter.availability
        );
      }
      
      if (filter.searchQuery) {
        results = results.filter(mentor => 
          mentor.name.toLowerCase().includes(filter.searchQuery.toLowerCase()) || 
          (mentor.expertise && mentor.expertise.some(skill => 
            skill.toLowerCase().includes(filter.searchQuery.toLowerCase())
          )) ||
          (mentor.background && mentor.background.toLowerCase().includes(filter.searchQuery.toLowerCase()))
        );
      }
      
      setFilteredMentors(results);
    } catch (error) {
      console.error("Error filtering mentors:", error);
      setFilteredMentors(mentors); // Reset to all mentors if filter fails
    }
  }, [filter, mentors]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prevFilter => ({
      ...prevFilter,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setFilter(prevFilter => ({
      ...prevFilter,
      searchQuery: e.target.value
    }));
  };

  const handleIdeaChange = (e) => {
    const ideaId = e.target.value;
    const idea = verifiedIdeas.find(idea => idea._id === ideaId);
    if (idea) setSelectedIdea(idea);
  };

  // New pitch functionality
  const handlePitch = async (mentorId) => {
    if (!selectedIdea || !mentorId) return;

    try {
      setLoading(true);
      
      const response = await axios.post("http://localhost:5000/pitch", {
        ideaId: selectedIdea._id,
        mentorId: mentorId
      });
      
      alert(`Pitched to mentor successfully! They will review your idea soon.`);
    } catch (error) {
      console.error("Error pitching to mentor:", error);
      alert("Failed to pitch to mentor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Original Connect functionality
  const handleConnectClick = async (mentorId) => {
    if (!selectedIdea || !mentorId) return;

    try {
      setLoading(true);
      
      // Try actual API request
      try {
        const response = await axios.post(`http://localhost:5000/ideas/${selectedIdea._id}/assign-mentor`, {
          mentorId: mentorId
        });
        
        alert("Mentor assigned successfully! They will contact you soon.");
        
        // Update the local verified ideas list with the assigned mentor
        const updatedIdeas = verifiedIdeas.map(idea => 
          idea._id === selectedIdea._id ? { ...idea, mentorId } : idea
        );
        setVerifiedIdeas(updatedIdeas);
        setSelectedIdea({ ...selectedIdea, mentorId });
      } catch (e) {
        // If assign fails, try the pitch approach
        await handlePitch(mentorId);
      }
    } catch (error) {
      console.error("Error connecting with mentor:", error);
      alert("There was an error connecting with the mentor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const availabilityOptions = ["Any", "Full-time", "Part-time", "Weekly"];

  // If not logged in, navigate to login
  if (!user) return null;

  const renderStatusIndicator = (status) => {
    if (status === "verified") {
      return <span className="idea-status-indicator approved" title="Idea Approved">✓</span>;
    } else if (status === "rejected") {
      return <span className="idea-status-indicator rejected" title="Idea Rejected">✗</span>;
    } else {
      return <span className="idea-status-indicator pending" title="Pending Review">⏳</span>;
    }
  };

  return (
    <div className="find-mentor-page">
      <Navbar />

      {/* Hero Section */}
      <section className="mentor-hero">
        <div className="mentor-hero-content">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Find Your Innovation Mentor
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {allowMentorSelection 
              ? "Connect with industry experts who can guide your project from concept to reality"
              : "Submit your innovation idea to get it verified by mentors before connecting"}
          </motion.p>
          
          {!allowMentorSelection && (
            <motion.div 
              className="verification-required"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <p className="verification-message">
                <span className="verification-icon">⚠️</span>
                You need at least one approved and mentor-verified idea to connect with mentors
              </p>
              <motion.button 
                className="submit-idea-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/idea-submission")}
              >
                Submit an Idea
              </motion.button>
            </motion.div>
          )}
        </div>

        <motion.div 
          className="mentor-hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="mentor-3d-scene">
            <div className="mentor-3d-object">
              <div className="mentor-globe">
                <div className="mentor-globe-circles">
                  <div className="globe-circle"></div>
                  <div className="globe-circle"></div>
                  <div className="globe-circle"></div>
                </div>
                <div className="mentor-icons">
                  <span className="mentor-icon">👩‍🔬</span>
                  <span className="mentor-icon">👨‍💻</span>
                  <span className="mentor-icon">👩‍🏫</span>
                  <span className="mentor-icon">👨‍🚀</span>
                  <span className="mentor-icon">👩‍⚕️</span>
                </div>
              </div>
              <div className="mentor-shadow"></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Only show remaining sections if user has verified ideas */}
      {allowMentorSelection && (
        <>
          {/* Idea Selection Section */}
          <section className="idea-selection-section">
            <div className="idea-selection-container">
              <h2>Select Your Verified Idea</h2>
              <p className="idea-selection-info">
                Choose the idea you want to find a mentor for. You'll only see mentors who specialize 
                in the domain of your selected idea.
              </p>
              
              <div className="idea-selector">
                <select 
                  value={selectedIdea?._id || ""}
                  onChange={handleIdeaChange}
                  className="idea-select"
                >
                  {verifiedIdeas.map(idea => (
                    <option key={idea._id} value={idea._id}>
                      {idea.title} ({idea.domain}) {renderStatusIndicator(idea.status)}
                    </option>
                  ))}
                </select>
                
                {selectedIdea && (
                  <div className="selected-idea-details">
                    <div className="selected-idea-domain">{selectedIdea.domain} / {selectedIdea.subDomain}</div>
                    <p className="selected-idea-description">
                      {selectedIdea.description && selectedIdea.description.length > 150 
                        ? `${selectedIdea.description.substring(0, 150)}...` 
                        : selectedIdea.description || "No description available"}
                    </p>
                    {selectedIdea.mentorId && (
                      <div className="existing-mentor-warning">
                        <span className="warning-icon">ℹ️</span>
                        This idea already has an assigned mentor: {selectedIdea.mentorId.name || "Unknown"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Search and Filter Section */}
          <section className="mentor-search-section">
            <div className="search-filters-container">
              <motion.div 
                className="mentor-search-bar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <input
                  type="text"
                  placeholder="Search by name or specific expertise..."
                  value={filter.searchQuery}
                  onChange={handleSearchChange}
                  className="mentor-search-input"
                />
                <span className="search-icon">🔍</span>
              </motion.div>
              
              <motion.div 
                className="mentor-filters"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="filter-group">
                  <label htmlFor="expertise">Specific Expertise:</label>
                  <input
                    type="text"
                    name="expertise"
                    id="expertise"
                    value={filter.expertise}
                    onChange={handleFilterChange}
                    placeholder="Filter by skill (e.g., AI, React, Biotech)"
                    className="expertise-filter"
                  />
                </div>
                
                <div className="filter-group">
                  <label htmlFor="availability">Availability:</label>
                  <select
                    name="availability"
                    id="availability"
                    value={filter.availability}
                    onChange={handleFilterChange}
                  >
                    {availabilityOptions.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            </div>
            
            <div className="results-summary">
              <p>
                {loading ? 'Loading mentors...' : 
                  filteredMentors.length === 0 ? 
                    'No mentors found matching your criteria' : 
                    `Found ${filteredMentors.length} ${filteredMentors.length === 1 ? 'mentor' : 'mentors'} for ${selectedIdea?.domain || ''}`
                }
              </p>
            </div>
          </section>

          {/* Mentors Grid */}
          <section className="mentors-grid-section">
            {loading ? (
              <div className="loading-container">
                <div className="loader">
                  <div className="loader-circle"></div>
                  <div className="loader-circle"></div>
                  <div className="loader-circle"></div>
                </div>
                <p>Finding your perfect mentors...</p>
              </div>
            ) : (
              <div className="mentors-grid">
                {filteredMentors.map((mentor, index) => (
                  <motion.div 
                    className="mentor-card"
                    key={mentor._id || `mentor-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  >
                    <div className="mentor-card-header">
                      <div className="mentor-avatar">
                        <img src={mentor.imgUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=random`} alt={mentor.name} />
                      </div>
                      <div className="mentor-rating">
                        <span className="rating-stars">
                          {'★'.repeat(Math.floor(mentor.rating || 4.5))}
                          {'☆'.repeat(5 - Math.floor(mentor.rating || 4.5))}
                        </span>
                        <span className="rating-value">{mentor.rating || 4.5} ({mentor.reviews || 10})</span>
                      </div>
                    </div>
                    
                    <div className="mentor-info">
                      <h3>{mentor.name}</h3>
                      <h4>{mentor.role || `${selectedIdea?.domain} Specialist`}</h4>
                      <p className="mentor-company">{mentor.company || "Independent Mentor"}</p>
                      
                      <div className="mentor-expertise">
                        {mentor.expertise?.map((skill, idx) => (
                          <span key={idx} className="expertise-tag">{skill}</span>
                        ))}
                      </div>
                      
                      <p className="mentor-background">{mentor.background || `Experienced ${selectedIdea?.domain} professional with a passion for mentoring.`}</p>
                      
                      <div className="mentor-achievements">
                        <h5>Key Achievements:</h5>
                        <p>{mentor.achievements || `Expert in ${mentor.expertise?.join(', ') || selectedIdea?.domain}`}</p>
                      </div>
                    </div>
                    
                    <div className="mentor-card-footer">
                      <div className="mentor-availability">
                        <span className={`availability-badge ${(mentor.availability || 'Weekly').toLowerCase().replace('-', '')}`}>
                          {mentor.availability || "Weekly"}
                        </span>
                      </div>
                      <button 
                        className="connect-button"
                        onClick={() => handleConnectClick(mentor._id)}
                        disabled={selectedIdea?.mentorId}
                      >
                        {selectedIdea?.mentorId ? "Already Connected" : "Connect"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {filteredMentors.length === 0 && !loading && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No mentors found</h3>
                <p>
                  {selectedIdea 
                    ? `No mentors currently available for ${selectedIdea.domain}. Please check back later.`
                    : "Please select a verified idea to see matching mentors"}
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default FindMentor;