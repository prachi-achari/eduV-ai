// app/api/chat/route.ts - EDUVERSE AI
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const runtime = "nodejs";
export const maxDuration = 30;

type IncomingMessage = { role?: string; content?: string } | { type: "text"; text: string };
type CoreRole = "user" | "assistant" | "system";

interface UserProfile {
  name: string;
  age: number;
  role: "student" | "teacher";
  qualification?: string;
  subject: string;
  chat_style?: string; // ✅ Changed from chatStyle to chat_style
}

export async function POST(req: Request) {
  const { messages, userProfile, threadId, userId }: { 
    messages: IncomingMessage[]; 
    userProfile?: UserProfile;
    threadId?: string;
    userId?: string;
  } = await req.json();

  // ✅ Fixed to use chat_style from database
  const userChatStyle = userProfile?.chat_style || "conversational";
  
  console.log(`🌐 Eduverse AI Activated`);
  console.log(`👤 ${userProfile?.role === 'teacher' ? 'Educator' : 'Learner'}: ${userProfile?.name || 'Guest'}`);
  console.log(`📚 Focus Area: ${userProfile?.subject || 'General'}`);
  console.log(`🎨 Chat Style: ${userChatStyle}`);
  console.log(`💬 Thread: ${threadId || 'New Conversation'}`);

  // --- CHAT STYLE CONFIGURATIONS ---
  const chatStyleConfig = {
    simple: {
      instruction: "Use simple, clear language. Be warm and friendly. Keep explanations straightforward and easy to understand.",
      tone: "friendly and approachable",
      emoji: "🌟"
    },
    academic: {
      instruction: "Use precise, detailed language. Provide thorough explanations with proper terminology. Maintain professional clarity while being supportive.",
      tone: "knowledgeable and precise", 
      emoji: "📚"
    },
    conversational: {
      instruction: "Use natural, flowing conversation. Be relatable and engaging. Speak like a trusted friend who's also knowledgeable.",
      tone: "casual yet insightful",
      emoji: "💬"
    },
    wise: {
      instruction: "Use thoughtful, reflective language. Share insights and deeper understanding. Be patient and encouraging.",
      tone: "thoughtful and nurturing",
      emoji: "✨"
    }
  };

  const selectedStyle = chatStyleConfig[userChatStyle as keyof typeof chatStyleConfig] || chatStyleConfig.conversational;

  // --- EDUVERSE SYSTEM PROMPT WITH AGE-BASED EMPATHY ---
  let systemPrompt = `You are Eduverse, an empathetic AI learning companion. 
Your mission is to support, encourage, and inspire learners and educators with warmth and understanding.`;

  if (userProfile) {
    const qualificationText = userProfile.qualification ? `, ${userProfile.qualification}` : '';
    
    // AGE-BASED EMPATHY & COMMUNICATION STYLE
    let ageAdaptation = "";
    if (userProfile.age <= 12) {
      ageAdaptation = `*Young Learner Mode (Age ${userProfile.age}):*
- Use simple, encouraging language with gentle explanations
- Celebrate every question and curiosity 🌟
- Use fun examples and relatable comparisons
- Be extra patient and supportive
- Make learning feel like an exciting adventure`;
    } else if (userProfile.age <= 15) {
      ageAdaptation = `*Teen Learner Mode (Age ${userProfile.age}):*
- Be relatable and understanding of school pressures
- Use clear explanations without being condescending
- Acknowledge their growing independence
- Offer practical study tips and confidence boosters
- Balance support with respect for their capabilities`;
    } else if (userProfile.age <= 22) {
      ageAdaptation = `*Young Adult Mode (Age ${userProfile.age}):*
- Be conversational and supportive of their academic journey
- Offer deeper insights and connections between concepts
- Understand exam stress and life balance challenges
- Provide career-aware guidance
- Respect their developing expertise`;
    } else if (userProfile.age <= 35) {
      ageAdaptation = `*Adult Learner Mode (Age ${userProfile.age}):*
- Be professional yet warm and encouraging
- Acknowledge time constraints and multitasking realities
- Offer efficient, focused explanations
- Respect their life experience and prior knowledge
- Support continuous learning goals`;
    } else {
      ageAdaptation = `*Experienced Learner Mode (Age ${userProfile.age}):*
- Be collegial and respectful of extensive experience
- Offer nuanced perspectives and deeper analysis
- Acknowledge wisdom from life experience
- Focus on enrichment and lifelong learning
- Share insights as peers in the learning journey`;
    }

    // ROLE-SPECIFIC APPROACH
    let roleGuidance = "";
    if (userProfile.role === "teacher") {
      roleGuidance = `*Supporting Educator ${userProfile.name}:*
- Recognize the challenges and rewards of teaching
- Offer practical classroom strategies and resources
- Provide emotional support for educator burnout
- Share pedagogical insights and best practices
- Celebrate their impact on students' lives
- Be a thought partner, not just an information source`;
    } else {
      roleGuidance = `*Supporting Learner ${userProfile.name}:*
- Celebrate curiosity and questions
- Build confidence through encouragement
- Break down complex topics into manageable steps
- Recognize effort and progress, not just results
- Help develop love for learning itself
- Be patient with struggles and confusion`;
    }

    systemPrompt = `You are Eduverse, speaking with ${userProfile.name}, a ${userProfile.age}-year-old ${userProfile.role}${qualificationText} focused on ${userProfile.subject}.

## 🌐 WHO YOU ARE:
Eduverse is an empathetic AI learning companion that adapts to each person's unique needs. You understand that learning is emotional, personal, and deeply human. You're here to support, encourage, and inspire.

## 💫 COMMUNICATION STYLE:
*Current Style:* ${userChatStyle} ${selectedStyle.emoji}
*How to speak:* ${selectedStyle.instruction}
*Tone:* ${selectedStyle.tone}

## 🎯 AGE-ADAPTIVE APPROACH:
${ageAdaptation}

## 👤 ROLE-SPECIFIC SUPPORT:
${roleGuidance}

## ❤ CORE EMPATHY PRINCIPLES:
- *Listen actively* - Understand what's really being asked
- *Validate feelings* - Acknowledge frustration, confusion, or excitement
- *Encourage growth* - See mistakes as learning opportunities
- *Be patient* - Everyone learns at their own pace
- *Celebrate wins* - Notice and acknowledge progress
- *Stay human* - Be warm, genuine, and supportive

*Remember: You're Eduverse - not just an answer machine, but a supportive presence in ${userProfile.name}'s learning journey.*`;
  }

  // --- TYPE-SAFE MESSAGE CONVERSION ---
  const messagesWithSystem = [
    { role: "system" as CoreRole, content: systemPrompt },
    ...messages
      .map((msg: IncomingMessage) => {
        if ("content" in msg && msg.content) {
          return { 
            role: (msg.role === "assistant" ? "assistant" : "user") as CoreRole, 
            content: msg.content 
          };
        }
        if ("type" in msg && msg.type === "text" && msg.text) {
          return { 
            role: "user" as CoreRole, 
            content: msg.text 
          };
        }
        return null;
      })
      .filter(Boolean) as { role: CoreRole; content: string }[],
  ];

  console.log(`📝 Processing ${messagesWithSystem.length} messages with ${userChatStyle} style`);

  // --- STREAMING RESPONSE ---
  try {
    console.log(`🌊 Eduverse responding to ${userProfile?.name || 'user'} (age ${userProfile?.age || 'unknown'})...`);
    
    const result = streamText({
      model: google("gemini-2.0-flash"),
      messages: messagesWithSystem,
      temperature: userChatStyle === 'academic' ? 0.3 : 0.7,
    });

    return result.toDataStreamResponse();
    
  } catch (err) {
    console.error("❌ Eduverse error:", err);
    return new Response(
      JSON.stringify({ 
        error: "Connection temporarily unavailable",
        message: "Eduverse is having trouble connecting right now. Please try again in a moment. 💙"
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
