import { Teacher, Course } from '../types';

// NOTE: Quran data (Surahs, Ayahs) is now fetched from the live API (services/quranApi.ts)
// The following data is for the Marketplace/Teachers/Courses section which would typically
// require a custom backend.

export const MOCK_TEACHERS: Teacher[] = [
    {
        uid: "t1",
        email: "ahmed@example.com",
        displayName: "Sheikh Ahmed",
        role: "teacher",
        memorizedAyahs: 6236,
        subjects: ["Tajweed", "Hifz"],
        hourlyRate: 20,
        rating: 4.9,
        reviewsCount: 120,
        bio: "Certified Quran teacher with Ijazah in Hafs from Asim.",
        avatarUrl: "https://ui-avatars.com/api/?name=Sheikh+Ahmed&background=0D9488&color=fff"
    },
    {
        uid: "t2",
        email: "fatima@example.com",
        displayName: "Ustadha Fatima",
        role: "teacher",
        memorizedAyahs: 6236,
        subjects: ["Tajweed", "Fiqh"],
        hourlyRate: 18,
        rating: 5.0,
        reviewsCount: 85,
        bio: "Experienced teacher specializing in Tajweed and Fiqh for sisters.",
        avatarUrl: "https://ui-avatars.com/api/?name=Ustadha+Fatima&background=D97706&color=fff"
    },
    {
        uid: "t3",
        email: "karim@example.com",
        displayName: "Sheikh Karim",
        role: "teacher",
        memorizedAyahs: 6236,
        subjects: ["Arabic", "Hifz"],
        hourlyRate: 25,
        rating: 4.8,
        reviewsCount: 200,
        bio: "Native Arabic speaker with 10 years of teaching experience.",
        avatarUrl: "https://ui-avatars.com/api/?name=Sheikh+Karim&background=0F172A&color=fff"
    }
];

export const MOCK_COURSES: Course[] = [
    {
        id: "c1",
        title: "Tajweed Fundamentals",
        category: "Tajweed",
        lessonsCount: 20,
        completedLessons: 12,
        imageUrl: "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: "c2",
        title: "Understanding Salah",
        category: "Fiqh",
        lessonsCount: 15,
        completedLessons: 3,
        imageUrl: "https://images.unsplash.com/photo-1564121211835-e88c852648ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    },
    {
        id: "c3",
        title: "Stories of the Prophets",
        category: "Seerah",
        lessonsCount: 30,
        completedLessons: 0,
        imageUrl: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }
];
