import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/IdeaBot.css";

const IdeaBot = () => {
    const [userInput, setUserInput] = useState("");
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buttonClicked, setButtonClicked] = useState(false);
    const [showTips, setShowTips] = useState(true);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Initial welcome message
        setResponses([
            { 
                ai: "👋 Welcome to ThinkBridZ's AI Assistant! I can help you brainstorm innovative project ideas, refine existing concepts, and explore emerging technologies. How can I assist with your innovation journey today?", 
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            }
        ]);
        
        // Focus the input field when component mounts
        inputRef.current?.focus();
    }, []);

    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || loading) return;

        setButtonClicked(true);
        setTimeout(() => setButtonClicked(false), 300);
        
        setLoading(true);
        setShowTips(false); // Hide tips when conversation starts
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const newResponse = { user: userInput, time: timestamp };
        setResponses((prev) => [...prev, newResponse]);
        setUserInput("");

        try {
            // For demo purposes, simulate API response
            setTimeout(() => {
                const aiResponseText = getAIResponse(userInput);
                const aiResponse = { ai: aiResponseText, time: timestamp };
                setResponses((prev) => [...prev, aiResponse]);
                setLoading(false);
            }, 1500);
        } catch (error) {
            console.error("Error:", error);
            setResponses((prev) => [...prev, { ai: "⚠️ I'm having trouble connecting to my knowledge base. Please try again in a moment.", time: timestamp }]);
            setLoading(false);
        }
    };

    // Simulate AI responses for demonstration
    const getAIResponse = (input) => {
        const lowercasedInput = input.toLowerCase();
        
        if (lowercasedInput.includes("hello") || lowercasedInput.includes("hi")) {
            return "Hello there! I'm excited to help with your innovation journey today. Would you like to brainstorm a new idea, refine an existing concept, or explore technologies for your project?";
        } else if (lowercasedInput.includes("idea") || lowercasedInput.includes("concept")) {
            return "Great! I'd love to help develop your idea. Could you share more details about:\n\n- **What problem** does your solution address?\n- **Who** are the target users or beneficiaries?\n- **What technologies** might be involved?\n- **What impact** do you hope to achieve?\n\nThe more specific you can be, the better feedback I can provide!";
        } else if (lowercasedInput.includes("help") || lowercasedInput.includes("assistance")) {
            return "I'm here to be your innovation partner! Here's how I can assist you:\n\n- **Brainstorm** fresh ideas based on your interests or chosen domain\n- **Refine** your existing concepts with structured feedback\n- **Suggest technologies** that could enhance your idea\n- **Analyze market potential** and identify target users\n- **Identify challenges** and potential solutions\n- **Connect your idea** to relevant domains and trends\n\nJust let me know where you'd like to start!";
        } else if (lowercasedInput.includes("technology") || lowercasedInput.includes("tech")) {
            return "Exploring cutting-edge technologies is exciting! Here are some innovation-driving technologies to consider:\n\n1. **AI/Machine Learning** - For predictive analytics, automation, and personalization\n2. **Blockchain** - For secure, transparent, decentralized systems\n3. **IoT** - For connecting physical devices to digital platforms\n4. **AR/VR** - For immersive experiences and training simulations\n5. **Green Tech** - For sustainable, environmentally conscious solutions\n6. **Quantum Computing** - For solving complex computational problems\n7. **Biotechnology** - For healthcare innovations and sustainable materials\n\nWhich domain aligns most closely with your interests?";
        } else if (lowercasedInput.includes("challenge") || lowercasedInput.includes("problem")) {
            return "Identifying the right problem is half the solution! Consider these approaches:\n\n- **Observe daily frictions** in your own life or community\n- **Research UN's Sustainable Development Goals** for global challenges\n- **Interview potential users** to understand their pain points\n- **Look for inefficiencies** in existing systems\n- **Consider accessibility issues** in current solutions\n\nIs there a specific sector where you've noticed problems that need solving?";
        } else if (lowercasedInput.includes("validate") || lowercasedInput.includes("feedback")) {
            return "Validating your idea is crucial before deep investment! Here are effective approaches:\n\n1. **Create a simple landing page** to gauge interest\n2. **Develop a minimal prototype** for user testing\n3. **Conduct structured interviews** with potential users\n4. **Run small-scale experiments** to test key assumptions\n5. **Use social media polls** for quick feedback\n6. **Present at innovation meetups** for expert opinions\n\nWould you like me to help you design a validation strategy for your specific idea?";
        } else {
            return "That's an interesting direction! To develop this concept further, consider these key questions:\n\n1. What specific **problem** are you solving?\n2. How is your approach **different** from existing solutions?\n3. What **resources** would you need to create a prototype?\n4. How might you **test** your concept with potential users?\n5. What **metrics** would indicate success?\n\nI'd be happy to explore any of these areas in more depth - just let me know which aspect you'd like to focus on next!";
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [responses]);

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="ideabot-page">
            <Navbar />
            <div className="floating-shapes">
                <div className="shape circle1"></div>
                <div className="shape circle2"></div>
                <div className="shape square1"></div>
                <div className="shape triangle1"></div>
                <div className="shape plus1">+</div>
                <div className="shape cross1">×</div>
                <div className="shape dots1">
                    <span></span><span></span><span></span>
                </div>
                <div className="shape circle3"></div>
                <div className="shape zigzag"></div>
                <div className="shape square2"></div>
            </div>
            
            <div className="idea-bot-container">
                <motion.div 
                    className="cbt-ai-container"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="ai-assistant-header">
                        <motion.div 
                            className="ai-brain"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="brain-container">
                                <div className="brain-icon">
                                    <div className="brain-pulse"></div>
                                </div>
                                <div className="brain-connections">
                                    <div className="connection c1"></div>
                                    <div className="connection c2"></div>
                                    <div className="connection c3"></div>
                                    <div className="connection c4"></div>
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.h2 
                            className="cbt-ai-title"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            ThinkBridZ Assistant
                        </motion.h2>
                        
                        <motion.p 
                            className="cbt-ai-subtitle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        >
                            Your AI partner for brainstorming, refining, and exploring innovative ideas
                        </motion.p>
                    </div>
                    
                    <div className="cbt-ai-chatbox">
                        <AnimatePresence initial={false}>
                            {responses.map((res, index) => (
                                <motion.div 
                                    key={index} 
                                    className="cbt-ai-message"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {res.user && (
                                        <div className="cbt-ai-user">
                                            <div className="avatar-user">You</div>
                                            <div className="cbt-ai-message-content">{res.user}</div>
                                            <span className="timestamp">{res.time}</span>
                                        </div>
                                    )}
                                    {res.ai && (
                                        <div className="cbt-ai-ai">
                                            <div className="avatar-ai">
                                                <span className="bot-emoji">🤖</span>
                                            </div>
                                            <div className="cbt-ai-message-content">
                                                <ReactMarkdown>{res.ai}</ReactMarkdown>
                                            </div>
                                            <span className="timestamp">{res.time}</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        {loading && (
                            <motion.div 
                                className="cbt-ai-loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="cbt-ai-ai typing-indicator">
                                    <div className="avatar-ai">
                                        <span className="bot-emoji">🤖</span>
                                    </div>
                                    <div className="cbt-ai-dots">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form className="cbt-ai-form" onSubmit={handleSubmit}>
                        <div className="cbt-ai-input-container">
                            <input
                                ref={inputRef}
                                type="text"
                                value={userInput}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                                placeholder="Type your innovation question or idea..."
                                className="cbt-ai-input"
                                disabled={loading}
                            />
                            <motion.button 
                                type="submit" 
                                className="cbt-ai-button" 
                                disabled={loading || !userInput.trim()}
                                animate={buttonClicked ? { scale: 0.95 } : { scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 500, damping: 17 }}
                            >
                                <span className="button-text">
                                    {loading ? "Thinking..." : "Send"}
                                </span>
                                <span className="button-icon">
                                    {loading ? "⏳" : "✨"}
                                </span>
                            </motion.button>
                        </div>
                    </form>

                    <AnimatePresence>
                        {showTips && (
                            <motion.div 
                                className="cbt-ai-tips"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h3>Get the most from your AI innovation assistant:</h3>
                                <div className="tips-container">
                                    <motion.div 
                                        className="tip-card"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <div className="tip-icon">💡</div>
                                        <div className="tip-content">
                                            <h4>Be Specific</h4>
                                            <p>Provide details about your idea, target audience, and goals</p>
                                        </div>
                                    </motion.div>
                                    <motion.div 
                                        className="tip-card"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        <div className="tip-icon">🔄</div>
                                        <div className="tip-content">
                                            <h4>Iterate</h4>
                                            <p>Follow up with questions to refine concepts and go deeper</p>
                                        </div>
                                    </motion.div>
                                    <motion.div 
                                        className="tip-card"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        <div className="tip-icon">🌱</div>
                                        <div className="tip-content">
                                            <h4>Start Simple</h4>
                                            <p>Begin with core concepts before expanding to details</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="cbt-ai-suggestions">
                        <p className="suggestion-title">Try asking about:</p>
                        <div className="suggestion-chips">
                            <motion.button 
                                onClick={() => setUserInput("Help me brainstorm an innovation for sustainability")}
                                className="suggestion-chip"
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="chip-icon">🌿</span>
                                Sustainability ideas
                            </motion.button>
                            <motion.button 
                                onClick={() => setUserInput("What emerging technologies should I explore for healthcare?")}
                                className="suggestion-chip"
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="chip-icon">⚕️</span>
                                Healthcare tech
                            </motion.button>
                            <motion.button 
                                onClick={() => setUserInput("How can I validate my startup concept?")}
                                className="suggestion-chip"
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="chip-icon">🔍</span>
                                Idea validation
                            </motion.button>
                            <motion.button 
                                onClick={() => setUserInput("What problem areas have the most potential for innovation?")}
                                className="suggestion-chip"
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="chip-icon">🎯</span>
                                Problem spaces
                            </motion.button>
                        </div>
                    </div>

                    <div className="ai-features">
                        <h3>Powered by Advanced AI</h3>
                        <div className="feature-grid">
                            <div className="feature">
                                <div className="feature-icon">🔍</div>
                                <h4>Domain Knowledge</h4>
                                <p>Technology, business, science, and more</p>
                            </div>
                            <div className="feature">
                                <div className="feature-icon">🔄</div>
                                <h4>Iterative Process</h4>
                                <p>Refine ideas through guided conversation</p>
                            </div>
                            <div className="feature">
                                <div className="feature-icon">📊</div>
                                <h4>Structured Framework</h4>
                                <p>Systematic approach to ideation</p>
                            </div>
                            <div className="feature">
                                <div className="feature-icon">🚀</div>
                                <h4>Innovation Focus</h4>
                                <p>Design for novelty and impact</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default IdeaBot;
