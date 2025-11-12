import React, { useState } from 'react';
import { BookOpen, Calendar, ArrowLeft, Moon, Sun } from 'lucide-react';
import Day05 from './Day05';
import Day06 from './Day06';
import Day07 from './Day07';

function App() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const bgClass = darkMode
    ? "min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-8 flex items-center justify-center"
    : "min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 flex items-center justify-center";

  const cardBg = darkMode ? "bg-gray-800" : "bg-white";

  // If a day is selected, render that day's component
  if (selectedDay === 'day05') {
    return (
      <div>
        <div className="fixed top-4 left-4 right-4 flex justify-between z-50">
          <button
            onClick={() => setSelectedDay(null)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Days
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <Day05 darkMode={darkMode} />
      </div>
    );
  }

  if (selectedDay === 'day06') {
    return (
      <div>
        <div className="fixed top-4 left-4 right-4 flex justify-between z-50">
          <button
            onClick={() => setSelectedDay(null)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Days
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <Day06 darkMode={darkMode} />
      </div>
    );
  }

  if (selectedDay === 'day07') {
    return (
      <div>
        <div className="fixed top-4 left-4 right-4 flex justify-between z-50">
          <button
            onClick={() => setSelectedDay(null)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Days
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <Day07 darkMode={darkMode} />
      </div>
    );
  }

  // Main menu - select a day
  return (
    <div className={bgClass}>
      <div className="max-w-4xl w-full mx-auto py-12">
        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BookOpen className="w-24 h-24 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-lg">한국어 공부</h1>
          <p className="text-3xl text-white/90 mb-2">Korean Vocabulary Practice</p>
          <p className="text-xl text-white/80">Choose Your Day</p>
        </div>

        {/* Day Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Day 05 */}
          <DayCard
            day="Day 05"
            color="purple"
            words={[{korean: '결정하다', english: 'to decide'}, {korean: '의견', english: 'opinion'}]}
            description="Decision"
            onClick={() => setSelectedDay('day05')}
            darkMode={darkMode}
          />
          {/* Day 06 */}
          <DayCard
            day="Day 06"
            color="teal"
            words={[{korean: '일기', english: 'diary'}, {korean: '부모', english: 'parents'}]}
            description="Family"
            onClick={() => setSelectedDay('day06')}
            darkMode={darkMode}
          />
          {/* Day 07 */}
          <DayCard
            day="Day 07"
            color="blue"
            words={[{korean: '기대하다', english: 'to expect'}, {korean: '풍경', english: 'scenery'}]}
            description="Travel"
            onClick={() => setSelectedDay('day07')}
            darkMode={darkMode}
          />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/80 text-lg">📚 More days coming soon! 화이팅! 💪</p>
        </div>
      </div>
    </div>
  );
}

// Reusable Day Card Component
function DayCard({ day, color, words, description, onClick, darkMode }) {
  return (
    <button
      onClick={onClick}
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-200 text-left`}
    >
      <div className={`flex items-center gap-3 mb-4`}>
        <Calendar className={`w-10 h-10 text-${color}-600`} />
        <div>
          <h2 className={`text-3xl font-bold text-${color}-600`}>{day}</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {words.map((word, idx) => (
          <div
            key={idx}
            className={`text-xs ${darkMode ? `text-gray-300 bg-${color}-900/30` : `text-gray-700 bg-${color}-50`} rounded-lg p-2`}
          >
            <span className="font-bold">{word.korean}</span> - {word.english}
          </div>
        ))}
      </div>
      <div className={`text-${color}-600 font-semibold`}>10 Words →</div>
    </button>
  );
}

export default App;
