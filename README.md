# Korean Vocabulary Practice App

A fun and interactive web app I built to help me (and anyone else!) practice Korean vocabulary. Features flashcards and quizzes with 80 essential Korean words across 8 days of my learning journey.

## What It Does

This app includes **8 complete vocabulary days** with a beautiful main menu to choose which day to practice!

### Main Features:
- 🌙 **Dark Mode Toggle** - Switch between light and dark themes
- 📚 **8 Vocabulary Days** - 80 essential Korean words organized by topic
- 🎴 **Flashcard Mode** - Click cards to flip them and see English translations
- 🎯 **Quiz Mode** - Multiple choice questions with shuffled word order
- 📊 **Score Tracking** - Real-time scoring and percentage results
- 🎨 **Beautiful UI** - Each day has its own unique color theme
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop

### Current Vocabulary Sets:
- **Day 02** - Travel Preparation (10 words)
- **Day 03** - Student Life (10 words)
- **Day 04** - Entertainment (10 words)
- **Day 05** - Decision & Opinion (10 words)
- **Day 06** - Family & Life (10 words)
- **Day 07** - Travel Experience (10 words)
- **Day 08** - Culture & Freedom (10 words)
- **Day 09** - Daily Life & Habits (10 words)

## Why I Built This

I'm learning Korean and wanted a more engaging way to practice vocabulary instead of just staring at my notebook. Plus, I wanted to learn React, so this was a perfect starter project! After building the first day, I kept adding more features and days, making it a comprehensive learning tool.

## Tech Stack

- React 18
- Tailwind CSS (via CDN)
- Lucide React (for beautiful icons)
- Component-based architecture (separate files for each day)
- GitHub Pages (for deployment)

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
- Managing state across different app modes and components
- Creating responsive layouts with Tailwind CSS
- Deploying a React app to GitHub Pages
- Component separation and reusability (modular day components)
- Import/Export patterns in React
- Conditional rendering for navigation and dark mode
- Implementing shuffled quiz logic for better learning
- Creating consistent UI/UX across multiple components

## Project Structure
```
korean-vocab-app/
├── src/
│   ├── App.js       # Main menu for day selection
│   ├── Day02.js     # Day 02 vocabulary component
│   ├── Day03.js     # Day 03 vocabulary component
│   ├── Day04.js     # Day 04 vocabulary component
│   ├── Day05.js     # Day 05 vocabulary component
│   ├── Day06.js     # Day 06 vocabulary component
│   ├── Day07.js     # Day 07 vocabulary component
│   ├── Day08.js     # Day 08 vocabulary component
│   ├── Day09.js     # Day 09 vocabulary component
│   └── index.js     # Entry point
├── public/
│   └── index.html   # HTML template with Tailwind CDN
└── package.json     # Project dependencies
```

## The Vocabulary

### Day 02 - Travel Preparation
- 비자 (bija) - visa
- 발급 (balgeup) - issuance
- 해외여행 (haoeyeohaeng) - overseas travel
- 일정 (iljeong) - schedule, itinerary
- 일행 (ilhaeng) - travel companion
- 전통 (jeontong) - tradition
- 체험 (cheheom) - experience
- 제안하다 (jeanhada) - to suggest
- 출국하다 (chulgukhada) - to leave the country
- 싸다 (ssada) - to pack

### Day 03 - Student Life
- 유학생 (yuhaksaeng) - international student
- 동특증 (dongteukjeung) - club activities
- 방법 (bangbeop) - method, way
- 지원 (jiwon) - support
- 센터 (senteo) - center
- 자기 (jagi) - oneself
- 따라오다 (ttaraoda) - to follow
- 작성하다 (jakseonghada) - to fill out
- 대하다 (daehada) - to treat
- 감동하다 (gamdonghada) - to be moved

### Day 04 - Entertainment
- 공연 (gongyeon) - performance
- 용돈 (yongdon) - allowance
- 예매하다 (yemaehada) - to book/reserve
- 마침 (machim) - just in time
- 관객 (gwan-gae) - audience
- 떠들다 (tteodeulda) - to chatter
- 집중하다 (jipjunghada) - to concentrate
- 제대로 (jedaero) - properly
- 감상하다 (gamsanghada) - to appreciate
- 아쉽다 (ashwipda) - to be regrettable

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
- 직장 (jikjang) - workplace
- 키우다 (kiuda) - to raise
- 추억 (chueok) - memory
- 노력하다 (noryeokhada) - to make an effort

### Day 07 - Travel Experience
- 기대하다 (gidaehada) - to expect
- 좌석 (jwaseok) - seat
- 앞뒤 (apdwi) - front and back
- 공간 (gonggan) - space
- 펴다 (pyeoda) - to spread
- 창밖 (changbak) - outside the window
- 풍경 (punggyeong) - scenery
- 어지럽다 (eojireopda) - to be dizzy
- 등 (deung) - back (body part)
- 건조하다 (geonjohada) - to be dry

### Day 08 - Culture & Freedom
- 서로 (seoro) - each other
- 별명 (byeolmyeong) - nickname
- 반말 (banmal) - informal speech
- 마음대로 (maeumdaero) - as one pleases
- 반팔 (banpal) - short sleeves
- 슬리퍼 (seullipeo) - slippers
- 자유롭다 (jayuropda) - to be free
- 짐장히 (jimjanghi) - extremely
- 낯설다 (natseolda) - to be unfamiliar
- 익숙하다 (iksukhada) - to be familiar

### Day 09 - Daily Life & Habits
- 늦잠 (neutjam) - oversleeping
- 대표 (daepyo) - representative
- 발표 (balpyo) - presentation
- 평가 (pyeonggа) - evaluation
- 면접 (myeonjeop) - interview
- 지각하다 (jigakhada) - to be late
- 인생 (insaeng) - life
- 방해하다 (banghaehada) - to disturb
- 버릇 (beoreut) - habit
- 해결하다 (haegyeolhada) - to solve

## Features Breakdown

### Dark Mode 🌙
Toggle between light and dark themes with a single click. Dark mode applies across all pages and components for comfortable learning at any time of day.

### Shuffled Quiz Order 🔀
Quiz questions appear in random order each time you start, preventing memorization by position and improving actual word recognition.

### Progress Tracking 📊
Real-time score display during quizzes with visual progress bars and percentage calculations on the results page.

### Responsive Design 📱
Optimized for all screen sizes with Tailwind's responsive grid system. Practice on your phone during commute, tablet at a café, or desktop at home.

## Future Ideas

Some things I might add:
- Days 01 and to Day 50 (complete all 50 days!)
- Audio pronunciation for each word
- Spaced repetition algorithm for optimal learning (like Anki)
- Progress tracking across sessions
- Practice mode mixing all days (Random tests randomly taken from all days)
- Export/import vocabulary lists
- Achievement badges and streaks
- Difficulty levels

## Contributing

If you're also learning Korean or React and have suggestions, feel free to open an issue or submit a PR! I'm always looking to improve the app and add more features.

## License

MIT - feel free to use this for your own language learning projects!

## Acknowledgments

Special thanks to my Korean textbook (Talk to me in Korean) for the vocabulary organization and to the React and Tailwind communities for their excellent documentation.

---

Made with ☕ and a desire to finally remember these vocabulary words by **Khurshidbek Urazaliev**

**Study tip**: Consistency is key! Try to practice at least one day every day. 화이팅! 💪