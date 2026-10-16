
import React, { useState, useEffect } from 'react';
import { Task, QuizQuestion } from '../types';
import { CheckCircle2, ChevronRight, XCircle, Trophy, Zap, Share2, HelpCircle } from 'lucide-react';
import { getMarketQuiz } from '../services/geminiService';

interface EarnScreenProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateBalance: (id: string, amount: number) => void;
}

const EarnScreen: React.FC<EarnScreenProps> = ({ tasks, setTasks, updateBalance }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'success' | 'fail' | null>(null);

  const startQuiz = async () => {
    setLoading(true);
    const newQuiz = await getMarketQuiz();
    setQuiz(newQuiz);
    setLoading(false);
    setShowQuiz(true);
  };

  const submitQuiz = () => {
    if (selectedOption === null) return;
    if (selectedOption === quiz?.correctAnswer) {
      setQuizResult('success');
      // Update Task status
      const taskId = 't1';
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
      // Give reward (Asset 1 is USD)
      updateBalance('1', 0.50);
    } else {
      setQuizResult('fail');
    }
  };

  const shareApp = () => {
    const taskId = 't2';
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
      updateBalance('4', 10); // 10 Gems
      alert('Thanks for sharing! 10 GEMS added.');
    } else {
      alert('Already completed!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center p-3 bg-cyan-500/20 rounded-2xl mb-3">
          <Trophy className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold">Earn Center</h2>
        <p className="text-slate-500">Complete tasks to grow your wallet</p>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${task.completed ? 'bg-green-500/10' : 'bg-slate-800'}`}>
                {task.category === 'quiz' && <HelpCircle className={`w-6 h-6 ${task.completed ? 'text-green-500' : 'text-slate-400'}`} />}
                {task.category === 'share' && <Share2 className={`w-6 h-6 ${task.completed ? 'text-green-500' : 'text-slate-400'}`} />}
                {task.category === 'checkin' && <Zap className={`w-6 h-6 ${task.completed ? 'text-green-500' : 'text-slate-400'}`} />}
              </div>
              <div>
                <h3 className="font-bold">{task.title}</h3>
                <p className="text-xs text-slate-500">Reward: {task.reward} {task.rewardType}</p>
              </div>
            </div>
            {task.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <button 
                onClick={() => task.category === 'quiz' ? startQuiz() : shareApp()}
                className="bg-cyan-500 text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-cyan-400 transition-colors"
              >
                Start
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Quiz Modal Simulation */}
      {showQuiz && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => !quizResult && setShowQuiz(false)}></div>
            <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                {!quizResult ? (
                    <>
                        <div className="mb-6 flex justify-between items-start">
                            <h4 className="text-xl font-bold text-white">Market Quiz</h4>
                            <button onClick={() => setShowQuiz(false)} className="text-slate-500"><XCircle /></button>
                        </div>
                        {loading ? (
                            <div className="flex flex-col items-center py-12 gap-4">
                                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-400 animate-pulse">Consulting AI experts...</p>
                            </div>
                        ) : quiz && (
                            <div className="space-y-6">
                                <p className="text-slate-300 font-medium text-lg leading-relaxed">{quiz.question}</p>
                                <div className="space-y-3">
                                    {quiz.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedOption(idx)}
                                            className={`w-full p-4 rounded-2xl text-left transition-all border ${selectedOption === idx ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-transparent hover:border-slate-600'}`}
                                        >
                                            <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={selectedOption === null}
                                    onClick={submitQuiz}
                                    className="w-full bg-cyan-500 text-black font-bold py-4 rounded-2xl disabled:opacity-50"
                                >
                                    Confirm Answer
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-6">
                        {quizResult === 'success' ? (
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold">Correct!</h3>
                                <p className="text-slate-400">{quiz?.explanation}</p>
                                <div className="bg-slate-800 p-4 rounded-2xl">
                                    <p className="text-sm">You earned:</p>
                                    <p className="text-xl font-bold text-green-400">+$0.50 USD</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                    <XCircle className="w-12 h-12 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-bold">Not Quite!</h3>
                                <p className="text-slate-400">The correct answer was: <span className="text-white font-bold">{quiz?.options[quiz.correctAnswer]}</span></p>
                            </div>
                        )}
                        <button
                            onClick={() => setShowQuiz(false)}
                            className="mt-8 w-full bg-slate-800 text-white font-bold py-4 rounded-2xl"
                        >
                            Back to Tasks
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default EarnScreen;
