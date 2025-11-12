import React, { useState } from 'react';
import { BookOpen, Calendar, ArrowLeft, Moon, Sun } from 'lucide-react';
import Day04 from './Day04';
import Day05 from './Day05';
import Day06 from './Day06';
import Day07 from './Day07';

function App() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const bgClass = darkMode
    ? "min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-8 flex items-center justify-center"
    : "min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 flex items-center justify-center";

  const renderSelectedDay = () => {
    switch (selectedDay) {
      case 'day04': return <Day04 darkMode={darkMode} />;
      case 'day05': return <Day05 darkMode={darkMode} />;
      case 'day06': return <Day06 darkMode={darkMode} />;
      case 'day07': return <Day07 darkMode={darkMode} />;
      default: return null;
    }
  };

  if (selectedDay) {
    return (
      <div>
        <div className="fixed top-4 left-4 right-4 flex justify-between z-50">
          <button
            onClick={() => setSelectedDay(null)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Days
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        {renderSelectedDay()}
      </div>
    );
  }

  return (
    <div className={bgClass}>
      <div className="max-w-4xl w-full mx-auto py-12">
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BookOpen className="w-24 h-24 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-lg">한국어 공부</h1>
          <p className="text-3xl text-white/90 mb-2">Korean Vocabulary Practice</p>
          <p className="text-xl text-white/80">Choose Your Day</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <DayCard day="Day 04" color="pink" description="Entertainment" onClick={() => setSelectedDay('day04')} darkMode={darkMode} />
          <DayCard day="Day 05" color="purple" description="Decision" onClick={() => setSelectedDay('day05')} darkMode={darkMode} />
          <DayCard day="Day 06" color="teal" description="Family" onClick={() => setSelectedDay('day06')} darkMode={darkMode} />
          <DayCard day="Day 07" color="blue" description="Travel" onClick={() => setSelectedDay('day07')} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, color, description, onClick, darkMode }) {
  return (
    <button
      onClick={onClick}
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-200 text-left`}
    >
      <div className="flex items-center gap-3 mb-4">
        <Calendar className={`w-10 h-10 text-${color}-600`} />
        <div>
          <h2 className={`text-3xl font-bold text-${color}-600`}>{day}</h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{description}</p>
        </div>
      </div>
      <div className={`text-${color}-600 font-semibold`}>10 Words →</div>
    </button>
  );
}

export default App;
