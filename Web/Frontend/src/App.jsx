import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IdeaSubmission from './IdeaSubmission';
import FindMentor from './FindMentor';
import UserProfile from './UserProfile';
import HomePage from './HomePage';
import IdeaVerification from './IdeaVerification';
import Register from "./Register";
import Login from "./Login";
import IdeaBot from "./components/IdeaBot";
import AdminDashboard from './AdminDashboard';
import IdeaStatus from './IdeaStatus';
import MentorDashboard from './MentorDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/idea-submission" element={<IdeaSubmission />} />
        <Route path="/find-mentor" element={<FindMentor />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/idea-verification" element={<IdeaVerification />} />
        <Route path="/idea-bot" element={<IdeaBot />} />
        <Route path="/idea-status" element={<IdeaStatus />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/mentor/dashboard" element={<MentorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;