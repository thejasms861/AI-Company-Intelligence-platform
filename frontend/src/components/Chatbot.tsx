import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Hello! I'm your Placement Intelligence Assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) return null; // Only show if logged in

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/v1/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          role: user.role,
          username: user.username
        })
      });

      if (!response.ok) throw new Error("Failed to get response");
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble connecting to the server right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl transition-all duration-300 z-50",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100 hover:scale-110"
        )}
      >
        <MessageCircle size={28} />
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 transform origin-bottom-right overflow-hidden",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
          <div className="flex items-center gap-2">
            <Bot size={20} />
            <span className="font-bold">Intelligence Assistant</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex w-full gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-primary" />
                </div>
              )}
              
              <div className={cn(
                "px-4 py-2 rounded-2xl max-w-[80%] text-sm",
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-muted text-foreground rounded-tl-sm"
              )}>
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User size={16} className="text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex w-full gap-2 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-primary" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-muted text-foreground rounded-tl-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-border bg-muted/30 flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask anything..."
            className="flex-1 bg-background"
            disabled={isLoading}
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </>
  );
}
