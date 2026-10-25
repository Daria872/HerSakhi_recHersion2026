# 🌸 HerSakhi — AI-Powered, Inclusive Women's Healthcare

**Your health. Your language. Your journey.**

HerSakhi is an AI-powered healthcare platform designed to help women across India understand their physical and reproductive health, access mental wellness support, and connect with appropriate healthcare services regardless of their location, language, or accessibility needs.

---

## 🎬 Demo & Live Application


| 🚀 **Live Application** | [Add your deployed link here](https://example.com) |
| 🎥 **Demo Video** | [Watch the HerSakhi demo](https://example.com) |
| 💻 **GitHub Repository** | [View source code](https://github.com/your-username/your-repository) |

---

## 🌍 Problem Statement

Women face significant barriers to accessing reliable healthcare, including limited health awareness, difficulty understanding symptoms, delayed medical consultation, mental health challenges, language barriers, and unequal access to healthcare facilities in rural and underserved communities.

Women with disabilities may face additional challenges when using conventional digital healthcare platforms.

Existing solutions often address individual needs rather than connecting health understanding, accessibility, and healthcare navigation into one seamless experience.

## 💡 Our Solution

HerSakhi brings healthcare guidance, emotional wellness, and accessible healthcare discovery together in one personalized platform.

Users can describe their health concerns in their preferred language, understand relevant health information, explore nearby healthcare facilities, and access wellness resources through an inclusive, privacy-conscious interface.

## ✨ Key Features

### 🩺 1. Physical & Reproductive Healthcare

- Log symptoms, severity, duration, and health concerns.
- Access AI-assisted, plain-language health explanations.
- Track recurring symptoms and view health timelines.
- Generate structured health summaries for medical consultations.
- Receive guidance on appropriate next steps without replacing professional diagnosis.

### 🧠 2. Mental Health & Wellness

- Record mood and stress levels.
- Explore guided breathing and grounding exercises.
- Access relaxation techniques and journaling.
- Discover mental health resources and professional support options.

### 🗣️ 3. Multilingual Voice & Text Interaction

- Support English, Hindi, Tamil, Malayalam, Kannada, and Telugu.
- Describe health concerns using voice or text.
- Convert complex health information into understandable language.
- Improve accessibility for users with different literacy and communication needs.

### 📍 4. Location-Based Healthcare Discovery

- Discover nearby hospitals, clinics, and relevant specialists.
- Explore directions, contact details, and available services.
- Display accessibility information where verified.
- Help users explore transport options and healthcare resources where available.

### ♿ 5. Inclusive Healthcare Access

- Screen-reader-compatible navigation.
- Keyboard accessibility and adjustable text.
- High-contrast and reduced-motion options.
- Voice interaction and low-bandwidth-friendly experiences.
- Personalized interfaces based on individual accessibility preferences.

### 🔐 6. Privacy & Data Protection

- Secure authentication and account management.
- Consent-based collection and sharing of health information.
- Protected access to personal health records.
- Data minimization and privacy-conscious handling of location information.

## 🎯 Target Audience

HerSakhi is designed for:

- Rural and urban women seeking accessible healthcare.
- Women experiencing reproductive or physical health concerns.
- Women looking for mental wellness support.
- Women with disabilities who encounter digital or physical accessibility barriers.
- Transgender individuals seeking relevant, inclusive healthcare information.

## 🚀 Innovation

HerSakhi focuses on connecting the complete healthcare journey:

**Describe symptoms → Understand health information → Discover suitable care → Navigate access barriers → Follow up**

Rather than functioning solely as a health chatbot, HerSakhi aims to help users move from uncertainty toward informed healthcare decisions and practical access to services.

Its key differentiators include multilingual voice interaction, personalized accessibility, location-aware healthcare navigation, and follow-up support.

## 🏗️ System Architecture

```text
                         USER
                           |
                           v
                 HER SAKHI WEB APP
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
    Health Support   Mental Wellness   Voice & Text
          |                |                |
          +----------------+----------------+
                           |
                           v
                     BACKEND API
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
      AI Guidance     Health Records    Care Discovery
          |                |                |
          +----------------+----------------+
                           |
                           v
                    DATABASE LAYER
                           |
                           v
                Privacy & Access Controls
```

## 🛠️ Technology Stack

Frontend: React, TypeScript, Tailwind CSS <br>
UI & Animations: Motion for React <br>
Backend: Python, FastAPI <br>
Database: PostgreSQL <br>
AI Integration: Large Language Model (LLM) API <br>
Voice Processing: Speech-to-Text (STT) and Text-to-Speech (TTS) APIs <br>
Location Services: Maps and Places API <br>
Authentication: Secure Authentication Provider or Backend Implementation <br>
Development Tools: VS Code, Git, GitHub

## Setup Instructions

# 1. Clone the repository
git clone <repository-url>
cd <project-folder>

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

# 4. Configure environment variables
# Create a .env file and add the required API keys,
# database URL, and authentication credentials.

# 5. Start the backend
uvicorn main:app --reload

# 6. Start the frontend (in a new terminal)
cd frontend
npm install
npm run dev


## 🗺️ Roadmap

- [ ] Develop a responsive landing page and authentication.
- [ ] Implement personalized onboarding and accessibility preferences.
- [ ] Build symptom tracking and health timelines.
- [ ] Integrate AI-assisted health explanations.
- [ ] Implement mental wellness exercises and mood tracking.
- [ ] Add multilingual voice and text interaction.
- [ ] Integrate location-based healthcare discovery.
- [ ] Implement secure health records and consent controls.
- [ ] Test accessibility, clinical safety, and multilingual usability.
- [ ] Deploy and evaluate the end-to-end application.

## 🌱 Expected Impact

HerSakhi aims to improve health awareness, support informed healthcare decisions, reduce language and accessibility barriers, and help women navigate healthcare services more effectively.

## 🤝 Contributing

Contributions, feedback, and suggestions are welcome. You can contribute by opening an issue or submitting a pull request.

## 📄 License

Add an appropriate open-source license to the repository before distributing the project.

---

<p align="center">
  <strong>🌸 HerSakhi — Every woman deserves accessible, understandable healthcare.</strong>
</p>
