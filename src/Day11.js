import React, { useState, useEffect } from 'react';
import { Book, Trophy, RotateCcw, CheckCircle, XCircle, Volume2 } from 'lucide-react';

function Day11({ darkMode }) {
  // Day 11 Vocabulary focused on Personality and Character
  const vocabulary = [
    { korean: '성격', english: 'personality', romanization: 'seonggyeok' },
    { korean: '활발하다', english: 'to be active, lively', romanization: 'hwalbalhada' },
    { korean: '부럽다', english: 'to be envious', romanization: 'bureopda' },
    { korean: '부족하다', english: 'to be insufficient', romanization: 'bujokada' },
    { korean: '겸손하다', english: 'to be humble', romanization: 'gyeomsonhada' },
    { korean: '장점', english: 'strength, advantage', romanization: 'jangjeom' },
    { korean: '물론', english: 'of course', romanization: 'mullon' },
    { korean: '단점', english: 'weakness, disadvantage', romanization: 'danjeom' },
    { korean: '거절', english: 'refusal, rejection', romanization: 'geojeol' },
    { korean: '들어주다', english: 'to listen, grant a request', romanization: 'deureojuda' }
  ];

  const [mode, setMode] = useState('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [shuffledIndices, setShuffledIndices] = useState([]);

  // Function to handle Text-to-Speech
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any current speech synthesis to avoid overlapping
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'ko-KR'; // Ensure Korean language is set

      // Attempt to find a suitable Korean voice (this selection is system-dependent)
      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find(voice => voice.lang === 'ko-KR' || voice.lang.startsWith('ko'));

      if (koreanVoice) {
        speech.voice = koreanVoice;
        // Optionally adjust rate for clearer pronunciation
        speech.rate = 0.9;
        speech.pitch = 1;
      }
      
      window.speechSynthesis.speak(speech);
    } else {
      console.error('Speech Synthesis not supported in this browser.');
    }
  };

  // Function to shuffle word indices for the quiz
  const shuffleWords = () => {
    const indices = Array.from({ length: vocabulary.length }, (_, i) => i);
    return indices.sort(() => Math.random() - 0.5);
  };

  // Function to generate 4 unique quiz options, including the correct one
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

  // Effect to generate new quiz options when moving to the next question
  useEffect(() => {
    // Only run if in quiz mode, indices are shuffled, and the current index is valid
    if (mode === 'quiz' && shuffledIndices.length > 0 && currentIndex < shuffledIndices.length) {
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

  // Tailwind CSS classes based on dark mode state and Day 11's rose/red theme
  const bgClass = darkMode
    ? "bg-gradient-to-br from-gray-900 via-rose-900 to-gray-800"
    : "bg-gradient-to-br from-rose-500 via-pink-500 to-red-400";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";
  const secondaryText = darkMode ? "text-gray-300" : "text-gray-500";
  const themeColor = darkMode ? 'text-rose-400' : 'text-rose-600'; // Main theme color
  const speakerClass = darkMode ? 'bg-gray-700 text-rose-300 hover:bg-gray-600' : 'bg-gray-100 text-rose-600 hover:bg-gray-200';


  // --- Menu Component ---
  if (mode === 'menu') {
    return (
      <div className={`min-h-screen ${bgClass} p-8 flex items-center justify-center`}>
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">Day 11</h1>
          <p className="text-2xl text-white/90">Korean Vocabulary Practice</p>
          <p className="text-lg text-white/80 mt-2">10 Essential Words</p>

          <div className="grid gap-6 mt-12">
            <button
              onClick={startFlashcards}
              className={`${cardBg} hover:bg-red-50 ${darkMode ? 'hover:bg-gray-700' : ''} ${themeColor} font-bold py-8 px-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-4`}
            >
              <Book className="w-10 h-10" />
              <div className="text-left">
                <div className="text-2xl">Flashcard Mode</div>
                <div className="text-sm opacity-70">Learn at your own pace</div>
              </div>
            </button>

            <button
              onClick={startQuiz}
              className={`${cardBg} hover:bg-red-50 ${darkMode ? 'hover:bg-gray-700' : ''} text-red-600 ${darkMode ? 'text-red-400' : ''} font-bold py-8 px-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-4`}
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

  // --- Flashcard Component ---
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
             <div className="text-white font-bold text-xl">
              Card {currentIndex + 1} / {vocabulary.length}
            </div>
          </div>

          {/* Flashcard Body */}
          <div className={`${cardBg} rounded-3xl shadow-2xl p-12 min-h-96 flex flex-col items-center justify-center cursor-pointer transform hover:scale-102 transition-all`}
               onClick={() => setShowAnswer(!showAnswer)}>
            <div className="text-center w-full">
              
              {/* Korean Word and Speaker Button */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div className={`text-8xl font-bold ${themeColor}`}>
                  {currentWord.korean}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents card flip when clicking the speaker
                    speakText(currentWord.korean);
                  }}
                  className={`mt-4 p-3 rounded-full ${speakerClass} transition-colors shadow-md`}
                  aria-label={`Listen to ${currentWord.korean}`}
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              {showAnswer ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className={`text-4xl ${textColor} font-semibold`}>{currentWord.english}</div>
                  <div className={`text-3xl ${secondaryText} font-medium`}>[{currentWord.romanization}]</div>
                </div>
              ) : (
                <div className="text-gray-400 text-xl mt-8 animate-pulse">Click to reveal answer</div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={nextCard}
              className={`${cardBg} hover:bg-red-50 ${darkMode ? 'hover:bg-gray-700 text-rose-400' : 'text-rose-600'} font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl`}
            >
              {currentIndex === vocabulary.length - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Quiz Component ---
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
              Score: {score} / {currentIndex}
            </div>
          </div>

          <div className={`${cardBg} rounded-3xl shadow-2xl p-12`}>
            <div className="text-center mb-8">
              <div className={`text-sm ${secondaryText} mb-4`}>Question {currentIndex + 1} of {vocabulary.length}</div>
              
              {/* Quiz Question: Korean Word + Speaker Button */}
              <div className="flex items-center justify-center gap-4">
                <div className={`text-5xl font-bold ${textColor} mb-2`}>{currentWord.korean}</div>
                <button
                    onClick={() => speakText(currentWord.korean)}
                    className={`p-2 rounded-full ${speakerClass} transition-colors shadow-md`}
                    aria-label={`Listen to ${currentWord.korean}`}
                >
                    <Volume2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className={`text-2xl ${secondaryText} font-medium`}>[{currentWord.romanization}]</div>
            </div>

            <div className={`text-2xl ${textColor} mb-8 text-center font-semibold`}>What does this mean?</div>

            <div className="grid gap-4">
              {quizOptions.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option.korean === currentWord.korean;
                let buttonClass = darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-100 hover:bg-gray-200 text-gray-800";
                
                // Styling when answered
                if (answered) {
                  if (isSelected && isCorrect) buttonClass = "bg-green-500 text-white shadow-lg shadow-green-500/50";
                  else if (isSelected && !isCorrect) buttonClass = "bg-red-500 text-white shadow-lg shadow-red-500/50";
                  else if (isCorrect) buttonClass = darkMode ? "bg-green-700 text-green-100 border-2 border-green-500" : "bg-green-200 text-green-800 border-2 border-green-500";
                  else buttonClass = darkMode ? "bg-gray-700 text-gray-400 opacity-60" : "bg-gray-100 text-gray-500 opacity-60";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(option)}
                    disabled={answered}
                    className={`${buttonClass} font-bold py-6 px-8 rounded-2xl shadow-md transform hover:scale-102 transition-all text-xl flex items-center justify-between disabled:cursor-not-allowed`}
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
                  className={`bg-gradient-to-r ${darkMode ? 'from-rose-700 to-red-700' : 'from-rose-500 to-red-500'} hover:from-rose-600 hover:to-red-600 text-white font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl`}
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

  // --- Results Component ---
  if (mode === 'results') {
    const percentage = Math.round((score / vocabulary.length) * 100);
    return (
      <div className={`min-h-screen ${bgClass} p-8 flex items-center justify-center`}>
        <div className={`${cardBg} max-w-2xl w-full rounded-3xl shadow-2xl p-12 text-center`}>
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
          <h2 className={`text-5xl font-bold ${textColor} mb-4`}>Great Job! 잘했어요!</h2>
          <div className={`text-7xl font-bold ${themeColor} mb-4`}>
            {score} / {vocabulary.length}
          </div>
          <div className={`text-3xl ${secondaryText} mb-8`}>{percentage}% Correct</div>
          <div className="mb-8">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-6 overflow-hidden`}>
              <div className="bg-gradient-to-r from-rose-400 to-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
            </div>
          </div>
          <button
            onClick={resetToMenu}
            className={`bg-gradient-to-r ${darkMode ? 'from-rose-700 to-red-700' : 'from-rose-500 to-red-500'} hover:from-rose-600 hover:to-red-600 text-white font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl`}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }
}

export default Day11;