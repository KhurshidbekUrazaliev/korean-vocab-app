import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ArrowLeft, Moon, Sun, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import Day01 from './Day01';
import Day02 from './Day02';
import Day03 from './Day03';
import Day04 from './Day04';
import Day05 from './Day05';
import Day06 from './Day06';
import Day07 from './Day07';
import Day08 from './Day08';
import Day09 from './Day09';
import Day10 from './Day10';
import Day11 from './Day11';
import Day12 from './Day12';

function App() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [regularDaysExpanded, setRegularDaysExpanded] = useState(true);
  const [extraDaysExpanded, setExtraDaysExpanded] = useState(true);

  // Apply dark mode to the global document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const bgClass = darkMode
    ? "min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900"
    : "min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500";

  const regularDays = [
    { id: 'day01', name: 'Day 01', description: 'Dining Out', color: 'violet' },
    { id: 'day02', name: 'Day 02', description: 'Travel Prep', color: 'sky' },
    { id: 'day03', name: 'Day 03', description: 'Student Life', color: 'emerald' },
    { id: 'day04', name: 'Day 04', description: 'Entertainment', color: 'pink' },
    { id: 'day05', name: 'Day 05', description: 'Decision', color: 'purple' },
    { id: 'day06', name: 'Day 06', description: 'Family', color: 'teal' },
    { id: 'day07', name: 'Day 07', description: 'Travel', color: 'blue' },
    { id: 'day08', name: 'Day 08', description: 'Culture', color: 'amber' },
    { id: 'day09', name: 'Day 09', description: 'Daily Life', color: 'red' },
    { id: 'day10', name: 'Day 10', description: 'Imagination', color: 'lime' },
    { id: 'day11', name: 'Day 11', description: 'Personality', color: 'rose' },
    { id: 'day12', name: 'Day 12', description: 'Fatigue & Change', color: 'amber' },
  ];

  const extraDays = [
    // Extra Days will appear here
  ];

  const renderSelectedDay = () => {
    switch (selectedDay) {
      case 'day01': return <Day01 darkMode={darkMode} />;
      // Note: Day02 through Day11 components are assumed to exist based on imports.
      case 'day02': return <Day02 darkMode={darkMode} />;
      case 'day03': return <Day03 darkMode={darkMode} />;
      case 'day04': return <Day04 darkMode={darkMode} />;
      case 'day05': return <Day05 darkMode={darkMode} />;
      case 'day06': return <Day06 darkMode={darkMode} />;
      case 'day07': return <Day07 darkMode={darkMode} />;
      case 'day08': return <Day08 darkMode={darkMode} />;
      case 'day09': return <Day09 darkMode={darkMode} />;
      case 'day10': return <Day10 darkMode={darkMode} />;
      case 'day11': return <Day11 darkMode={darkMode} />;
      case 'day12': return <Day12 darkMode={darkMode} />;
      default: return null;
    }
  };

  const selectDay = (dayId) => {
    setSelectedDay(dayId);
    setSidebarOpen(false); // Close sidebar on mobile when day is selected
  };
  
  // Helper to ensure Tailwind colors are correctly mapped/used in the DayCard
  // This helps avoid issues with dynamic string concatenation in Tailwind.
  const getColorClass = (color, prefix) => {
    const map = {
        violet: `${prefix}-violet-600`,
        sky: `${prefix}-sky-600`,
        emerald: `${prefix}-emerald-600`,
        pink: `${prefix}-pink-600`,
        purple: `${prefix}-purple-600`,
        teal: `${prefix}-teal-600`,
        blue: `${prefix}-blue-600`,
        amber: `${prefix}-amber-600`,
        red: `${prefix}-red-600`,
        lime: `${prefix}-lime-600`,
        rose: `${prefix}-rose-600`,
    };
    return map[color] || `${prefix}-gray-600`;
  };


  // If a day is selected, show that day with top navigation
  if (selectedDay) {
    return (
      <div className="relative">
        {/* Top Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-gray-900/50 backdrop-blur-md border-b border-white/20 dark:border-gray-700">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="bg-white/20 hover:bg-white/30 text-white font-bold p-3 rounded-full backdrop-blur-sm"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Back Button */}
              <button
                onClick={() => setSelectedDay(null)}
                className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">All Days</span>
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 z-50 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Navigation</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-80px)] p-4">
            {/* Regular Days Section */}
            <div className="mb-6">
              <button
                onClick={() => setRegularDaysExpanded(!regularDaysExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="font-bold text-lg text-gray-800 dark:text-white">Regular Days</span>
                {regularDaysExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {regularDaysExpanded && (
                <div className="mt-2 space-y-2">
                  {regularDays.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => selectDay(day.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedDay === day.id
                          ? 'bg-indigo-500 text-white shadow-lg'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <div className="font-semibold">{day.name}</div>
                      <div className="text-sm opacity-75">{day.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Extra Days Section */}
            <div className="mb-6">
              <button
                onClick={() => setExtraDaysExpanded(!extraDaysExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="font-bold text-lg text-gray-800 dark:text-white">Extra Days</span>
                {extraDaysExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {extraDaysExpanded && (
                <div className="mt-2 space-y-2">
                  {extraDays.length > 0 ? (
                    extraDays.map((day) => (
                      <button
                        key={day.id}
                        onClick={() => selectDay(day.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedDay === day.id
                            ? 'bg-cyan-500 text-white shadow-lg'
                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        <div className="font-semibold">{day.name}</div>
                        <div className="text-sm opacity-75">{day.description}</div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                      Coming soon! 🎉
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Day Content */}
        <div className="min-h-screen pt-16">
          {renderSelectedDay()}
        </div>
      </div>
    );
  }

  // Main Menu (Grid View)
  return (
    <div className={`${bgClass} p-8 flex items-center justify-center min-h-screen`}>
      <div className="max-w-6xl w-full mx-auto py-12">
        {/* Top Bar with Dark Mode */}
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

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BookOpen className="w-24 h-24 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-lg">한국어 공부</h1>
          <p className="text-3xl text-white/90 mb-2">Essential Korean Vocabulary</p>
          <p className="text-xl text-white/80">Choose Your Day</p>
        </div>

        {/* Regular Days Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Regular Days (1-12)</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {regularDays.map((day) => (
              <DayCard
                key={day.id}
                day={day.name}
                color={day.color}
                description={day.description}
                onClick={() => selectDay(day.id)}
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>

        {/* Extra Days Section */}
        {extraDays.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Extra Days</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {extraDays.map((day) => (
                <DayCard
                  key={day.id}
                  day={day.name}
                  color={day.color}
                  description={day.description}
                  onClick={() => selectDay(day.id)}
                  darkMode={darkMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 text-center">
          <p className="text-white/80 text-lg">
            📚 {regularDays.length * 10} Essential Words! 화이팅! 💪
          </p>
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, color, description, onClick, darkMode }) {
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-400" : "text-gray-600";
  
  // Helper function to safely map color strings to Tailwind classes (avoids JIT issues)
  const getDynamicClass = (color, prefix) => {
    const map = {
        violet: `${prefix}-violet-600`,
        sky: `${prefix}-sky-600`,
        emerald: `${prefix}-emerald-600`,
        pink: `${prefix}-pink-600`,
        purple: `${prefix}-purple-600`,
        teal: `${prefix}-teal-600`,
        blue: `${prefix}-blue-600`,
        amber: `${prefix}-amber-600`,
        red: `${prefix}-red-600`,
        lime: `${prefix}-lime-600`,
        rose: `${prefix}-rose-600`,
    };
    return map[color] || `${prefix}-gray-600`;
  };

  const iconColorClass = getDynamicClass(color, 'text');
  const hoverShadowClass = getDynamicClass(color, 'hover:shadow');

  return (
    <button
      onClick={onClick}
      className={`${cardBg} rounded-3xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-200 ${hoverShadowClass}/50 text-left`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <Calendar className={`w-12 h-12 ${iconColorClass}`} /> 
        <div>
          <h2 className={`text-2xl font-bold ${iconColorClass}`}>{day}</h2>
          <p className={`${textColor} text-sm mt-1`}>{description}</p>
        </div>
        <div className={`${iconColorClass} font-semibold text-sm`}>10 Words →</div>
      </div>
    </button>
  );
}

export default App;