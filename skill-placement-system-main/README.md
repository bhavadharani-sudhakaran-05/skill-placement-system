# SkillForge - Intelligent Skill Development and Placement Recommendation System

## 🚀 MERN Stack Application for SIH (Smart India Hackathon)

A comprehensive platform that bridges the gap between education and industry by providing AI-powered skill development and placement recommendations.

---

## ⭐ 7 Unique Features

### 1. AI-Based Skill Gap Analyzer

- Analyzes current skills vs industry requirements
- Identifies missing skills with priority levels
- Provides personalized improvement roadmap

### 2. Personalized Placement Recommendation Engine

- ML-powered job matching algorithm
- Considers skills, interests, and application history
- Smart ranking based on match percentage

### 3. Real-Time Skill Demand Tracker

- Tracks industry skill demands in real-time
- Predicts emerging skill trends
- Alerts users about trending skills

### 4. AI-Powered Resume Parsing & Optimization

- Extracts skills, projects, certifications
- Provides ATS compatibility score
- Suggests improvements for better visibility

### 5. Adaptive Learning Path Generator

- Creates personalized learning paths
- Adapts based on progress and performance
- Recommends courses from beginner to advanced

### 6. College & Recruiter Analytics Dashboard

- Skill trend analytics for institutions
- Placement probability predictions
- Course effectiveness metrics

### 7. Feedback Loop Learning Model

- Placement outcomes feed back into system
- Continuous improvement of recommendations
- ML models get smarter over time

---

## 🛠️ Tech Stack

### Frontend

- **React 18** with Hooks
- **Framer Motion** for animations
- **React Router v6** for routing
- **Zustand** for state management
- **Recharts & Chart.js** for data visualization
- **Tailwind-style CSS** with custom properties

### Backend

- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Natural** for NLP processing
- **pdf-parse** for resume parsing

---

## 📁 Project Structure

```
skill-placement-system/
├── backend/
│   ├── middleware/        # Auth, upload, validation
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic & AI features
│   ├── uploads/          # File uploads
│   ├── server.js         # Express server
│   └── package.json
│
└── frontend/
    ├── public/           # Static files
    └── src/
        ├── components/   # Reusable components
        ├── pages/        # Route pages
        ├── store/        # Zustand state
        ├── utils/        # API utilities
        ├── App.js        # Main app
        └── index.css     # Global styles
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd skill-placement-system
```

2. **Install Backend Dependencies**

```bash
cd backend
npm install
```

3. **Configure Environment**

```bash
# Copy .env.example to .env and update values
cp .env.example .env
```

4. **Install Frontend Dependencies**

```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start Backend Server**

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

2. **Start Frontend Development Server**

```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

---

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Jobs

- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (Recruiter)

### Courses

- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details

### Recommendations

- `GET /api/recommendations/jobs` - Get job recommendations
- `GET /api/recommendations/courses` - Get course recommendations

### Skills

- `GET /api/skills/gap/:jobId` - Analyze skill gap
- `GET /api/skills/trending` - Get trending skills

### Resume

- `POST /api/resume/parse` - Parse and analyze resume
- `GET /api/resume/ats-score` - Get ATS score

### Learning Paths

- `GET /api/learning-paths` - Get available paths
- `POST /api/learning-paths/generate` - Generate personalized path

### Analytics

- `GET /api/analytics/dashboard` - Get analytics dashboard
- `GET /api/analytics/skill-trends` - Get skill trends

---

## 🎨 UI Features

- **Modern Glassmorphism** design
- **Smooth page transitions** with Framer Motion
- **Responsive layout** for all devices
- **Dark mode ready** with CSS variables
- **Animated components** throughout
- **Interactive charts** and visualizations

---

## 👥 User Roles

1. **Student** - Access skill development features
2. **Recruiter** - Post jobs and view analytics
3. **College Admin** - Institution-level analytics
4. **Admin** - Full system access

---

## 🔒 Security

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation & sanitization

---

## 📈 Future Enhancements

- [ ] Video resume analysis
- [ ] Interview preparation module
- [ ] Company culture matching
- [ ] Peer mentorship platform
- [ ] Mobile app (React Native)

---

## 🏆 Built for SIH

This project showcases innovative use of AI/ML for bridging the skill gap between education and industry, helping students become job-ready and connecting them with the right opportunities.

---

## 📄 License

MIT License - feel free to use and modify!

---

**Made with ❤️ for Smart India Hackathon**
