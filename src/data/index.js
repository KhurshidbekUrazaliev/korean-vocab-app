const modules = import.meta.glob('./days/day*.json', { eager: true, import: 'default' });

export const days = Object.values(modules).sort((a, b) => a.number - b.number);
export const PLANNED_DAYS = 50;
export const allWords = days.flatMap((day) => day.words.map((w) => ({ ...w, dayId: day.id, dayNumber: day.number })));

const byNumber = new Map(days.map((d) => [d.number, d]));
export const getDay = (number) => byNumber.get(Number(number));
export const pad = (n) => String(n).padStart(2, '0');

// Every word has a recorded clip at public/audio/<word id>.mp3 (scripts/make-audio.py).
const byKorean = new Map(allWords.map((w) => [w.korean, w.id]));
export const clipFor = (korean) => {
  const id = byKorean.get(korean);
  return id ? `${import.meta.env.BASE_URL}audio/${id}.mp3` : null;
};
