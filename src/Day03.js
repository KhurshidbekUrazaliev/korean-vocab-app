import React, { useState, useEffect } from 'react';
import { Book, Trophy, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

function Day03({ darkMode }) {
  const vocabulary = [
    { korean: '유학생', english: 'international student', romanization: 'yuhaksaeng' },
    { korean: '동특증', english: 'club activities', romanization: 'dongteukjeung' },
    { korean: '방법', english: 'method, way', romanization: 'bangbeop' },
    { korean: '지원', english: 'support, aid', romanization: 'jiwon' },
    { korean: '센터', english: 'center', romanization: 'senteo' },
    { korean: '자기', english: 'oneself, self', romanization: 'jagi' },
    { korean: '따라오다', english: 'to follow', romanization: 'ttaraoda' },
    { korean: '작성하다', english: 'to fill out, to write', romanization: 'jakseonghada' },
    { korean: '대하다', english: 'to treat, to deal with', romanization: 'daehada' },
    { korean: '감동하다', english: 'to be moved, touched', romanization: 'gamdonghada' }
  ];

  const [mode, setMode] = useState('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [shuffledIndices, setShuffledIndices] = useState([]);

  const shuffleWords = () => {
    const indices = Array.from({ length: vocabulary.length }, (_, i) => i);
    return indices.sort(() => Math.random() - 0.5);
  };

  const generateQuizOptions = (correctIndex) => {
    const options = [vocabulary[correctIndex]];
    const used = new Set([correctIndex]);
    while (options.length < 4) {
      const randomIndex = Math.floor(Math.random() * vocabulary.length);
      if (!used.has(randomIndex)) {
        options.push(vocabulary[randomIndex]);
        used.add(randomIndex);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (mode === 'quiz' && shuffledIndices.length > 0) {
      setQuizOptions(generateQuizOptions(shuffledIndices[currentIndex]));
    }
  }, [currentIndex, mode, shuffledIndices]);

  const startFlashcards = () => {
    setMode('flashcard');
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const startQuiz = () => {
    setMode('quiz');
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setShuffledIndices(shuffleWords());
  };

  const nextCard = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      setMode('results');
    }
  };

  const handleQuizAnswer = (option) => {
    if (answered) return;
    setSelectedAnswer(option);
    setAnswered(true);
    const currentWord = vocabulary[shuffledIndices[currentIndex]];
    if (option.korean === currentWord.korean) {
      setScore(score + 1);
    }
  };

  const resetToMenu = () => {
    setMode('menu');
    setCurrentIndex(0);
    setScore(0);
    setShowAnswer(false);
    setAnswered(false);
    setSelectedAnswer(null);
  };

  const bgClass = darkMode
    ? "bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-800"
    : "bg-gradient-to-br from-emerald-500 via-green-500 to-lime-400";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";
  const secondaryText = darkMode ? "text-gray-300" : "text-gray-500";

  if (mode === 'menu') {
    return (
      <div className={`min-h-screen ${bgClass} p-8 flex items-center justify-center`}>
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">Day 03</h1>
          <p className="text-2xl text-white/90">Korean Vocabulary Practice</p>
          <p className="text-lg text-white/80 mt-2">10 Essential Words</p>

          <div className="grid gap-6 mt-12">
            <button
              onClick={startFlashcards}
              className={`${cardBg} hover:bg-yellow-50 ${darkMode ? 'hover:bg-gray-700' : ''} text-emerald-600 ${darkMode ? 'text-emerald-400' : ''} font-bold py-8 px-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-4`}
            >
              <Book className="w-10 h-10" />
              <div className="text-left">
                <div className="text-2xl">Flashcard Mode</div>
                <div className="text-sm opacity-70">Learn at your own pace</div>
              </div>
            </button>

            <button
              onClick={startQuiz}
              className={`${cardBg} hover:bg-green-50 ${darkMode ? 'hover:bg-gray-700' : ''} text-green-600 ${darkMode ? 'text-green-400' : ''} font-bold py-8 px-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-4`}
            >
              <Trophy className="w-10 h-10" />
              <div className="text-left">
                <div className="text-2xl">Quiz Mode</div>
                <div className="text-sm opacity-70">Test your knowledge</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'flashcard') {
    const currentWord = vocabulary[currentIndex];
    return (
      <div className={`min-h-screen ${bgClass} p-8`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={resetToMenu}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> Menu
            </button>
          </div>

          <div className={`${cardBg} rounded-3xl shadow-2xl p-12 min-h-96 flex flex-col items-center justify-center cursor-pointer transform hover:scale-102 transition-all`}
               onClick={() => setShowAnswer(!showAnswer)}>
            <div className="text-center w-full">
              <div className={`text-8xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} mb-8`}>
                {currentWord.korean}
              </div>
              {showAnswer ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className={`text-4xl ${textColor} font-semibold`}>{currentWord.english}</div>
                  <div className={`text-2xl ${secondaryText} italic`}>[{currentWord.romanization}]</div>
                </div>
              ) : (
                <div className="text-gray-400 text-xl mt-8 animate-pulse">Click to reveal answer</div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={nextCard}
              className={`${cardBg} hover:bg-yellow-50 ${darkMode ? 'hover:bg-gray-700 text-emerald-400' : 'text-emerald-600'} font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl`}
            >
              {currentIndex === vocabulary.length - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quiz') {
    const currentWord = vocabulary[shuffledIndices[currentIndex]];
    return (
      <div className={`min-h-screen ${bgClass} p-8`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={resetToMenu}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> Menu
            </button>
            <div className="bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-full">
              Score: {score} / {vocabulary.length}
            </div>
          </div>

          <div className={`${cardBg} rounded-3xl shadow-2xl p-12`}>
            <div className="text-center mb-8">
              <div className={`text-sm ${secondaryText} mb-4`}>Question {currentIndex + 1} of {vocabulary.length}</div>
              <div className={`text-5xl font-bold ${textColor} mb-2`}>{currentWord.korean}</div>
              <div className={`text-xl ${secondaryText} italic`}>[{currentWord.romanization}]</div>
            </div>

            <div className={`text-2xl ${textColor} mb-8 text-center font-semibold`}>What does this mean?</div>

            <div className="grid gap-4">
              {quizOptions.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option.korean === currentWord.korean;
                let buttonClass = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-100 hover:bg-gray-200 text-gray-800";
                if (answered) {
                  if (isSelected && isCorrect) buttonClass = "bg-green-500 text-white";
                  else if (isSelected && !isCorrect) buttonClass = "bg-red-500 text-white";
                  else if (isCorrect) buttonClass = darkMode ? "bg-green-700 text-green-100" : "bg-green-200 text-green-800";
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(option)}
                    disabled={answered}
                    className={`${buttonClass} font-bold py-6 px-8 rounded-2xl shadow-md transform hover:scale-102 transition-all text-xl flex items-center justify-between`}
                  >
                    <span>{option.english}</span>
                    {answered && isSelected && (isCorrect ? <CheckCircle className="w-7 h-7" /> : <XCircle className="w-7 h-7" />)}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={nextCard}
                  className={`bg-gradient-to-r ${darkMode ? 'from-emerald-700 to-green-700' : 'from-emerald-500 to-green-500'} hover:from-emerald-600 hover:to-green-600 text-white font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl`}
                >
                  {currentIndex === vocabulary.length - 1 ? 'See Results' : 'Next Question →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'results') {
    const percentage = Math.round((score / vocabulary.length) * 100);
    return (
      <div className={`min-h-screen ${bgClass} p-8 flex items-center justify-center`}>
        <div className={`${cardBg} max-w-2xl w-full rounded-3xl shadow-2xl p-12 text-center`}>
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
          <h2 className={`text-5xl font-bold ${textColor} mb-4`}>Great Job! 잘했어요!</h2>
          <div className={`text-7xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} mb-4`}>
            {score} / {vocabulary.length}
          </div>
          <div className={`text-3xl ${secondaryText} mb-8`}>{percentage}% Correct</div>
          <div className="mb-8">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-6 overflow-hidden`}>
              <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
            </div>
          </div>
          <button
            onClick={startQuiz}
            className={`bg-gradient-to-r ${darkMode ? 'from-emerald-700 to-green-700' : 'from-emerald-500 to-green-500'} hover:from-emerald-600 hover:to-green-600 text-white font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}

export default Day03;