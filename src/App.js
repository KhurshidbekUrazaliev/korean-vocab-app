import React, { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
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
import Day13 from './Day13';
import Day14 from './Day14';
import Day15 from './Day15';
import './Home.css';

const imageDirectory = `${process.env.PUBLIC_URL}/images`;

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

  const regularDays = [
    { id: 'day01', name: 'Day 01', description: 'Dining Out' },
    { id: 'day02', name: 'Day 02', description: 'Travel Prep' },
    { id: 'day03', name: 'Day 03', description: 'Student Life' },
    { id: 'day04', name: 'Day 04', description: 'Entertainment' },
    { id: 'day05', name: 'Day 05', description: 'Decision' },
    { id: 'day06', name: 'Day 06', description: 'Family' },
    { id: 'day07', name: 'Day 07', description: 'Travel' },
    { id: 'day08', name: 'Day 08', description: 'Culture' },
    { id: 'day09', name: 'Day 09', description: 'Daily Life' },
    { id: 'day10', name: 'Day 10', description: 'Imagination' },
    { id: 'day11', name: 'Day 11', description: 'Personality' },
    { id: 'day12', name: 'Day 12', description: 'Fatigue & Change' },
    { id: 'day13', name: 'Day 13', description: 'Gardening&Weather' },
    { id: 'day14', name: 'Day 14', description: 'Work & Time' },
    { id: 'day15', name: 'Day 15', description: 'Actions & Objects' },
  ];

  const extraDays = [
    // Extra Days will appear here
  ];

  const renderSelectedDay = () => {
    switch (selectedDay) {
      case 'day01': return <Day01 darkMode={darkMode} />;
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
      case 'day13': return <Day13 darkMode={darkMode} />;
      case 'day14': return <Day14 darkMode={darkMode} />; 
      case 'day15': return <Day15 darkMode={darkMode} />;
      default: return null;
    }
  };

  const selectDay = (dayId) => {
    setSelectedDay(dayId);
    setSidebarOpen(false); // Close sidebar on mobile when day is selected
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

  return (
    <main className={darkMode ? 'vocab-home vocab-home--dark' : 'vocab-home'}>
      <div className="vocab-home__content">
        <div className="vocab-home__toolbar">
          <button type="button" className="vocab-home__theme" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <header className="vocab-home__hero">
          <img src={`${imageDirectory}/hero.webp`} alt="" width="1600" height="1000" />
          <div className="vocab-home__intro">
            <h1 lang="ko">한국어 공부</h1>
            <p>Essential Korean Vocabulary</p>
          </div>
        </header>

        <h2 className="vocab-home__heading">Choose Your Day</h2>
        <DayGrid heading="Regular Days (1-15)" days={regularDays} selectDay={selectDay} />
        {extraDays.length > 0 && <DayGrid heading="Extra Days" days={extraDays} selectDay={selectDay} />}

        <p className="vocab-home__stats">📚 {regularDays.length * 10} Essential Words! 화이팅! 💪</p>
      </div>
    </main>
  );
}

function DayGrid({ heading, days, selectDay }) {
  return (
    <section>
      <h3 className="vocab-home__section-heading">{heading}</h3>
      <div className="vocab-home__grid">
        {days.map((day) => (
          <button
            key={day.id}
            type="button"
            className="vocab-home__day"
            onClick={() => selectDay(day.id)}
          >
            <img src={`${imageDirectory}/days/${day.id}.webp`} alt="" width="1600" height="1000" loading="lazy" decoding="async" />
            <span className="vocab-home__day-copy">
              <span className="vocab-home__day-number">{day.name}</span>
              <strong>{day.description}</strong>
              <span className="vocab-home__day-action">10 Words →</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default App;
