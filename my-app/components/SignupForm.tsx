"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2, Sparkles, Check, X, User } from "lucide-react";

// Quiz questions for signup page (Solar System & Deep Space)
const SIGNUP_QUIZZES = [
  
  
  {
    id: 1,
    question: "Which planet is closest to the Sun?",
    options: ["Earth", "Venus", "Mars", "Mercury"],
    correctAnswer: 3,
    revealItem: {
      name: "Mercury",
      emoji: "☿️",
      realm: "Solar System",
      fact: "Mercury is so close to the Sun that its surface can reach temperatures over 400°C!"
    }
  },
  {
    id: 2,
    question: "Which metal is liquid at room temperature?",
    options: ["Iron", "Mercury", "Lead", "Silver"],
    correctAnswer: 1,
    revealItem: {
      name: "Mercury",
      emoji: "💧",
      realm: "Chemistry",
      fact: "Mercury is the only metal that is liquid at standard conditions for temperature and pressure."
    }
  },
  {
    id: 3,
    question: "Who is known as the father of computers?",
    options: ["Alan Turing", "Charles Babbage", "Bill Gates", "Steve Jobs"],
    correctAnswer: 1,
    revealItem: {
      name: "Charles Babbage",
      emoji: "🧮",
      realm: "Inventions",
      fact: "Babbage designed the first mechanical computer, the Analytical Engine, in the 1830s!"
    }
  },
  {
    id: 4,
    question: "Which mammal can fly?",
    options: ["Bat", "Flying Squirrel", "Ostrich", "Eagle"],
    correctAnswer: 0,
    revealItem: {
      name: "Bat",
      emoji: "🦇",
      realm: "Wildlife",
      fact: "Bats are the only true flying mammals on Earth!"
    }
  },
  {
    id: 5,
    question: "Who discovered penicillin?",
    options: ["Marie Curie", "Alexander Fleming", "Louis Pasteur", "Isaac Newton"],
    correctAnswer: 1,
    revealItem: {
      name: "Fleming",
      emoji: "🧫",
      realm: "Medicine",
      fact: "In 1928, Alexander Fleming accidentally discovered the antibiotic penicillin."
    }
  },
  {
    id: 6,
    question: "What is the main gas in Earth’s atmosphere?",
    options: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Nitrogen"],
    correctAnswer: 3,
    revealItem: {
      name: "Nitrogen",
      emoji: "💨",
      realm: "Earth Science",
      fact: "Nitrogen makes up 78% of Earth's atmosphere."
    }
  },
  {
    id: 7,
    question: "What is the largest organ in the human body?",
    options: ["Heart", "Liver", "Skin", "Lungs"],
    correctAnswer: 2,
    revealItem: {
      name: "Skin",
      emoji: "🖐️",
      realm: "Anatomy",
      fact: "Your skin is your body's largest organ, protecting everything inside!"
    }
  },
  {
    id: 8,
    question: "What instrument measures earthquakes?",
    options: ["Barometer", "Thermometer", "Seismograph", "Anemometer"],
    correctAnswer: 2,
    revealItem: {
      name: "Seismograph",
      emoji: "🌎",
      realm: "Earthquakes",
      fact: "A seismograph records the vibrations of the earth during an earthquake."
    }
  },
  {
    id: 9,
    question: "What is the square root of 144?",
    options: ["10", "12", "14", "16"],
    correctAnswer: 1,
    revealItem: {
      name: "12",
      emoji: "➗",
      realm: "Math",
      fact: "12 × 12 = 144, so the square root of 144 is 12!"
    }
  },
  {
    id: 10,
    question: "Which continent has the largest desert?",
    options: ["Asia", "Antarctica", "Africa", "Australia"],
    correctAnswer: 1,
    revealItem: {
      name: "Antarctica",
      emoji: "❄️",
      realm: "Geography",
      fact: "Antarctica is the coldest, windiest, and driest desert on Earth!"
    }
  },
  {
    id: 11,
    question: "What is the tallest mountain in the world?",
    options: ["K2", "Kilimanjaro", "Everest", "Elbrus"],
    correctAnswer: 2,
    revealItem: {
      name: "Mount Everest",
      emoji: "🏔️",
      realm: "Mountains",
      fact: "Mount Everest's summit is 8,848 meters above sea level!"
    }
  },
  {
    id: 12,
    question: "Which planet is known for its rings?",
    options: ["Mars", "Venus", "Saturn", "Jupiter"],
    correctAnswer: 2,
    revealItem: {
      name: "Saturn",
      emoji: "💍",
      realm: "Planets",
      fact: "Saturn’s beautiful rings are made mostly of ice and rock particles."
    }
  },
  {
    id: 13,
    question: "What is the smallest prime number?",
    options: ["1", "2", "3", "5"],
    correctAnswer: 1,
    revealItem: {
      name: "2",
      emoji: "🔢",
      realm: "Math",
      fact: "2 is the smallest and the only even prime number!"
    }
  },
  {
    id: 14,
    question: "Who wrote ‘The Adventures of Tom Sawyer’?",
    options: ["Mark Twain", "Jane Austen", "Charles Dickens", "Ernest Hemingway"],
    correctAnswer: 0,
    revealItem: {
      name: "Mark Twain",
      emoji: "📚",
      realm: "Classics",
      fact: "'Tom Sawyer' and its sequel 'Huckleberry Finn' are American literature staples."
    }
  },
  {
    id: 15,
    question: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correctAnswer: 2,
    revealItem: {
      name: "Canberra",
      emoji: "🇦🇺",
      realm: "Capitals",
      fact: "Canberra was chosen as the capital to resolve rivalry between Sydney and Melbourne."
    }
  },
  {
    id: 16,
    question: "What do bees collect and use to create honey?",
    options: ["Water", "Pollen", "Nectar", "Leaves"],
    correctAnswer: 2,
    revealItem: {
      name: "Nectar",
      emoji: "🍯",
      realm: "Nature",
      fact: "Bees turn nectar gathered from flowers into sweet, golden honey."
    }
  },
  {
    id: 17,
    question: "Who is known for developing the laws of motion and gravity?",
    options: ["Galileo Galilei", "Johannes Kepler", "Isaac Newton", "Albert Einstein"],
    correctAnswer: 2,
    revealItem: {
      name: "Isaac Newton",
      emoji: "🍏",
      realm: "Physics",
      fact: "Legend says an apple falling from a tree inspired Newton's law of gravity."
    }
  },
  {
    id: 18,
    question: "What’s the fastest animal on land?",
    options: ["Lion", "Horse", "Cheetah", "Greyhound"],
    correctAnswer: 2,
    revealItem: {
      name: "Cheetah",
      emoji: "🐆",
      realm: "Wildlife",
      fact: "The cheetah can reach speeds up to 110 km/h in short bursts!"
    }
  },
  {
    id: 19,
    question: "What is the largest island in the world?",
    options: ["Greenland", "Australia", "New Guinea", "Borneo"],
    correctAnswer: 0,
    revealItem: {
      name: "Greenland",
      emoji: "🇬🇱",
      realm: "Geography",
      fact: "Greenland covers over 2 million square kilometers."
    }
  },
  {
    id: 20,
    question: "Who invented the telephone?",
    options: ["Alexander Graham Bell", "Nikola Tesla", "Michael Faraday", "James Watt"],
    correctAnswer: 0,
    revealItem: {
      name: "Graham Bell",
      emoji: "☎️",
      realm: "Inventions",
      fact: "Bell famously said, 'Mr. Watson, come here, I want to see you.'"
    }
  },
  {
    id: 21,
    question: "What is the symbol for Iron on the periodic table?",
    options: ["Ir", "Fe", "In", "I"],
    correctAnswer: 1,
    revealItem: {
      name: "Iron",
      emoji: "⚙️",
      realm: "Chemistry",
      fact: "Fe comes from the Latin word 'Ferrum'."
    }
  },
  {
    id: 22,
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 2,
    revealItem: {
      name: "Jupiter",
      emoji: "🪐",
      realm: "Planets",
      fact: "Jupiter is so massive, it has over 75 moons!"
    }
  },
  {
    id: 23,
    question: "What famous structure did Gustave Eiffel design?",
    options: ["Empire State Building", "Statue of Liberty", "Eiffel Tower", "Big Ben"],
    correctAnswer: 2,
    revealItem: {
      name: "Eiffel Tower",
      emoji: "🗼",
      realm: "Architecture",
      fact: "The Eiffel Tower is made of over 18,000 metallic parts!"
    }
  },
  {
    id: 24,
    question: "Which planet has the most spectacular ring system?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctAnswer: 1,
    revealItem: {
      name: "Saturn",
      emoji: "🪐",
      realm: "Solar System",
      fact: "Gas giant with rings made of ice particles - could float in water due to low density!"
    }
  },
  {
    id: 25,
    question: "What is at the center of our Milky Way galaxy?",
    options: ["Giant Star", "Neutron Star", "Supermassive Black Hole", "Dark Matter"],
    correctAnswer: 2,
    revealItem: {
      name: "Black Hole",
      emoji: "⚫",
      realm: "Deep Space", 
      fact: "Supermassive black hole with gravity so strong not even light can escape!"
    }
  }


];

export default function SignupForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [revealedItems, setRevealedItems] = useState<any[]>([]);

  const currentQuiz = SIGNUP_QUIZZES[currentQuizIndex];

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    // Add to revealed items regardless of correct/incorrect
    setRevealedItems(prev => [...prev, {
      ...currentQuiz.revealItem,
      correct: answerIndex === currentQuiz.correctAnswer
    }]);

    // Move to next quiz after delay
    setTimeout(() => {
      if (currentQuizIndex < SIGNUP_QUIZZES.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 2000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      
      if (error) {
        setError(error.message);
        return;
      }
      
      if (data.user) {
        router.push("/assistant");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="flex w-full max-w-6xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden">
        {/* Left Side - Quiz & Revealed Items */}
        <div className="hidden lg:flex flex-1 p-8">
          <div className="w-full max-w-lg mx-auto flex flex-col justify-center space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Eduverse  Explorer
              </h1>
              <p className="text-blue-200 text-lg">Journey Through Space & Time</p>
            </motion.div>

            {/* Quiz Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 rounded-2xl p-8 border border-white/20 flex-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Cosmic Knowledge Facts</h3>
                  {/* <p className="text-blue-200 text-sm">Test your space knowledge!</p> */}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuizIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-white text-xl font-semibold mb-4 leading-relaxed">
                      {currentQuiz.question}
                    </h4>

                    <div className="space-y-3">
                      {currentQuiz.options.map((option, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => !showResult && handleAnswer(index)}
                          disabled={showResult}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-lg ${
                            showResult
                              ? index === currentQuiz.correctAnswer
                                ? 'bg-green-500/20 border-green-500 text-green-300'
                                : index === selectedAnswer
                                ? 'bg-red-500/20 border-red-500 text-red-300'
                                : 'bg-white/5 border-white/10 text-white/60'
                              : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-blue-400/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{option}</span>
                            {showResult && (
                              <>
                                {index === currentQuiz.correctAnswer && (
                                  <Check className="w-6 h-6 text-green-400" />
                                )}
                                {index === selectedAnswer && index !== currentQuiz.correctAnswer && (
                                  <X className="w-6 h-6 text-red-400" />
                                )}
                              </>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Revealed Items Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 rounded-2xl p-6 border border-white/20 flex-1 max-h-[300px] overflow-y-auto"
            >
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Your Cosmic Discoveries
                <span className="text-blue-300 text-sm font-normal">
                  ({revealedItems.length}/2)
                </span>
              </h3>

              <div className="space-y-4">
                <AnimatePresence>
                  {revealedItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border-2 ${
                        item.correct 
                          ? 'bg-green-500/10 border-green-500/50' 
                          : 'bg-red-500/10 border-red-500/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl flex-shrink-0">{item.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className={`font-bold text-lg ${
                              item.correct ? 'text-green-300' : 'text-red-300'
                            }`}>
                              {item.name}
                            </h4>
                            {item.correct ? (
                              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                            ) : (
                              <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-white/90 text-sm mb-2 leading-relaxed">{item.fact}</p>
                          <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full">
                            {item.realm}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {revealedItems.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg">Answer questions to reveal cosmic wonders!</p>
                    <p className="text-sm mt-1">Discover Saturn and Black Holes!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex-1 p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-md mx-auto h-full flex flex-col justify-center"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-3">Join EDUVERSE-AI</h2>
              <p className="text-blue-200 text-lg">Start your journey</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border-2 border-red-500/30 rounded-xl p-4"
                >
                  <p className="text-red-200 text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-3">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="First Name"
                      className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4 pl-12 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-3">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4 pl-12 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4 pl-12 pr-12 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-200 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Signup Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    SignUp - Create Account
                  </>
                )}
              </motion.button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-white/20">
              <p className="text-blue-200 text-lg">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-bold text-white hover:text-cyan-300 transition-colors duration-200 underline text-lg"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
