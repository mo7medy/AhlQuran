# QuranMemo - Islamic Studies & Hifz Platform

A comprehensive React Native (Web/PWA) application dedicated to Quran memorization and Islamic studies learning.

## Features

- **Mushaf**: Full Quran reader with Audio, Tafsir, and Translation.
- **Memorization**: Flashcard-style revision, AI recitation analysis, and progress tracking.
- **AI Tutor**: Integrated Gemini 2.5 chatbot for Fiqh, Tajweed, and Tafsir queries.
- **Marketplace**: Find teachers, view profiles, and book sessions.
- **Social**: Chat system, Notifications, and Multi-language support (Arabic/English).

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Tailwind Animate
- **Icons**: Lucide React
- **AI**: Google Gemini API (@google/genai)
- **Deployment**: Ready for Vercel, Railway, or AWS Amplify.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_google_gemini_api_key
   ```

3. **Run Locally**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## License

MIT
