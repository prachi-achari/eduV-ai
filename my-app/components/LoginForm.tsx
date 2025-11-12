"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2, Sparkles, Check, X } from "lucide-react";

// Quiz questions for login page
const LOGIN_QUIZZES = [

  
  {
    id: 1,
    question: "Which dinosaur was known as the 'king of dinosaurs'?",
    options: ["Stegosaurus", "Triceratops", "Tyrannosaurus Rex", "Velociraptor"],
    correctAnswer: 2,
    revealItem: {
      name: "Tyrannosaurus Rex",
      emoji: "🦖",
      realm: "Prehistoric Earth",
      fact: "The king of dinosaurs with powerful jaws that could crush bone!"
    }
  },
  {
    id: 2,
    question: "Which ancient wonder had hanging gardens?",
    options: ["Great Pyramid", "Hanging Gardens of Babylon", "Colossus of Rhodes", "Lighthouse of Alexandria"],
    correctAnswer: 1,
    revealItem: {
      name: "Hanging Gardens",
      emoji: "🌿",
      realm: "Ancient Civilizations", 
      fact: "Legendary terraced gardens, one of the Seven Wonders of the Ancient World!"
    }
  },
  // 3-25 More
  {
    id: 3,
    question: "What planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Mercury"],
    correctAnswer: 1,
    revealItem: {
      name: "Mars",
      emoji: "🔴",
      realm: "Solar System",
      fact: "Mars gets its red coloring from iron oxide on its surface!"
    }
  },
  {
    id: 4,
    question: "Which animal is the largest mammal on Earth?",
    options: ["Elephant", "Giraffe", "Blue Whale", "Grizzly Bear"],
    correctAnswer: 2,
    revealItem: {
      name: "Blue Whale",
      emoji: "🐋",
      realm: "Oceans",
      fact: "The blue whale is the largest animal to have ever lived!"
    }
  },
  {
    id: 5,
    question: "Which bird is famous for its beautiful tail feathers?",
    options: ["Peacock", "Ostrich", "Swan", "Pelican"],
    correctAnswer: 0,
    revealItem: {
      name: "Peacock",
      emoji: "🦚",
      realm: "Bird Kingdom",
      fact: "Male peacocks fan out their colorful tail feathers to attract mates!"
    }
  },
  {
    id: 6,
    question: "Who painted the Mona Lisa?",
    options: ["Leonardo da Vinci", "Vincent Van Gogh", "Pablo Picasso", "Claude Monet"],
    correctAnswer: 0,
    revealItem: {
      name: "Da Vinci",
      emoji: "🎨",
      realm: "Renaissance",
      fact: "Leonardo da Vinci's 'Mona Lisa' is the world's most famous portrait!"
    }
  },
  {
    id: 7,
    question: "What is the chemical symbol for Gold?",
    options: ["Ag", "Gd", "Au", "Ga"],
    correctAnswer: 2,
    revealItem: {
      name: "Gold",
      emoji: "🥇",
      realm: "Periodic Table",
      fact: "Gold's symbol 'Au' comes from its Latin name, 'Aurum'!"
    }
  },
  {
    id: 8,
    question: "Who wrote the play ‘Romeo and Juliet’?",
    options: ["William Wordsworth", "William Shakespeare", "Charles Dickens", "Jane Austen"],
    correctAnswer: 1,
    revealItem: {
      name: "Shakespeare",
      emoji: "🎭",
      realm: "Literature",
      fact: "'Romeo and Juliet' is Shakespeare's most famous tragedy!"
    }
  },
  {
    id: 9,
    question: "What gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctAnswer: 1,
    revealItem: {
      name: "Carbon Dioxide",
      emoji: "🌱",
      realm: "Biology",
      fact: "Plants absorb CO₂ and release oxygen through photosynthesis!"
    }
  },
  {
    id: 10,
    question: "Which country is known as the Land of the Rising Sun?",
    options: ["China", "Japan", "Thailand", "India"],
    correctAnswer: 1,
    revealItem: {
      name: "Japan",
      emoji: "🇯🇵",
      realm: "Geography",
      fact: "'Nihon' or 'Nippon' means 'origin of the sun' in Japanese!"
    }
  },
  {
    id: 11,
    question: "How many planets are in the Solar System?",
    options: ["7", "8", "9", "10"],
    correctAnswer: 1,
    revealItem: {
      name: "Eight Planets",
      emoji: "🪐",
      realm: "Astronomy",
      fact: "The eight planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune!"
    }
  },
  {
    id: 12,
    question: "Which animal is known as ‘the ship of the desert’?",
    options: ["Horse", "Donkey", "Camel", "Goat"],
    correctAnswer: 2,
    revealItem: {
      name: "Camel",
      emoji: "🐫",
      realm: "Deserts",
      fact: "Camels store fat in their humps, helping them survive desert journeys!"
    }
  },
  {
    id: 13,
    question: "Who was the first person to walk on the moon?",
    options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Alan Shepard"],
    correctAnswer: 2,
    revealItem: {
      name: "Neil Armstrong",
      emoji: "🌕",
      realm: "Space Exploration",
      fact: "Neil Armstrong set foot on the moon in 1969 and said, 'That's one small step for man.'"
    }
  },
  {
    id: 14,
    question: "Which instrument has 88 keys?",
    options: ["Violin", "Guitar", "Flute", "Piano"],
    correctAnswer: 3,
    revealItem: {
      name: "Piano",
      emoji: "🎹",
      realm: "Music",
      fact: "Concert pianos have 88 keys: 52 white and 36 black!"
    }
  },
  {
    id: 15,
    question: "What is the largest continent by area?",
    options: ["Africa", "Asia", "Europe", "Australia"],
    correctAnswer: 1,
    revealItem: {
      name: "Asia",
      emoji: "🌏",
      realm: "Continents",
      fact: "Asia is the largest continent, covering a third of Earth's land!"
    }
  },
  {
    id: 16,
    question: "What is the boiling point of water at sea level?",
    options: ["90°C", "100°C", "110°C", "212°C"],
    correctAnswer: 1,
    revealItem: {
      name: "Boiling Water",
      emoji: "💧",
      realm: "Science Lab",
      fact: "Water boils at 100°C, which is 212°F!"
    }
  },
  {
    id: 17,
    question: "Which language do people speak in Brazil?",
    options: ["Spanish", "French", "Portuguese", "Italian"],
    correctAnswer: 2,
    revealItem: {
      name: "Portuguese",
      emoji: "🗣️",
      realm: "Languages",
      fact: "Brazil is the largest Portuguese-speaking country in the world!"
    }
  },
  {
    id: 18,
    question: "Which organ pumps blood through the body?",
    options: ["Lungs", "Heart", "Liver", "Kidney"],
    correctAnswer: 1,
    revealItem: {
      name: "Heart",
      emoji: "❤️",
      realm: "Human Body",
      fact: "Your heart beats around 100,000 times per day!"
    }
  },
  {
    id: 19,
    question: "What type of animal is a Komodo dragon?",
    options: ["Mammal", "Reptile", "Bird", "Fish"],
    correctAnswer: 1,
    revealItem: {
      name: "Komodo Dragon",
      emoji: "🦎",
      realm: "Wildlife",
      fact: "It's the world's largest lizard, found in Indonesia!"
    }
  },
  {
    id: 20,
    question: "Who invented the light bulb?",
    options: ["Nikola Tesla", "Isaac Newton", "Thomas Edison", "Albert Einstein"],
    correctAnswer: 2,
    revealItem: {
      name: "Thomas Edison",
      emoji: "💡",
      realm: "Inventors",
      fact: "Thomas Edison is credited with inventing the first practical electric light bulb!"
    }
  },
  {
    id: 21,
    question: "Which element's chemical symbol is 'O'?",
    options: ["Osmium", "Oxygen", "Oxide", "Oganesson"],
    correctAnswer: 1,
    revealItem: {
      name: "Oxygen",
      emoji: "🫧",
      realm: "Chemistry",
      fact: "Oxygen is essential for respiration in most living organisms!"
    }
  },
  {
    id: 22,
    question: "What is the capital of France?",
    options: ["Lyon", "Paris", "London", "Rome"],
    correctAnswer: 1,
    revealItem: {
      name: "Paris",
      emoji: "🗼",
      realm: "World Capitals",
      fact: "The Eiffel Tower is Paris's most famous landmark!"
    }
  },
  {
    id: 23,
    question: "How many colors are there in a rainbow?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2,
    revealItem: {
      name: "Seven Colors",
      emoji: "🌈",
      realm: "Nature",
      fact: "A rainbow has seven colors: red, orange, yellow, green, blue, indigo, and violet!"
    }
  },
  {
    id: 24,
    question: "Which ocean is the largest?",
    options: ["Atlantic", "Arctic", "Indian", "Pacific"],
    correctAnswer: 3,
    revealItem: {
      name: "Pacific Ocean",
      emoji: "🌊",
      realm: "Earth's Waters",
      fact: "The Pacific Ocean covers one-third of the Earth's surface!"
    }
  },
  {
    id: 25,
    question: "What is the hardest natural substance?",
    options: ["Gold", "Diamond", "Iron", "Ruby"],
    correctAnswer: 1,
    revealItem: {
      name: "Diamond",
      emoji: "💎",
      realm: "Minerals",
      fact: "Diamonds are the hardest substance found in nature!"
    }
  }


];

export default function LoginForm() {
  const router = useRouter();
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

  const currentQuiz = LOGIN_QUIZZES[currentQuizIndex];

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
      if (currentQuizIndex < LOGIN_QUIZZES.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/assistant");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-4">
      <div className="flex w-full max-w-6xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl border border-white/20 overflow-hidden">
        {/* Left Side - Quiz & Revealed Items */}
        <div className="hidden lg:flex flex-1 p-8">
          <div className="w-full max-w-md mx-auto flex flex-col justify-center">
            {/* Quiz Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-300" />
                <h3 className="text-white font-semibold">Quick Cosmic Quiz</h3>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuizIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h4 className="text-white text-lg font-medium mb-4">
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
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                          showResult
                            ? index === currentQuiz.correctAnswer
                              ? 'bg-green-500/20 border-green-500 text-green-300'
                              : index === selectedAnswer
                              ? 'bg-red-500/20 border-red-500 text-red-300'
                              : 'bg-white/5 border-white/10 text-white/60'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showResult && (
                            <>
                              {index === currentQuiz.correctAnswer && (
                                <Check className="w-4 h-4 text-green-400" />
                              )}
                              {index === selectedAnswer && index !== currentQuiz.correctAnswer && (
                                <X className="w-4 h-4 text-red-400" />
                              )}
                            </>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Revealed Items Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Discovered Items
              </h3>

              <div className="space-y-4">
                <AnimatePresence>
                  {revealedItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border ${
                        item.correct 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{item.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${
                              item.correct ? 'text-green-300' : 'text-red-300'
                            }`}>
                              {item.name}
                            </h4>
                            {item.correct ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <p className="text-white/80 text-sm mb-1">{item.fact}</p>
                          <span className="text-xs text-white/60">{item.realm}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {revealedItems.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Answer questions to reveal cosmic items!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
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
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl"
              >
                <Lock className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-purple-200"> sign in</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/20 border border-red-500/30 rounded-xl p-4"
                >
                  <p className="text-red-200 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 pl-11 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 pl-11 pr-11 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-purple-200 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-8 pt-6 border-t border-white/20">
              <p className="text-purple-200 text-sm">
                New explorer?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="font-semibold text-white hover:text-purple-200 transition-colors duration-200 underline"
                >
                  Start your journey - Create Account
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
