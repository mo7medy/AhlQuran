export type UserRole = 'student' | 'teacher';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  memorizedAyahs: number; // Count of memorized ayahs
}

export interface Teacher extends User {
  subjects: string[];
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  bio: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string; // Arabic text (Uthmani)
  numberInSurah: number;
  juz: number;
  audio?: string; // URL to audio file
  translation?: string; // English translation
  tafsir?: string; // Arabic Tafsir
}

export interface Booking {
  id: string;
  teacherId: string;
  studentId: string;
  teacherName: string;
  date: string; // ISO string
  status: 'upcoming' | 'completed' | 'cancelled';
  subject: string;
}

export interface Course {
  id: string;
  title: string;
  category: 'Tajweed' | 'Aqeedah' | 'Fiqh' | 'Seerah' | 'Hadith';
  lessonsCount: number;
  completedLessons: number;
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'reminder';
}