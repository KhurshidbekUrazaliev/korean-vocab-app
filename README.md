# Korean Vocabulary Practice App

A fun and interactive web app I built to help me (and anyone else!) practice Korean vocabulary. Features flashcards and quizzes with multiple days of essential Korean words from my learning journey.

## What It Does

This app now includes **multiple vocabulary days** with a main menu to choose which day to practice!

### Main Features:
- **Day Selection Menu** - Choose between Day 05 and Day 06 (more coming soon!)
- **Flashcard Mode** - Click cards to flip them and see the English translations. Great for casual learning.
- **Quiz Mode** - Multiple choice questions to test yourself. Shows your score at the end.

### Current Vocabulary Sets:
- **Day 05** - Decision & Opinion (10 words)
- **Day 06** - Family & Life (10 words)

## Why I Built This

I'm learning Korean and wanted a more engaging way to practice vocabulary instead of just staring at my notebook. Plus, I wanted to learn React, so this was a perfect starter project! After building Day 05, I realized I could make it even better by adding multiple days with a selection menu.

## Tech Stack

- React
- Tailwind CSS (via CDN)
- Lucide React (for icons)
- Component-based architecture (separate files for each day)

## Running It Locally

If you want to run this on your own computer:

1. Clone the repo:
```bash
git clone https://github.com/KhurshidbekUrazaliev/korean-vocab-app.git
cd korean-vocab-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app should open automatically at `http://localhost:3000`

## Live Demo

Check it out here: [https://khurshidbekurazaliev.github.io/korean-vocab-app/](https://khurshidbekurazaliev.github.io/korean-vocab-app/)

## What I Learned

- Building interactive React components with hooks (useState, useEffect)
- Managing state across different app modes
- Creating responsive layouts with Tailwind
- Deploying a React app to GitHub Pages
- **Component separation and reusability** (Day05.js, Day06.js)
- **Import/Export patterns in React**
- **Conditional rendering for navigation**

## Project Structure
```
korean-vocab-app/
├── src/
│   ├── App.js       # Main menu for day selection
│   ├── Day05.js     # Day 05 vocabulary component
│   ├── Day06.js     # Day 06 vocabulary component
│   └── index.js
├── public/
└── package.json
```

## The Vocabulary

### Day 05 - Decision & Opinion
- 결정하다 (gyeoljeong-hada) - to decide
- 의견 (uigyeon) - opinion
- 차이 (chai) - difference
- 모이다 (moida) - to gather
- 찬성하다 (chanseong-hada) - to agree
- 반대하다 (bandae-hada) - to oppose
- 충분히 (chungbun-hi) - sufficiently
- 만족하다 (manjok-hada) - to be satisfied
- 방향 (banghyang) - direction
- 선택하다 (seontaek-hada) - to choose

### Day 06 - Family & Life
- 일기 (ilgi) - diary
- 외롭다 (oeropta) - to be lonely
- 사실 (sasil) - fact, truth
- 가정 (gajeong) - home, household
- 부모 (bumo) - parents
- 역할 (yeokhal) - role
- 직장 (jikjang) - workplace, job
- 키우다 (kiuda) - to raise, to grow
- 추억 (chueok) - memory
- 노력하다 (noryeokhada) - to make an effort

## Future Ideas

Some things I might add:
- More vocabulary days (Days 01-04, 07-10, etc.)
- Audio pronunciation
- Progress tracking across all days
- Spaced repetition algorithm
- Dark mode
- Search/filter vocabulary
- Practice all days combined mode

## Contributing

If you're also learning Korean or React and have suggestions, feel free to open an issue or submit a PR!

## License

MIT - feel free to use this for your own language learning projects!

---

Made with ☕ and a desire to finally remember these vocabulary words by **Khurshidbek Urazaliev**