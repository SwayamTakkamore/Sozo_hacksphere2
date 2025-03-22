import axios from 'axios';

export const getUserRole = async (email) => {
  return await axios.post('http://localhost:5000/user-role', { email });
};

export const getPitchedIdeas = async (mentorId) => {
  return await axios.get(`http://localhost:5000/pitches/${mentorId}`);
};

export const sendPitch = async (ideaId, mentorId) => {
  return await axios.post('http://localhost:5000/pitch', { ideaId, mentorId });
};