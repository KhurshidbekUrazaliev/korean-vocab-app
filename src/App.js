import React, { useState, useEffect } from 'react';
import { Sparkles, Book, Trophy, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

function App() {
  const vocabulary = [
    { korean: '결정하다', english: 'to decide', romanization: 'gyeoljeong-hada' },
    { korean: '의견', english: 'opinion', romanization: 'uigyeon' },
    { korean: '차이', english: 'difference', romanization: 'chai' },
    { korean: '모이다', english: 'to gather', romanization: 'moida' },
    { korean: '찬성하다', english: 'to agree', romanization: 'chanseong-hada' },
    { korean: '반대하다', english: 'to oppose', romanization: 'bandae-hada' },
    { korean: '충분히', english: 'sufficiently', romanization: 'chungbun-hi' },
    { korean: '만족하다', english: 'to be satisfied', romanization: 'manjok-hada' },
    { korean: '방향', english: 'direction', romanization: 'banghyang' },
    { korean: '선택하다', english: 'to choose', romanization: 'seontaek-hada' }
  ];

  const [mode, setMode] = useState('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

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
    if (mode === 'quiz') {
      setQuizOptions(generateQuizOptions(currentIndex));
    }
  }, [currentIndex, mode]);

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
    
    if (option.korean === vocabulary[currentIndex].korean) {
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

  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-20 h-20 text-yellow-300 animate-pulse" />
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              한국어 공부
            </h1>
            <p className="text-2xl text-white/90">Korean Vocabulary Practice</p>
            <p className="text-lg text-white/80 mt-2">10 Essential Words - Day 05</p>
          </div>

          <div className="grid gap-6">
            <button
              onClick={startFlashcards}
              className="bg-white hover:bg-yellow-50 text-purple-600 font-bold py-8 px-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-4"
            >
              <Book className="w-10 h-10" />
              <div className="text-left">
                <div className="text-2xl">Flashcard Mode</div>
                <div className="text-sm opacity-70">Learn at your own pace</div>
              </div>
            </button>

            <button
              onClick={startQuiz}
              className="bg-white hover:bg-green-50 text-pink-600 font-bold py-8 px-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-4"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={resetToMenu}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Menu
            </button>
            <div className="text-white text-xl font-bold">
              {currentIndex + 1} / {vocabulary.length}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-12 min-h-96 flex flex-col items-center justify-center cursor-pointer transform hover:scale-102 transition-all"
               onClick={() => setShowAnswer(!showAnswer)}>
            <div className="text-center w-full">
              <div className="text-8xl font-bold text-purple-600 mb-8">
                {currentWord.korean}
              </div>
              
              {showAnswer && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-4xl text-gray-700 font-semibold">
                    {currentWord.english}
                  </div>
                  <div className="text-2xl text-gray-500 italic">
                    [{currentWord.romanization}]
                  </div>
                </div>
              )}
              
              {!showAnswer && (
                <div className="text-gray-400 text-xl mt-8 animate-pulse">
                  Click to reveal answer
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={nextCard}
              className="bg-white hover:bg-yellow-50 text-purple-600 font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl"
            >
              {currentIndex === vocabulary.length - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quiz') {
    const currentWord = vocabulary[currentIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={resetToMenu}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full backdrop-blur-sm flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Menu
            </button>
            <div className="bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-full">
              Score: {score} / {vocabulary.length}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="text-center mb-8">
              <div className="text-sm text-gray-500 mb-4">
                Question {currentIndex + 1} of {vocabulary.length}
              </div>
              <div className="text-5xl font-bold text-gray-800 mb-2">
                {currentWord.korean}
              </div>
              <div className="text-xl text-gray-500 italic">
                [{currentWord.romanization}]
              </div>
            </div>

            <div className="text-2xl text-gray-700 mb-8 text-center font-semibold">
              What does this mean?
            </div>

            <div className="grid gap-4">
              {quizOptions.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option.korean === currentWord.korean;
                let buttonClass = "bg-gray-100 hover:bg-gray-200 text-gray-800";
                
                if (answered) {
                  if (isSelected && isCorrect) {
                    buttonClass = "bg-green-500 text-white";
                  } else if (isSelected && !isCorrect) {
                    buttonClass = "bg-red-500 text-white";
                  } else if (isCorrect) {
                    buttonClass = "bg-green-200 text-green-800";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(option)}
                    disabled={answered}
                    className={`${buttonClass} font-bold py-6 px-8 rounded-2xl shadow-md transform hover:scale-102 transition-all text-xl flex items-center justify-between`}
                  >
                    <span>{option.english}</span>
                    {answered && isSelected && (
                      isCorrect ? 
                        <CheckCircle className="w-7 h-7" /> : 
                        <XCircle className="w-7 h-7" />
                    )}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={nextCard}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl"
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-bounce" />
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Great Job! 잘했어요!
          </h2>
          <div className="text-7xl font-bold text-purple-600 mb-4">
            {score} / {vocabulary.length}
          </div>
          <div className="text-3xl text-gray-600 mb-8">
            {percentage}% Correct
          </div>
          
          <div className="mb-8">
            <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="grid gap-4">
            <button
              onClick={startQuiz}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl"
            >
              Try Again
            </button>
            <button
              onClick={resetToMenu}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all text-xl"
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