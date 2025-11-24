import { Surah, Ayah } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

export const fetchSurahList = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${BASE_URL}/surah`);
    const data = await response.json();
    if (data.code === 200) {
      return data.data;
    }
    throw new Error('Failed to fetch surah list');
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchSurahDetails = async (surahNumber: number): Promise<Ayah[]> => {
  try {
    // Fetch Uthmani text, Audio, Translation (English), and Tafsir (Arabic Muyassar)
    const response = await fetch(
      `${BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,ar.alafasy,en.sahih,ar.muyassar`
    );
    const data = await response.json();

    if (data.code === 200 && data.data.length >= 4) {
      const quranData = data.data[0].ayahs;
      const audioData = data.data[1].ayahs;
      const translationData = data.data[2].ayahs;
      const tafsirData = data.data[3].ayahs;

      return quranData.map((item: any, index: number) => ({
        number: item.number,
        text: item.text,
        numberInSurah: item.numberInSurah,
        juz: item.juz,
        audio: audioData[index].audio, // Mishary Alafasy
        translation: translationData[index].text, // Sahih International
        tafsir: tafsirData[index].text, // Tafsir Al-Muyassar
      }));
    }
    throw new Error('Failed to fetch surah details');
  } catch (error) {
    console.error(error);
    return [];
  }
};
