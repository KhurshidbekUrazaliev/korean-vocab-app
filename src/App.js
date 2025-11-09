import React, { useState } from 'react';
import { BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import Day05 from './Day05';
import Day06 from './Day06';

function App() {
  const [selectedDay, setSelectedDay] = useState(null);

  // If a day is selected, show that day's component
  if (selectedDay === 'day05') {
    return (
      <div>
        <button
          onClick={() => setSelectedDay(null)}
          className="fixed top-4 left-4 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2 z-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Days
        </button>
        <Day05 />
      </div>
    );
  }

  if (selectedDay === 'day06') {
    return (
      <div>
        <button
          onClick={() => setSelectedDay(null)}
          className="fixed top-4 left-4 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2 z-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Days
        </button>
        <Day06 />
      </div>
    );
  }

  // Main menu - choose which day to practice
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BookOpen className="w-24 h-24 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-lg">
            한국어 공부
          </h1>
          <p className="text-3xl text-white/90 mb-2">Korean Vocabulary Practice</p>
          <p className="text-xl text-white/80">Choose Your Day</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Day 05 Card */}
          <button
            onClick={() => setSelectedDay('day05')}
            className="bg-white rounded-3xl shadow-2xl p-10 transform hover:scale-105 transition-all duration-200 hover:shadow-purple-500/50 text-left"
          >
            <div className="flex items-center gap-4 mb-6">
              <Calendar className="w-12 h-12 text-purple-600" />
              <div>
                <h2 className="text-4xl font-bold text-purple-600">Day 05</h2>
                <p className="text-gray-600">Decision & Opinion</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="text-sm text-gray-700 bg-purple-50 rounded-lg p-3">
                <span className="font-bold">결정하다</span> - to decide
              </div>
              <div className="text-sm text-gray-700 bg-purple-50 rounded-lg p-3">
                <span className="font-bold">의견</span> - opinion
              </div>
              <div className="text-sm text-gray-700 bg-purple-50 rounded-lg p-3">
                <span className="font-bold">찬성하다</span> - to agree
              </div>
            </div>

            <div className="text-purple-600 font-semibold text-lg">
              10 Essential Words →
            </div>
          </button>

          {/* Day 06 Card */}
          <button
            onClick={() => setSelectedDay('day06')}
            className="bg-white rounded-3xl shadow-2xl p-10 transform hover:scale-105 transition-all duration-200 hover:shadow-teal-500/50 text-left"
          >
            <div className="flex items-center gap-4 mb-6">
              <Calendar className="w-12 h-12 text-teal-600" />
              <div>
                <h2 className="text-4xl font-bold text-teal-600">Day 06</h2>
                <p className="text-gray-600">Family & Life</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="text-sm text-gray-700 bg-teal-50 rounded-lg p-3">
                <span className="font-bold">일기</span> - diary
              </div>
              <div className="text-sm text-gray-700 bg-teal-50 rounded-lg p-3">
                <span className="font-bold">부모</span> - parents
              </div>
              <div className="text-sm text-gray-700 bg-teal-50 rounded-lg p-3">
                <span className="font-bold">가정</span> - home, household
              </div>
            </div>

            <div className="text-teal-600 font-semibold text-lg">
              10 Essential Words →
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/80 text-lg">
            📚 More days coming soon! 화이팅! 💪
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
