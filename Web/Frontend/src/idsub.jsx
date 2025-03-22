import React, { useState } from "react";
import "./styles/IdeaSubmission.css";
import Navbar from "./components/Navbar";

const domainData = {
  Tech: ["Computer Science", "Electronics", "Mechanical", "AI/ML", "Cybersecurity"],
  Medicine: ["General Medicine", "Surgery", "Pediatrics", "Pharmacy", "Dentistry"],
  Business: ["Marketing", "Finance", "Entrepreneurship", "Human Resources", "Operations"],
  Arts: ["Music", "Painting", "Literature", "Performing Arts", "History"],
};

export default function IdeaSubmission() {
  const [formData, setFormData] = useState({
    title: "",
    domain: "",
    subDomain: "",
    tags: "",
    description: "",
    uid: "",
    pdf: null,
  });

  const [subDomains, setSubDomains] = useState([]);

  // Handle domain selection
  const handleDomainChange = (e) => {
    const domain = e.target.value;
    setFormData({ ...formData, domain, subDomain: "" });
    setSubDomains(domainData[domain] || []);
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFormData({ ...formData, pdf: e.target.files[0] });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = new FormData();
    submissionData.append("title", formData.title);
    submissionData.append("domain", formData.domain);
    submissionData.append("subDomain", formData.subDomain);
    submissionData.append("tags", formData.tags);
    submissionData.append("description", formData.description);
    submissionData.append("uid", formData.uid);
    if (formData.pdf) {
      submissionData.append("pdf", formData.pdf);
    }

    try {
      const response = await fetch("http://localhost:5000/ideas", {
        method: "POST",
        body: submissionData,
      });

      const result = await response.json();
      if (response.ok) {
        alert("Idea submitted successfully!");
        setFormData({
          title: "",
          domain: "",
          subDomain: "",
          tags: "",
          description: "",
          uid: "",
          pdf: null,
        });
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting idea:", error);
      alert("Failed to submit idea.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Submit Your Idea</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Idea Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter your idea title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Domains</label>
            <select name="domain" className="border p-2 w-full" onChange={handleDomainChange} required>
              <option value="">Select a domain</option>
              {Object.keys(domainData).map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sub-Domains</label>
            <select
              name="subDomain"
              className="border p-2 w-full"
              onChange={handleChange}
              disabled={!formData.domain}
              required
            >
              <option value="">Select a sub-domain</option>
              {subDomains.map((sub, index) => (
                <option key={index} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              name="tags"
              placeholder="Enter tags (comma-separated)"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Project Description</label>
            <textarea
              name="description"
              placeholder="Describe your project"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Attach PDF (optional)</label>
            <input type="file" name="pdf" onChange={handleFileChange} />
          </div>

          <div className="form-group">
            <label>Unique UID</label>
            <input
              type="text"
              name="uid"
              placeholder="Your unique UID"
              value={formData.uid}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
}
