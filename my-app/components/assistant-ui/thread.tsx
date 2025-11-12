"use client";

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ErrorPrimitive,
  useThread,
} from "@assistant-ui/react";
import { useState, useEffect, type FC } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  CopyIcon,
  CheckIcon,
  PencilIcon,
  RefreshCwIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Square,
  SendHorizontalIcon,
  Volume2,
  History,
  Trash2,
  Eye,
  ExternalLink,
} from "lucide-react";

import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MarkdownText } from "./markdown-text";
import { ToolFallback } from "./tool-fallback";
import { supabase } from "@/lib/supabaseClient";

type UserProfile = {
  id?: string;
  name: string;
  role: string;
  age: number | string;
  subject: string;
  chat_style: string;
  qualification?: string;
  email?: string;
};

type HistoryItem = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
};

type ThreadProps = {
  userEmail?: string;
  userRole?: string;
  variant?: "modern" | "classic";
  userProfile?: UserProfile | null;
  onSpeakText?: (text: string) => void;
  isTextToSpeechEnabled?: boolean;
};

// Add this helper function at the TOP
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// History Modal Component WITH COPY FUNCTIONALITY - FIXED VERSION
const HistoryModal: FC<{ userId: string | null; onClose: () => void }> = ({ userId, onClose }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null); // Add this state

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("history")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (error) {
        console.error("Error fetching history:", error);
        alert("Error loading history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const deleteHistoryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      const { error } = await supabase
        .from("history")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setHistory(history.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      alert("✅ Conversation deleted");
    } catch (error) {
      console.error("Error deleting history:", error);
      alert("Error deleting conversation");
    }
  };

  const handleCopyConversation = async () => {
    if (!selectedItem) return;
    
    const success = await copyToClipboard(selectedItem.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert("Failed to copy conversation");
    }
  };

  // DETAILED VIEW (when a conversation is selected)
  if (selectedItem) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <button
              onClick={() => setSelectedItem(null)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              ← Back
            </button>
            <h2 className="text-xl font-semibold text-gray-900 truncate max-w-md">{selectedItem.title}</h2>
            <div className="flex gap-2">
              {/* COPY BUTTON - Main copy functionality */}
              <button
                onClick={handleCopyConversation}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  copied 
                    ? "bg-green-500 text-white" 
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                title="Copy entire conversation"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={() => deleteHistoryItem(selectedItem.id)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-xs text-gray-500 mb-4">
              {new Date(selectedItem.created_at).toLocaleString()}
            </p>
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
              {selectedItem.content.split("\n").map((line, i) => (
                <div key={i} className={line.startsWith("**") ? "font-semibold mt-3" : ""}>
                  {line.replace(/\*\*/g, "")}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-2">
            <button
              onClick={() => setSelectedItem(null)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // LIST VIEW (showing all conversations)
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-900">Conversation History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No conversations saved yet</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {item.content.substring(0, 100)}...
                      </p>
                    </div>
                    
                    {/* ACTION BUTTONS - Copy, View, Delete */}
                    <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition">
                      {/* COPY BUTTON - Quick copy from list view - FIXED */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const success = await copyToClipboard(item.content);
                          if (success) {
                            setCopiedItemId(item.id);
                            setTimeout(() => setCopiedItemId(null), 1500);
                          } else {
                            alert("Failed to copy conversation");
                          }
                        }}
                        className={`p-2 rounded-lg transition flex items-center justify-center ${
                          copiedItemId === item.id
                            ? "bg-green-500 text-white"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title="Copy conversation"
                      >
                        {copiedItemId === item.id ? (
                          <CheckIcon className="w-4 h-4" />
                        ) : (
                          <CopyIcon className="w-4 h-4" />
                        )}
                      </button>

                      {/* VIEW BUTTON */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View full conversation"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const Thread: FC<ThreadProps> = ({ 
  userEmail = "guest@example.com", 
  userRole = "student",
  variant = "modern",
  userProfile = null,
  onSpeakText,
  isTextToSpeechEnabled = false
}) => {
  const { messages } = useThread();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSavingToHistory, setIsSavingToHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUserId(data.user?.id || null);
      } catch (error) {
        console.error("Error getting user:", error);
      }
    };
    getUser();
  }, []);

  const saveToHistory = async () => {
    if (!userId) {
      alert("Please log in to save conversations to History");
      return;
    }

    if (messages.length === 0) {
      alert("No conversation to save");
      return;
    }

    setIsSavingToHistory(true);
    try {
      const conversationText = messages
        .map(msg => {
          const role = msg.role === "user" ? "You" : "Assistant";
          const content = msg.content[0]?.type === "text" 
            ? msg.content[0].text 
            : "[Media content]";
          return `**${role}:** ${content}`;
        })
        .join("\n\n");

      const historyContent = `# Chat Conversation\n\n*Saved on ${new Date().toLocaleString()}*\n\n---\n\n${conversationText}`;
      
      const { data, error } = await supabase
        .from("history")
        .insert([
          { 
            user_id: userId, 
            content: historyContent,
            title: `Chat - ${new Date().toLocaleString()}`
          }
        ])
        .select()
        .single();

      if (error) throw error;
      alert("✅ Conversation saved to History!");
      
    } catch (error) {
      console.error("Error saving to history:", error);
      alert("Error saving to History. Please try again.");
    } finally {
      setIsSavingToHistory(false);
    }
  };

  const bgColor = variant === "modern" ? "bg-[#f7f6f3]" : "bg-background";

  const handleSpeakAssistantMessage = (content: string) => {
    if (isTextToSpeechEnabled && onSpeakText) {
      const cleanContent = content
        .replace(/[#*`~]/g, "")
        .replace(/\n/g, " ")
        .trim();
      
      if (cleanContent) {
        onSpeakText(cleanContent);
      }
    }
  };

  return (
    <>
      <ThreadPrimitive.Root
        className={`${bgColor} box-border flex h-full flex-col overflow-hidden`}
        style={{
          ["--thread-max-width" as string]: "42rem",
        }}
      >
        {/* Save & View History Buttons - BOTH IN THREAD COMPONENT */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {/* VIEW HISTORY BUTTON WITH COPY FUNCTIONALITY */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg shadow-md transition flex items-center gap-2 text-sm"
            title="View conversation history with copy functionality"
          >
            <Eye className="w-4 h-4" />
            View History
          </button>
          
          {/* SAVE BUTTON */}
          <button
            onClick={saveToHistory}
            disabled={isSavingToHistory}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {isSavingToHistory ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <History className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>

        <ThreadPrimitive.Viewport
          className={`flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8`}
          style={variant === "modern" ? {
            scrollbarColor: "#bfc8d0 #f7f6f3",
            scrollbarWidth: "thin",
          } : {}}
        >
          <ThreadWelcome variant={variant} userRole={userRole} userProfile={userProfile} />
          <ThreadPrimitive.Messages
            components={{
              UserMessage: (props) => (
                <UserMessage 
                  {...props} 
                  variant={variant}
                  onSpeakText={onSpeakText}
                  isTextToSpeechEnabled={isTextToSpeechEnabled}
                />
              ),
              EditComposer: (props) => <EditComposer {...props} variant={variant} />,
              AssistantMessage: (props) => (
                <AssistantMessage 
                  {...props} 
                  variant={variant} 
                  userProfile={userProfile}
                  onSpeak={handleSpeakAssistantMessage}
                  isTextToSpeechEnabled={isTextToSpeechEnabled}
                />
              ),
            }}
          />

          <ThreadPrimitive.If empty={false}>
            <div className="min-h-8 flex-grow" />
          </ThreadPrimitive.If>

          <div className="sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
            <ThreadScrollToBottom variant={variant} />
            <Composer 
              userRole={userRole} 
              variant={variant} 
              userProfile={userProfile}
            />
          </div>
        </ThreadPrimitive.Viewport>
      </ThreadPrimitive.Root>

      {/* History Modal WITH COPY FUNCTIONALITY */}
      {showHistoryModal && (
        <HistoryModal 
          userId={userId} 
          onClose={() => setShowHistoryModal(false)} 
        />
      )}
    </>
  );
};

const ThreadScrollToBottom: FC<{ variant?: "modern" | "classic" }> = ({ variant = "modern" }) => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC<{ variant?: "modern" | "classic"; userRole?: string; userProfile?: UserProfile | null }> = ({ 
  variant = "modern", 
  userRole = "student",
  userProfile = null
}) => {
  const userName = userProfile?.name || "there";
  
  return (
    <ThreadPrimitive.Empty>
      <div className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col px-4">
        <div className="flex w-full flex-grow flex-col items-center justify-center">
          <div className="flex size-full flex-col justify-center px-8 md:mt-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-semibold"
            >
              Hello {userName}!
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground/65 text-xl mt-2"
            >
              {userProfile?.role === "teacher" 
                ? "What would you like to create today?"
                : "How can I help you learn today?"
              }
            </motion.div>
            {userProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-muted-foreground/50 text-sm mt-2"
              >
                Ready to help with {userProfile.subject} in a {userProfile?.chat_style?.toLowerCase() || "friendly"} style.
              </motion.div>
            )}
          </div>
        </div>
        <ThreadWelcomeSuggestions 
          role={userRole} 
          variant={variant} 
          userProfile={userProfile}
        />
      </div>
    </ThreadPrimitive.Empty>
  );
};

const getSuggestionsForRole = (role: string, userProfile?: UserProfile | null) => {
  if (role === "teacher") {
    const subject = userProfile?.subject || "your subject";
    return [
      {
        title: "Create a quiz",
        label: `for ${subject}`,
        action: `Generate a quiz for ${subject} students that's engaging and educational.`,
      },
      {
        title: "Lesson plan ideas",
        label: `for teaching ${subject}`,
        action: `Suggest creative lesson plan ideas for teaching ${subject} concepts.`,
      },
      {
        title: "Student assessment",
        label: "methods and rubrics",
        action: `Help me create assessment methods and rubrics for ${subject}.`,
      },
      {
        title: "Classroom management",
        label: "tips and strategies",
        action: "Give me effective classroom management tips and engagement strategies.",
      },
    ];
  }
  
  const subject = userProfile?.subject || "your studies";
  const age = userProfile?.age;
  const ageText = age ? ` suitable for age ${age}` : "";
  
  return [
    {
      title: `Explain ${subject}`,
      label: "in simple terms",
      action: `Can you explain key concepts in ${subject} in simple terms${ageText}?`,
    },
    {
      title: "Help with homework",
      label: `${subject} problems`,
      action: `Can you help me understand and solve my ${subject} homework problems?`,
    },
    {
      title: "Study techniques",
      label: `for ${subject}`,
      action: `What are the best study techniques for learning ${subject}${ageText}?`,
    },
    {
      title: "Practice questions",
      label: `test my knowledge`,
      action: `Give me practice questions to test my understanding of ${subject}${ageText}.`,
    },
  ];
};

const ThreadWelcomeSuggestions: FC<{ 
  role?: string; 
  variant?: "modern" | "classic";
  userProfile?: UserProfile | null;
}> = ({ role = "student", variant = "modern", userProfile = null }) => {
  const suggestions = getSuggestionsForRole(role, userProfile);

  return (
    <div className="grid w-full gap-2 sm:grid-cols-2">
      {suggestions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className="[&:nth-child(n+3)]:hidden sm:[&:nth-child(n+3)]:block"
        >
          <ThreadPrimitive.Suggestion
            prompt={suggestedAction.action}
            method="replace"
            autoSend
            asChild
          >
            <Button
              variant="ghost"
              className="dark:hover:bg-accent/60 h-auto w-full flex-1 flex-wrap items-start justify-start gap-1 rounded-xl border px-4 py-3.5 text-left text-sm sm:flex-col hover:bg-blue-50 transition"
              aria-label={suggestedAction.action}
            >
              <span className="font-medium">{suggestedAction.title}</span>
              <p className="text-muted-foreground text-xs">{suggestedAction.label}</p>
            </Button>
          </ThreadPrimitive.Suggestion>
        </motion.div>
      ))}
    </div>
  );
};

const Composer: FC<{ userRole?: string; variant?: "modern" | "classic"; userProfile?: UserProfile | null }> = ({ 
  userRole = "student", 
  variant = "modern", 
  userProfile = null
}) => {
  const placeholder = userProfile 
    ? `Ask me about ${userProfile.subject}...`
    : "Send a message...";

  return (
    <div className="bg-background relative mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 px-4 pb-4 md:pb-6">
      <ComposerPrimitive.Root className="relative flex w-full flex-col rounded-2xl focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white border border-gray-200 shadow-sm">
        <ComposerPrimitive.Input
          placeholder={placeholder}
          className="bg-white placeholder:text-muted-foreground max-h-[calc(50dvh)] min-h-16 w-full resize-none rounded-t-2xl border-x border-t px-4 pt-2 pb-3 text-base outline-none"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <ComposerAction variant={variant} />
      </ComposerPrimitive.Root>
    </div>
  );
};

// Simple fix: Update the ComposerAction component
// Find this component in your thread.tsx and replace it:

const ComposerAction: FC<{ variant?: "modern" | "classic" }> = ({ variant = "modern" }) => {
  return (
    <div className="bg-gray-50 relative flex items-center justify-end rounded-b-2xl border-x border-b p-3">
      {/* ❌ REMOVED: Attach file button */}
      {/* <TooltipIconButton tooltip="Attach file" ... /> */}

      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <Button
            type="submit"
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white size-9 rounded-full transition-colors shadow-sm"
            aria-label="Send message"
          >
            <ArrowUpIcon className="size-4" />
          </Button>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>

      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <Button
            type="button"
            variant="default"
            className="bg-red-600 hover:bg-red-700 text-white size-9 rounded-full transition-colors shadow-sm"
            aria-label="Stop generating"
          >
            <Square className="size-3.5 fill-white" />
          </Button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </div>
  );
};

const AssistantMessage: FC<{ variant?: "modern" | "classic"; userProfile?: UserProfile | null; onSpeak?: (content: string) => void; isTextToSpeechEnabled?: boolean }> = ({ 
  variant = "modern", 
  userProfile = null,
  onSpeak,
  isTextToSpeechEnabled = false
}) => {
  const [messageContent, setMessageContent] = useState("");

  const handleSpeak = () => {
    if (onSpeak && messageContent) {
      onSpeak(messageContent);
    }
  };

  return (
    <MessagePrimitive.Root asChild>
      <motion.div
        className="relative mx-auto grid w-full max-w-[var(--thread-max-width)] grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] px-4 py-4"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role="assistant"
      >
        <div className="ring-border bg-background col-start-1 row-start-1 flex size-8 shrink-0 items-center justify-center rounded-full ring-1">
          <StarIcon size={14} />
        </div>

        <div className="text-foreground col-span-2 col-start-2 row-start-1 ml-4 leading-7 break-words">
          <MessagePrimitive.Content
            components={{
              Text: (props: any) => {
                useEffect(() => {
                  setMessageContent(props.text || "");
                }, [props.text]);
                return <MarkdownText {...props} />;
              },
              tools: { Fallback: ToolFallback },
            }}
          />
        </div>

        <AssistantActionBar 
          variant={variant} 
          onSpeak={handleSpeak}
          isTextToSpeechEnabled={isTextToSpeechEnabled}
        />

        <BranchPicker className="col-start-2 row-start-2 -ml-2 mr-2" />
      </motion.div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC<{ variant?: "modern" | "classic"; onSpeak?: () => void; isTextToSpeechEnabled?: boolean }> = ({ 
  variant = "modern",
  onSpeak,
  isTextToSpeechEnabled = false
}) => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="text-muted-foreground col-start-3 row-start-2 mt-3 ml-3 flex gap-1"
    >
      {isTextToSpeechEnabled && (
        <TooltipIconButton tooltip="Read aloud" onClick={onSpeak}>
          <Volume2 className="h-4 w-4" />
        </TooltipIconButton>
      )}
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied><CheckIcon /></MessagePrimitive.If>
          <MessagePrimitive.If copied={false}><CopyIcon /></MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh"><RefreshCwIcon /></TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC<{ variant?: "modern" | "classic"; onSpeakText?: (text: string) => void; isTextToSpeechEnabled?: boolean }> = ({ 
  variant = "modern", 
  onSpeakText,
  isTextToSpeechEnabled = false
}) => {
  const [messageContent, setMessageContent] = useState("");

  const handleSpeak = () => {
    if (onSpeakText && messageContent) {
      onSpeakText(messageContent);
    }
  };

  return (
    <MessagePrimitive.Root asChild>
      <motion.div
        className="mx-auto grid w-full max-w-[var(--thread-max-width)] auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-1 px-4 py-4 [&:where(>*)]:col-start-2"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role="user"
      >
        <UserActionBar variant={variant} />
        <div className="bg-muted text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl px-5 py-2.5 col-start-2 row-start-2">
          <MessagePrimitive.Content 
            components={{
              Text: (props: any) => {
                useEffect(() => {
                  setMessageContent(props.text || "");
                }, [props.text]);
                return <span>{props.text}</span>;
              }
            }}
          />
        </div>
        <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
      </motion.div>
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC<{ variant?: "modern" | "classic" }> = ({ variant = "modern" }) => {
  return (
    <ActionBarPrimitive.Root hideWhenRunning autohide="not-last" className="col-start-1 mt-2.5 mr-3 flex flex-col items-end">
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit"><PencilIcon /></TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC<{ variant?: "modern" | "classic" }> = ({ variant = "modern" }) => {
  return (
    <div className="mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-4 px-4">
      <ComposerPrimitive.Root className="bg-muted ml-auto flex w-full max-w-7/8 flex-col rounded-xl">
        <ComposerPrimitive.Input className="text-foreground flex min-h-[60px] w-full resize-none bg-transparent p-4 outline-none" autoFocus />
        <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild><Button variant="ghost">Cancel</Button></ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild><Button>Send</Button></ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({ className, ...rest }) => {
  return (
    <BranchPickerPrimitive.Root hideWhenSingleBranch className={cn("text-muted-foreground inline-flex items-center text-xs", className)} {...rest}>
      <BranchPickerPrimitive.Previous asChild><TooltipIconButton tooltip="Previous"><ChevronLeftIcon /></TooltipIconButton></BranchPickerPrimitive.Previous>
      <span className="font-medium"><BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count /></span>
      <BranchPickerPrimitive.Next asChild><TooltipIconButton tooltip="Next"><ChevronRightIcon /></TooltipIconButton></BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const StarIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0L9.79611 6.20389L16 8L9.79611 9.79611L8 16L6.20389 9.79611L0 8L6.20389 6.20389L8 0Z" fill="currentColor" />
  </svg>
);

export default Thread;
