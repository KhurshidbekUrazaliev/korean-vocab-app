import React, { useState, useEffect } from 'react';
import { Book, Trophy, RotateCcw, CheckCircle, XCircle, Volume2 } from 'lucide-react';

// Renamed the function to App to align with React single-file conventions
function App({ darkMode }) {
  const vocabulary = [
    { korean: '일기', english: 'diary', romanization: 'ilgi' },
    { korean: '외롭다', english: 'to be lonely', romanization: 'oeropta' },
    { korean: '사실', english: 'fact, truth', romanization: 'sasil' },
    { korean: '가정', english: 'home, household', romanization: 'gajeong' },
    { korean: '부모', english: 'parents', romanization: 'bumo' },
    { korean: '역할', english: 'role', romanization: 'yeokhal' },
    { korean: '직장', english: 'workplace, job', romanization: 'jikjang' },
    { korean: '키우다', english: 'to raise, to grow', romanization: 'kiuda' },
    { korean: '추억', english: 'memory', romanization: 'chueok' },
    { korean: '노력하다', english: 'to make an effort', romanization: 'noryeokhada' }
  ];

  const [mode, setMode] = useState('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [shuffledIndices, setShuffledIndices] = useState([]);

  // Function to handle Text-to-Speech (Re-introduced)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'ko-KR'; // Ensure Korean language is set

      const voices = window.speechSynthesis.getVoices();
      const koreanVoice = voices.find(voice => voice.lang === 'ko-KR' || voice.lang.startsWith('ko'));

      if (koreanVoice) {
        speech.voice = koreanVoice;
        speech.rate = 0.9;
        speech.pitch = 1;
      }

      window.speechSynthesis.speak(speech);
    } else {
      console.error('Speech Synthesis not supported in this browser.');
    }
  };


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

  // Determine the current word based on the mode
  const currentWord =
    mode === 'flashcard'
      ? vocabulary[currentIndex]
      : mode === 'quiz'
      ? vocabulary[shuffledIndices[currentIndex]]
      : null;


  // Styling based on darkMode
  const bgClass = darkMode
    ? 'bg-gradient-to-br from-gray-900 via-teal-900 to-gray-800'
    : 'bg-gradient-to-br from-teal-500 via-green-500 to-blue-400';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const secondaryText = darkMode ? 'text-gray-300' : 'text-gray-500';
  const primaryAccent = darkMode ? 'text-teal-400' : 'text-teal-600';
  const secondaryAccent = darkMode ? 'text-green-400' : 'text-green-600';

  if (mode === 'menu') {
    return (
      <div className={`min-h-screen ${bgClass} p-8 flex items-center justify-center`}>
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">Day 06</h1>
            <p className="text-2xl text-white/90">Korean Vocabulary Practice</p>
            <p className="text-lg text-white/80 mt-2">10 Essential Words</p>
          </div>
          <div className="grid gap-6">
            <button
              onClick={startFlashcards}
              className={`${cardBg} hover:bg-teal-50 ${darkMode ? 'hover:bg-gray-700' : ''} ${primaryAccent} font-bold py-8 px-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-4`}
            >
              <Book className="w-10 h-10" />
              <div className="text-left">
                <div className="text-2xl">Flashcard Mode</div>
                <div className="text-sm opacity-70">Learn at your own pace</div>
              </div>
            </button>

            <button
              onClick={startQuiz}
              className={`${cardBg} hover:bg-green-50 ${darkMode ? 'hover:bg-gray-700' : ''} ${secondaryAccent} font-bold py-8 px-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-4`}
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

  if (mode === 'flashcard' && currentWord) {
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

          <div
            className={`${cardBg} rounded-3xl shadow-2xl p-12 min-h-[24rem] flex flex-col items-center justify-center cursor-pointer transform hover:scale-[1.02] transition-all`}
            onClick={() => setShowAnswer(!showAnswer)}
          >
            <div className="text-center w-full">
              {/* Korean Word and Speaker Button (Re-introduced) */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div className={`text-8xl font-bold ${primaryAccent}`}>
                  {currentWord.korean}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents card flip when clicking the speaker
                    speakText(currentWord.korean);
                  }}
                  className={`mt-4 p-3 rounded-full ${darkMode ? 'bg-gray-700 text-teal-300 hover:bg-gray-600' : 'bg-gray-100 text-teal-600 hover:bg-gray-200'} transition-colors shadow-md`}
                  aria-label={`Listen to ${currentWord.korean}`}
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              {showAnswer ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className={`text-4xl font-semibold ${textColor}`}>{currentWord.english}</div>
                  <div className={`text-2xl italic ${secondaryText}`}>[{currentWord.romanization}]</div>
                </div>
              ) : (
                <div className="text-gray-400 text-xl mt-8 animate-pulse">Click to reveal answer</div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={nextCard}
              className={`${cardBg} hover:bg-teal-50 ${darkMode ? 'hover:bg-gray-700' : ''} ${primaryAccent} font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl`}
            >
              {currentIndex === vocabulary.length - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quiz' && currentWord) {
    const percentage = Math.round((score / vocabulary.length) * 100);
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
              <div className={`text-sm ${secondaryText} mb-4`}>
                Question {currentIndex + 1} of {vocabulary.length}
              </div>

              {/* Quiz Question: Korean Word + Speaker Button (Re-introduced) */}
              <div className="flex items-center justify-center gap-4">
                  <div className={`text-5xl font-bold ${textColor} mb-2`}>{currentWord.korean}</div>
                  <button
                      onClick={() => speakText(currentWord.korean)}
                      className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-teal-300 hover:bg-gray-600' : 'bg-gray-100 text-teal-600 hover:bg-gray-200'} transition-colors shadow-md`}
                      aria-label={`Listen to ${currentWord.korean}`}
                  >
                      <Volume2 className="w-5 h-5" />
                  </button>
              </div>

              <div className={`text-xl italic ${secondaryText}`}>[{currentWord.romanization}]</div>
            </div>

            <div className={`text-2xl ${textColor} mb-8 text-center font-semibold`}>What does this mean?</div>

            <div className="grid gap-4">
              {quizOptions.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option.korean === currentWord.korean;
                let buttonClass = darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800';

                if (answered) {
                  if (isSelected && isCorrect) buttonClass = 'bg-green-500 text-white';
                  else if (isSelected && !isCorrect) buttonClass = 'bg-red-500 text-white';
                  else if (isCorrect) buttonClass = darkMode ? 'bg-green-700 text-green-100' : 'bg-green-200 text-green-800';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(option)}
                    disabled={answered}
                    className={`${buttonClass} font-bold py-6 px-8 rounded-2xl shadow-md transform hover:scale-[1.02] transition-all text-xl flex items-center justify-between`}
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
                  className={`bg-gradient-to-r ${darkMode ? 'from-teal-700 to-green-700' : 'from-teal-500 to-green-500'} hover:${darkMode ? 'from-teal-600 to-green-600' : 'from-teal-400 to-green-400'} text-white font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl`}
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
        <div className={`max-w-2xl w-full ${cardBg} rounded-3xl shadow-2xl p-12 text-center`}>
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
          <h2 className={`text-5xl font-bold ${textColor} mb-4`}>Great Job! 잘했어요!</h2>
          <div className={`text-7xl font-bold ${primaryAccent} mb-4`}>
            {score} / {vocabulary.length}
          </div>
          <div className={`text-3xl ${secondaryText} mb-8`}>{percentage}% Correct</div>

          <div className="mb-8">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-6 overflow-hidden`}>
              <div className="bg-gradient-to-r from-green-400 to-teal-500 h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          <div className="grid gap-4">
            <button
              onClick={startQuiz}
              className={`bg-gradient-to-r ${darkMode ? 'from-teal-700 to-green-700' : 'from-teal-500 to-green-500'} hover:${darkMode ? 'from-teal-600 to-green-600' : 'from-teal-400 to-green-400'} text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl`}
            >
              Try Again
            </button>
            <button
              onClick={resetToMenu}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textColor} font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl`}
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;