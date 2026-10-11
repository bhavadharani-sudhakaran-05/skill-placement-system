# SkillForge — Skill Development and Placement Recommendation System

SkillForge is a MERN stack web application designed to help students develop technical skills and prepare for placement opportunities. It combines resume analysis, skill assessments, learning resources, job listings, and progress tracking in one platform.

The goal is to help students identify skill gaps, improve their technical abilities, explore learning opportunities, and discover relevant job openings.

## 🚀 Live Demo

| Resource | Link |
|---|---|
| **Live Application** | [Open SkillForge](https://skill-placement-system-1.onrender.com/) |
| **Backend Service** | [Backend API](https://skill-placement-system.onrender.com) |
| **GitHub Repository** | [View Source Code](https://github.com/bhavadharani-sudhakaran-05/skill-placement-system) |

## ✨ Key Features

### 1. Resume Analyzer
- Upload and analyze resumes.
- Extract relevant information, including skills and project details.
- Review resume analysis results and improvement suggestions.

### 2. Skill Assessments
- Evaluate technical knowledge.
- Identify areas for improvement.
- Review assessment results.

### 3. Learning Paths
- Explore learning resources to improve technical skills.
- Follow available learning recommendations.
- Track learning progress where supported by the application.

### 4. Job Listings
- Browse job opportunities.
- View job details and application links.
- Explore relevant career opportunities.

### 5. Student Dashboard
- Access the application's main features from one place.
- Navigate between resume, learning, assessment, and job features.

### 6. Analytics Dashboard
- Review available skill development information.
- View learning and progress-related analytics.

## 🛠️ Technologies Used

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3 |
| Routing and API Requests | React Router, Axios |
| Backend | Node.js, Express.js, REST APIs |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Development Tools | Code0, Visual Studio Code, Git, GitHub, npm |
| Deployment | Render |

## 📁 Project Structure

```text
skill-placement-system/
│
├── backend/
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── models/
│   │   ├── Assessment.js
│   │   ├── Course.js
│   │   ├── Feedback.js
│   │   ├── index.js
│   │   ├── Job.js
│   │   ├── LearningPath.js
│   │   ├── Skill.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── analytics.routes.js
│   │   ├── assessment.routes.js
│   │   ├── auth.routes.js
│   │   ├── course.routes.js
│   │   ├── feedback.routes.js
│   │   ├── job.routes.js
│   │   ├── learningPath.routes.js
│   │   ├── recommendation.routes.js
│   │   ├── resume.routes.js
│   │   ├── skill.routes.js
│   │   └── user.routes.js
│   │
│   ├── services/
│   │   ├── analytics.service.js
│   │   ├── feedbackLoop.service.js
│   │   ├── learningPath.service.js
│   │   ├── recommendation.service.js
│   │   ├── resumeAi.service.js
│   │   ├── resumeAnalysis.service.js
│   │   ├── resumeParser.service.js
│   │   └── skillGap.service.js
│   │
│   ├── tests/
│   │   ├── fixtures/
│   │   └── resumeAnalyzer.test.js
│   │
│   ├── uploads/
│   │   └── resumes/
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   ├── seedDatabase.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── layout/
│   │   │       └── Layout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Assessments.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── JobDetail.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LearningPath.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ResumeAnalyzer.jsx
│   │   │
│   │   ├── store/
│   │   │   ├── assessmentStore.js
│   │   │   ├── authStore.js
│   │   │   └── courseStore.js
│   │   │
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   │
│   ├── .env.development
│   ├── .env.production
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## 🔄 Application Workflow

```mermaid
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
```

## 📋 Prerequisites

Before running SkillForge locally, install:

- [Node.js and npm](https://nodejs.org/)
- [Git](https://git-scm.com/)
- A MongoDB Atlas account or another configured MongoDB instance
- Visual Studio Code (recommended)

## ⚙️ Installation and Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/bhavadharani-sudhakaran-05/skill-placement-system.git
cd skill-placement-system
```

### Step 2: Install backend dependencies

```bash
cd backend
npm install
```

### Step 3: Configure environment variables

Create the backend environment file required by the application. Configure the MongoDB connection string, port, and any other required settings.

Example configuration:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

Use the exact variable names expected by your backend code. Additional settings, such as authentication secrets and the Gemini API key, may be required for particular features.

**Security:** Never commit passwords, database credentials, JWT secrets, API keys, or other sensitive values to GitHub.

### Step 4: Start the backend

From the `backend` directory, run:

```bash
npm run dev
```

Alternatively, if the development script is not configured:

```bash
npm start
```

Keep the backend terminal running.

### Step 5: Install frontend dependencies

Open a second terminal and navigate to the project root, then run:

```bash
cd frontend
npm install
```

Configure the frontend API URL using the environment variable expected by your application.

For the deployed environment, the backend URL is:

`https://skill-placement-system.onrender.com`

### Step 6: Start the frontend

From the `frontend` directory, run:

```bash
npm start
```

Open the local URL displayed in the terminal.

### Step 7: Create a production build

From the project root, run:

```bash
npm --prefix frontend run build
```

The optimized production files will be generated in the `frontend/build` directory.

## 🧪 Testing

### Backend tests

```bash
npm --prefix backend test
```

### Frontend tests

```bash
npm --prefix frontend test
```

### Production build verification

```bash
npm --prefix frontend run build
```

Run the commands supported by your package scripts and review the output for errors or warnings.

## 🌐 Deployment

SkillForge is hosted on Render.

- **Frontend:** [SkillForge Live Application](https://skill-placement-system-1.onrender.com/)
- **Backend:** [SkillForge Backend Service](https://skill-placement-system.onrender.com)
- **Source Code:** [GitHub Repository](https://github.com/bhavadharani-sudhakaran-05/skill-placement-system)

The React frontend communicates with the Node.js and Express backend through API requests. The backend connects to MongoDB Atlas and uses configured environment variables for database access and other integrations.

## 🤖 Code0 Development Workflow

Code0 was used during the development of SkillForge as part of an AI-assisted development workflow.

It supported selected implementation, debugging, refactoring, and testing tasks. Generated suggestions were reviewed against the application's expected behavior, and changes were validated through code review and testing where appropriate.

Git and GitHub were used to track changes, maintain commit history, and host the project for review.

## 🧠 AI Development Experience

AI-assisted development helped investigate technical issues, review code changes, and improve selected parts of the application. Code0 supported work across frontend components, backend logic, API data flow, and testing.

### Specific Tasks Where Code0 Helped

1. **Frontend Component Development:** Investigated resume analyzer rendering and mapping extracted project information to frontend components.
2. **Backend Logic and Validation:** Reviewed resume analysis logic and validation behavior.
3. **Debugging:** Investigated the TCS Software Engineer application link used by the Jobs page.
4. **API and Database Integration:** Traced job data returned by the backend and verified the updated job website URL in MongoDB Atlas.
5. **Testing and Refactoring:** Updated resume analyzer test cases and regression coverage for project extraction behavior.

These examples describe tasks performed during development. The implementation and validation approach can be explained further during a technical interview.

## 🔧 Git and GitHub Practices

- Used Git to track source-code changes and maintain commit history.
- Hosted the project in a public GitHub repository.
- Used Code0's terminal for Git operations during development.
- Reviewed changes before committing and pushing them.
- Kept sensitive configuration values out of version control.

## 🔮 Future Enhancements

- Improve personalized learning recommendations.
- Expand job matching and skill gap analysis.
- Add more technical assessment categories.
- Enhance progress reporting and data visualization.
- Improve the overall user experience and responsiveness.

## 👩‍💻 Author

**Bhavadharani S**

**Project:** SkillForge — Skill Development and Placement Recommendation System

**GitHub:** [bhavadharani-sudhakaran-05](https://github.com/bhavadharani-sudhakaran-05)