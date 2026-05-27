require('dotenv').config();
const admin = require('firebase-admin');

// 1. Initialize Firebase Admin
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 2. Define the Seed Data
const sampleProjects = [
  {
    title: "E-Commerce Storefront",
    description: "A full-stack shopping cart application with secure checkout and user authentication.",
    githubLink: "https://github.com/yourusername/ecommerce",
    technologies: ["React", "Node.js", "Firebase", "Stripe"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Weather Dashboard",
    description: "A clean, responsive dashboard pulling real-time meteorological data from a public API.",
    githubLink: "https://github.com/yourusername/weather-app",
    technologies: ["React", "Vite", "Axios", "CSS"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    title: "Task Management API",
    description: "A RESTful backend service for managing daily tasks and team collaboration.",
    githubLink: "https://github.com/yourusername/task-api",
    technologies: ["Node.js", "Express", "REST"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// 3. Create the Seeding Function
const seedDatabase = async () => {
  console.log("Starting database seeding...");
  
  try {
    const projectsRef = db.collection('projects');

    // Loop through the array and add each project to Firestore
    for (const project of sampleProjects) {
      // .add() automatically generates a unique ID for the document
      await projectsRef.add(project);
      console.log(`Successfully added: ${project.title}`);
    }

    console.log("Database seeding complete!");
    process.exit(0); // Exit the script successfully
    
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1); // Exit with an error code
  }
};

// 4. Run the function
seedDatabase();