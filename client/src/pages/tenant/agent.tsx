import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Calendar, DollarSign, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "agent";
  content: string;
}

const tenantPrompts = [
  {
    category: "Payments",
    icon: DollarSign,
    prompts: [
      "Set up autopay for my rent",
      "Show my payment history",
      "Help me split rent with my roommate",
    ],
  },
  {
    category: "Account",
    icon: Calendar,
    prompts: [
      "When is my lease renewal date?",
      "Send me a payment reminder 3 days before rent is due",
      "What payment methods do I have on file?",
    ],
  },
  {
    category: "Maintenance",
    icon: Wrench,
    prompts: [
      "Submit a maintenance request",
      "Check status of my recent request",
      "Emergency contact information",
    ],
  },
];

export default function TenantAgent() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/tenant/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ prompt: content }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let agentContent = "";

      if (reader) {
        const agentMessage: Message = { role: "agent", content: "" };
        setMessages((prev) => [...prev, agentMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          agentContent += chunk;
          
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "agent", content: agentContent };
            return updated;
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from agent.",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="space-y-6" data-testid="page-tenant-agent">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--tenant-foreground))" }}>Naltos Assistant</h1>
        <p className="text-base" style={{ color: "hsl(var(--tenant-muted-foreground))" }}>
          Your personal AI assistant for rent and account management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Prompts */}
        <div className="lg:col-span-1 space-y-4">
          {messages.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Prompts</CardTitle>
                <CardDescription>
                  Select a prompt to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {tenantPrompts.map((category) => (
                  <div key={category.category}>
                    <div className="flex items-center gap-2 mb-3">
                      <category.icon className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">{category.category}</h3>
                    </div>
                    <div className="space-y-2">
                      {category.prompts.map((prompt, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"
                          onClick={() => sendMessage(prompt)}
                          disabled={isStreaming}
                          data-testid={`button-preset-${prompt.slice(0, 20)}`}
                        >
                          <span className="text-xs break-words">{prompt}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Conversation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <CardTitle>Conversation</CardTitle>
            </div>
            <CardDescription>
              Ask questions about your rent, payments, or account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Bot className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">How can I help you today?</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Ask me anything about your rent payments, account settings, or maintenance requests
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message, idx) => (
                      <div
                        key={idx}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        data-testid={`message-${message.role}-${idx}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isStreaming}
                  className="flex-1"
                  data-testid="input-agent-message"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isStreaming || !input.trim()}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
