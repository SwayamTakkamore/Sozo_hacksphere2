const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// POST route to handle chat requests
app.post("/chat", async (req, res) => {
    try {
        const prompt = req.body.prompt;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const ollama = spawn("ollama", ["run", "idea-refiner"], { shell: true });

        let responseText = "";

        ollama.stdout.on("data", (data) => {
            responseText += data.toString();
        });

        ollama.stderr.on("data", (data) => {
            console.error(`Ollama Error: ${data.toString()}`);
        });

        ollama.on("error", (err) => {
            console.error("Failed to start Ollama:", err);
            return res.status(500).json({ error: "Failed to start Ollama" });
        });

        ollama.on("close", (code) => {
            if (code === 0) {
                res.json({ response: responseText.trim() });
            } else {
                res.status(500).json({ error: "Ollama failed to respond" });
            }
        });

        // Send input and close stdin properly
        ollama.stdin.write(prompt + "\n");
        ollama.stdin.end();
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT} and accessible to other devices.`);
});