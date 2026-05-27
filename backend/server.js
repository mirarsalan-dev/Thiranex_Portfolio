require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin
// Initialize Firebase using environment variables instead of a JSON file
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // 💡 The .replace execution handles how Vercel processes newline string escapes
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
    })
  });
}
const db = admin.firestore();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Analytics Middleware
app.use(async (req, res, next) => {
  // Only track GET requests to our API (e.g., viewing projects)
  if (req.method === 'GET' && req.path.startsWith('/api/projects')) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const route = req.path;
      
      // We increment the hit counter for this specific day and route
      const statRef = db.collection('analytics').doc(`${today}`);
      
      await statRef.set({
        [route]: admin.firestore.FieldValue.increment(1),
        lastAccessed: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Analytics tracking failed silently", error);
    }
  }
  next(); // Continue to the actual route!
});

// --- API ROUTES ---

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projectsRef = db.collection('projects');
    const snapshot = await projectsRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No projects found' });
    }

    let projects = [];
    snapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// --- NEW: Get a single project by ID ---
app.get('/api/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const projectRef = db.collection('projects').doc(projectId);
    const doc = await projectRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// --- NEW: Get GitHub Stats ---
// --- Get GitHub Stats ---
app.get('/api/github-stats', async (req, res) => {
  try {
    // 💡 REPLACE 'octocat' with your actual GitHub username!
    const githubUsername = 'mirarsalan-dev'; 

    const response = await fetch(`https://api.github.com/users/${githubUsername}`, {
      headers: {
        'User-Agent': 'Portfolio-Backend-App',
        // NEW: Add your secret token to bypass rate limits!
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
      }
    });

    if (!response.ok) {
      console.error(`GitHub API Error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ error: 'Failed to fetch data from GitHub' });
    }

    const data = await response.json();

    const profileStats = {
      name: data.name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      htmlUrl: data.html_url
    };

    res.status(200).json(profileStats);
  } catch (error) {
    console.error('GitHub API Error:', error);
    res.status(500).json({ error: 'Internal server error fetching GitHub stats' });
  }
});

// --- NEW: Security Middleware ---
// This intercepts requests and ensures a valid Firebase user is making them
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Verify the token using the Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to the request
    next(); // Pass control to the actual route
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// --- NEW: Secure POST Route (Create Project) ---
// Notice we inject `verifyToken` in the middle to protect it!
app.post('/api/projects', verifyToken, async (req, res) => {
  try {
    const newProject = {
      title: req.body.title,
      description: req.body.description,
      githubLink: req.body.githubLink,
      content: req.body.content, // The Markdown string
      technologies: req.body.technologies, // Array of strings
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('projects').add(newProject);
    res.status(201).json({ id: docRef.id, message: 'Project created successfully!' });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- NEW: AI Chatbot Route ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    // We use gemini-1.5-flash as it is lightning fast and supports system instructions
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are the personal AI assistant for a Full-Stack Developer. 
      Your goal is to answer questions from recruiters and hiring managers. 
      Keep answers concise, professional, and friendly. 
      Do NOT invent skills or experience. 
      Core Skills: React, Node.js, Firebase, Tailwind CSS, Framer Motion.
      Goal: Encourage them to read the case studies or send an email to hire@myportfolio.com.`
    });

    // Start a chat session, passing in the previous messages for context
    const chat = model.startChat({
      history: history || [],
    });

    // Send the recruiter's new message
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'The AI assistant is currently unavailable.' });
  }
});

const PDFDocument = require('pdfkit');

app.get('/api/download-resume', async (req, res) => {
  try {
    // 1. Fetch your live data from Firestore
    const snapshot = await db.collection('projects').limit(3).get();
    
    // 2. Set headers to tell the browser this is a PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=My_Live_Resume.pdf');

    // 3. Initialize PDFKit and pipe it straight to the HTTP response
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // 4. Draw the document
    doc.fontSize(24).text('Full-Stack Developer Resume', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Generated dynamically from my live Firebase database.', { align: 'center', color: 'gray' });
    doc.moveDown(2);

    snapshot.forEach(docSnapshot => {
      const project = docSnapshot.data();
      doc.fontSize(16).fillColor('black').text(project.title);
      doc.fontSize(12).fillColor('gray').text(project.description);
      doc.fontSize(10).fillColor('blue').text(project.githubLink);
      doc.moveDown();
    });

    // 5. Finalize the PDF (this closes the stream and sends it to the user)
    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Start Server
// Only start the server locally if NOT running on Vercel production
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// CRITICAL: Export the app for Vercel serverless environment
module.exports = app;