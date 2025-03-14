require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
console.log("JWT Secret:", process.env.JWT_SECRET);


const app = express();
app.use(express.json());

// Dummy User Database
const users = [{ id: 1, username: "admin", password: "password" }];

// Login Route (Generates JWT Token)
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if user exists
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
});

// Middleware to Verify Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    console.log("Auth Header Received:", authHeader); // Log header

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Access Denied: No Token Provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token); // Log extracted token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("JWT Verification Error:", err.message); // Log error details
            return res.status(403).json({ message: "Access Denied: Invalid Token" });
        }

        console.log("Verified User:", user); // Log user payload
        req.user = user;
        next();
    });
};


// Protected Route
app.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "Access Granted", user: req.user });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
