"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const careerQuestions: Record<string, string[]> = {
  Biology: [
    "Do you prefer working in a lab or with patients?",
    "Are you interested in research or direct care?",
  ],
  Law: [
    "Do you prefer corporate law or criminal law?",
    "Would you like to work in a courtroom or in legal consulting?",
  ],
  Engineering: [
    "Are you interested in software or hardware?",
    "Do you enjoy coding or working with machines?",
  ],
  Medicine: [
    "Are you interested in surgery or general practice?",
    "Do you prefer working with children or adults?",
  ],
  Finance: [
    "Do you enjoy analyzing data or working with clients?",
    "Are you interested in investment banking or accounting?",
  ],
  Education: [
    "Do you prefer teaching young children or adults?",
    "Are you interested in classroom teaching or curriculum development?",
  ],
  Arts: [
    "Do you prefer visual arts or performing arts?",
    "Are you interested in digital design or traditional mediums?",
  ],
  Business: [
    "Do you prefer entrepreneurship or corporate management?",
    "Are you interested in marketing or operations?",
  ],
  Science: [
    "Are you interested in physics, chemistry, or environmental science?",
    "Do you prefer theoretical research or practical applications?",
  ],
  Technology: [
    "Do you prefer software development or cybersecurity?",
    "Are you interested in AI or cloud computing?",
  ],
  Journalism: [
    "Do you enjoy investigative reporting or feature writing?",
    "Are you interested in digital media or print journalism?",
  ],
  Psychology: [
    "Do you prefer clinical practice or research?",
    "Are you interested in counseling or neuropsychology?",
  ],
  Architecture: [
    "Do you enjoy designing buildings or urban planning?",
    "Are you interested in residential or commercial projects?",
  ],
  Social_Work: [
    "Do you prefer working with families or communities?",
    "Are you interested in policy advocacy or direct service?",
  ],
};

export default function CareerChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I’m here to help you find the right career path. What interests you?",
    },
  ]);

  const [input, setInput] = useState<string>(""); // Explicitly define as string
  const [preferences, setPreferences] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [stage, setStage] = useState("initial");
  const [animatedMessages, setAnimatedMessages] = useState<
    { role: string; text: string }[]
  >([]);

  const router = useRouter();
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data.user); // Update state with user data
      }
    };

    fetchUser();

    // Listen for auth state changes (e.g., login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      let index = 0;

      setAnimatedMessages([
        ...messages.slice(0, -1),
        { role: lastMessage.role, text: "" },
      ]);

      const interval = setInterval(() => {
        if (index < lastMessage.text.length) {
          setAnimatedMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: lastMessage.role,
              text: lastMessage.text.slice(0, index + 1),
            };
            return newMessages;
          });
          index++;
        } else {
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [messages]);

  const saveUserResponse = async (
    userId: string,
    question: string,
    response: string
  ): Promise<void> => {
    const { data, error } = await supabase
      .from("user_responses")
      .insert([{ user_id: userId, question: question, response: response }]);

    if (error) {
      console.error("Error saving response:", error);
    } else {
      console.log("Response saved:", data);
    }
  };

  const saveUserInteraction = async (
    userId: string,
    role: "user" | "bot",
    message: string
  ): Promise<void> => {
    const { data, error } = await supabase
      .from("user_interactions")
      .insert([{ user_id: userId, message_role: role, message_text: message }]);

    if (error) {
      console.error("Error saving interaction:", error);
    } else {
      console.log("Interaction saved:", data);
    }
  };
  const saveUserPreference = async (
    userId: string,
    preference: string
  ): Promise<void> => {
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert([{ user_id: userId, preference: preference }]);

    if (error) {
      console.error("Error saving preference:", error);
    } else {
      console.log("Preference saved:", data);
    }
  };

  const handleCareerSelection = (career: keyof typeof careerQuestions) => {
    setCurrentBranch(career);
    setStage("questions");
    setMessages([
      ...messages,
      { role: "bot", text: `Great choice! ${careerQuestions[career][0]}` },
    ]);
    setQuestionIndex(1);
  };

  const handleQuestionResponse = async (response: string) => {
    let botReply = "";

    if (stage === "questions") {
      if (questionIndex < careerQuestions[currentBranch!]?.length) {
        botReply = careerQuestions[currentBranch!][questionIndex];
        setQuestionIndex(questionIndex + 1);
      } else {
        // Instead of asking for a questionnaire, switch to AI-generated responses
        const userMessages = [...messages, { role: "user", text: response }];
        botReply = await getGeminiResponse(userMessages);
        setStage("chat"); // Change stage to 'chat' to indicate AI responses now
      }
    } else {
      const userMessages = [...messages, { role: "user", text: response }];
      botReply = await getGeminiResponse(userMessages);
    }

    setMessages([
      ...messages,
      { role: "user", text: response },
      { role: "bot", text: botReply },
    ]);
    if (!user) {
      console.warn("Guest user detected. Responses are not saved.");
      return;
    }

    const { error } = await supabase
      .from("user_responses")
      .insert([{ user_id: user.id, answer: response }]);

    if (error) {
      console.error("Error saving response:", error.message);
    } else {
      console.log("User response saved!");
    }
  };

  const getGeminiResponse = async (
    userMessages: { role: string; text: string }[]
  ) => {
    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: userMessages }),
      });

      const data = await response.json();
      return data.reply || "Sorry, I couldn't process that.";
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      return "Error processing your request.";
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    handleQuestionResponse(input);
    setInput("");
  };

  const handleLogin = async () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="bg-[#54504a] shadow-lg border border-[#bcb8b6] rounded-xl p-4 overflow-hidden relative">
        <CardContent className="space-y-6 p-6">
          <div className="flex justify-between items-center border-b border-[#bcb8b6] pb-4">
            <h2 className="text-2xl font-medium text-[#DEDBD1]">
              {user ? `Welcome, ${user.email}` : "Guest Mode"}
            </h2>
            {user ? (
              <Button
                onClick={handleLogout}
                className="bg-[#7d7d7d] text-white hover:bg-[#C8BB96]"
              >
                Logout
              </Button>
            ) : (
              <Button
                onClick={handleLogin}
                className="bg-[#7d7d7d] text-white hover:bg-[#C8BB96]"
              >
                Login
              </Button>
            )}
          </div>
          <div className="h-[400px] overflow-y-auto p-6 border border-[#bcb8b6] rounded-xl bg-[#f8f7f4] space-y-4 relative">
            {animatedMessages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  msg.role === "bot" ? "justify-start" : "justify-end"
                }`}
              >
                <p
                  className={`px-4 py-2 rounded-lg max-w-[80%] text-sm ${
                    msg.role === "bot"
                      ? "bg-[#F5F2E4] text-[#54504a]"
                      : "bg-[#7d7d7d] text-white"
                  }`}
                >
                  {msg.text}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2 items-center border-t border-[#bcb8b6] pt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              className="bg-[#f8f7f4] text-[#54504a] border-[#bcb8b6] focus:ring-[#7d7d7d] rounded-xl px-4 py-2"
            />
            <Button
              onClick={sendMessage}
              className="bg-[#988f86] text-white hover:bg-[#C8BB96] rounded-xl px-6"
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
