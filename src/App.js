import React, { useState } from 'react';
import { BookOpen, Calendar, ArrowLeft, Moon, Sun } from 'lucide-react';
import Day02 from './Day02';
import Day03 from './Day03';
import Day04 from './Day04';
import Day05 from './Day05';
import Day06 from './Day06';
import Day07 from './Day07';
import Day08 from './Day08';
import Day09 from './Day09';

function App() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const bgClass = darkMode
    ? "min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-8 flex items-center justify-center"
    : "min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 flex items-center justify-center";

  const renderSelectedDay = () => {
    switch (selectedDay) {
      case 'day02': return <Day02 darkMode={darkMode} />;
      case 'day03': return <Day03 darkMode={darkMode} />;
      case 'day04': return <Day04 darkMode={darkMode} />;
      case 'day05': return <Day05 darkMode={darkMode} />;
      case 'day06': return <Day06 darkMode={darkMode} />;
      case 'day07': return <Day07 darkMode={darkMode} />;
      case 'day08': return <Day08 darkMode={darkMode} />;
      case 'day09': return <Day09 darkMode={darkMode} />;
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

  const cardBg = darkMode ? "bg-gray-800" : "bg-white";

  return (
    <div className={bgClass}>
      <div className="max-w-6xl w-full mx-auto py-12">
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
          >
            {darkMode ? (
              <>
                <Sun className="w-5 h-5" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                Dark Mode
              </>
            )}
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DayCard 
            day="Day 02" 
            color="sky" 
            description="Travel Prep" 
            onClick={() => setSelectedDay('day02')} 
            darkMode={darkMode} 
          />
          <DayCard 
            day="Day 03" 
            color="emerald" 
            description="Student Life" 
            onClick={() => setSelectedDay('day03')} 
            darkMode={darkMode} 
          />
          <DayCard 
            day="Day 04" 
            color="pink" 
            description="Entertainment" 
            onClick={() => setSelectedDay('day04')} 
            darkMode={darkMode} 
          />
          <DayCard 
            day="Day 05" 
            color="purple" 
            description="Decision" 
            onClick={() => setSelectedDay('day05')} 
            darkMode={darkMode} 
          />
          <DayCard 
            day="Day 06" 
            color="teal" 
            description="Family" 
            onClick={() => setSelectedDay('day06')} 
            darkMode={darkMode} 
          />
          <DayCard 
            day="Day 07" 
            color="blue" 
            description="Travel" 
            onClick={() => setSelectedDay('day07')} 
            darkMode={darkMode} 
          />
          <DayCard 
            day="Day 08" 
            color="amber" 
            description="Culture" 
            onClick={() => setSelectedDay('day08')} 
            darkMode={darkMode} 
          />
          <DayCard 
            day="Day 09" 
            color="red" 
            description="Daily Life" 
            onClick={() => setSelectedDay('day09')} 
            darkMode={darkMode} 
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/80 text-lg">
            📚 80 Essential Words across 8 days! 화이팅! 💪
          </p>
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, color, description, onClick, darkMode }) {
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-400" : "text-gray-600";
  
  return (
    <button
      onClick={onClick}
      className={`${cardBg} rounded-3xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-${color}-500/50 text-left`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <Calendar className={`w-12 h-12 text-${color}-600`} />
        <div>
          <h2 className={`text-2xl font-bold text-${color}-600`}>{day}</h2>
          <p className={`${textColor} text-sm mt-1`}>{description}</p>
        </div>
        <div className={`text-${color}-600 font-semibold text-sm`}>
          10 Words →
        </div>
      </div>
    </button>
  );
}

export default App;