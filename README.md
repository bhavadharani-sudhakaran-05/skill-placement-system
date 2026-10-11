SkillForge — Skill Development and Placement Recommendation System

1. Project Description

SkillForge is a MERN stack web application designed to help students develop technical skills and prepare for placement opportunities. It brings resume analysis, skill assessments, learning resources, job listings, and progress-related features together in one platform.

The main goal of SkillForge is to help students understand their skills, identify areas for improvement, explore learning opportunities, and discover relevant job openings.

2. Key Features

-> Resume Analyzer: Upload and analyze resumes to extract relevant information, including skills and project details.
-> Skill Assessments: Evaluate technical knowledge and identify areas for improvement.
-> Learning Paths: Explore learning resources to improve technical skills.
-> Job Listings: Browse job opportunities, view job details, and access application links.
-> Student Dashboard: Access the application's main features from one place.
-> Analytics Dashboard: Review available skill development and learning progress information.

3. Technologies Used

 Frontend
-> React.js
-> JavaScript
-> HTML5
-> CSS3
-> React Router
-> Axios

 Backend
-> Node.js
-> Express.js
-> REST APIs
-> Mongoose

 Database
-> MongoDB Atlas

 Development Tools
-> Code0
-> Visual Studio Code
-> Git
-> GitHub
-> npm

 4. Project Structure

SkillForge-codezero/
├── backend/
│   ├── services/
│   │   ├── resumeAi.service.js
│   │   └── resumeAnalysis.service.js
│   ├── tests/
│   │   ├── fixtures/
│   │   └── resumeAnalyzer.test.js
│   ├── seedDatabase.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   └── pages/
│   └── package.json
├── .gitignore
└── README.md

This is a simplified view of the project structure, showing selected files and folders.

 5. Workflow Diagram

flowchart TD
    A([Start]) --> B[Open SkillForge]
    B --> C[Register or Log In]
    C --> D[Student Dashboard]

    D --> E[Resume Analyzer]
    D --> F[Skill Assessments]
    D --> G[Learning Paths]
    D --> H[Job Listings]
    D --> I[Analytics Dashboard]

    E --> J[Review Resume Results]
    F --> K[Review Assessment Results]
    G --> L[Improve Technical Skills]
    H --> M[View Job Details and Apply]
    I --> N[Review Progress]

    J --> O([Continue Learning])
    K --> O
    L --> O
    M --> O
    N --> O


 6. Prerequisites

Before running SkillForge, install the following:

- Node.js and npm
- Git
- A MongoDB Atlas account or another configured MongoDB instance
- Visual Studio Code (recommended)

 7. Setup and Installation

 Step 1: Clone the Repository

Replace the placeholder with your public GitHub repository URL.

git clone https://github.com/bhavadharani-sudhakaran-05/skill-placement-system
cd SkillForge-codezero

 Step 2: Install Backend Dependencies

From the project root, run:

cd backend
npm install

 Step 3: Configure Backend Environment Variables

Create the backend environment file required by the application and configure the necessary environment variables, including the MongoDB connection string and port if required.

Check the backend configuration for the exact variable names.

Security: Never commit database credentials, JWT secrets, API keys, or other sensitive values to GitHub.

 Step 4: Start the Backend

From the `backend` directory, run:

npm run dev

This starts the backend using the development script configured in `backend/package.json`.

Alternatively, run the production-style start script:

npm start

 Step 5: Install Frontend Dependencies

Open a second terminal from the project root and run:

cd frontend
npm install

Configure the frontend API URL or other environment variables if required by the application.

 Step 6: Start the Frontend

From the `frontend` directory, run:

npm start

Open the local URL displayed in the terminal.

 Step 7: Build the Frontend

From the `frontend` directory, run:

npm run build

The optimized production files will be generated in the `frontend/build` directory.

 8. Testing

Backend Tests

Run the backend test suite from the project root:

npm --prefix backend test

Frontend Tests

Run the frontend test runner:

npm --prefix frontend test

Production Build

Verify that the frontend builds successfully:

npm --prefix frontend run build

9. Code0 Development Workflow

Code0 was used during the development of SkillForge as part of an AI-assisted development workflow.

It supported selected implementation, debugging, refactoring, and testing tasks. AI-generated suggestions were reviewed and validated against the application's expected behavior rather than accepted without checking.

10. AI Development Experience

Using Code0 helped investigate technical issues, review code changes, and improve selected parts of the application. It supported development across frontend components, backend logic, API data flow, and testing.

AI assistance was used as a development aid, while implementation decisions and validation remained part of the development process. Changes were checked through code review, application testing, and debugging where appropriate.

Specific Tasks Where Code0 Helped

1. Frontend Component Development: Assisted with investigating resume analyzer rendering and mapping extracted project information to frontend components.
2. Backend Logic and Validation: Assisted with reviewing resume analysis logic and refining validation behavior.
3. Debugging: Assisted with investigating the TCS Software Engineer application link used by the Jobs page.
4. API and Database Integration: Assisted with tracing job data returned by the backend and verifying the updated job website URL in MongoDB Atlas.
5. Testing and Refactoring: Assisted with updating resume analyzer test cases and adding regression coverage for project extraction behavior.

These examples describe tasks performed during development. The implementation and validation approach can be explained further during a technical interview.

11. Git and GitHub Practices

Git was used to track source-code changes and maintain a commit history. GitHub is used to host the project repository for review.

Code0's terminal was used for Git operations during the development workflow.

12. Future Enhancements

-> Improve personalized learning recommendations.
-> Expand job matching and skill gap analysis.
-> Add more assessment categories.
-> Improve progress reporting and visualization.

13. Author

Bhavadharani S

Project: SkillForge — Skill Development and Placement Recommendation System

