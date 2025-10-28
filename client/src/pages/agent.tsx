import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles, TrendingUp, Zap, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "agent";
  content: string;
}

const presetPrompts = [
  {
    category: "Collections",
    icon: TrendingUp,
    prompts: [
      "Rank tenants by likelihood to pay this week",
      "Draft SMS and email for top 10 delinquent accounts",
      "Show payment trends and predict next month's collections",
    ],
  },
  {
    category: "Reconciliation",
    icon: BarChart3,
    prompts: [
      "Explain today's unmatched items and generate variance report",
      "Identify patterns in reconciliation discrepancies",
      "Summarize this month's reconciliation performance",
    ],
  },
  {
    category: "Treasury",
    icon: Zap,
    prompts: [
      "Target 550 bps over SOFR with OC ≥ 1.35; show expected yield",
      "Stress test: -20% BTC movement; show OC% impact path",
      "Analyze current treasury portfolio performance",
    ],
  },
];

export default function Agent() {
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
      const response = await fetch("/api/agent", {
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

  return (
    <div className="space-y-8" data-testid="page-agent">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Naltos Agent</h1>
        <p className="text-muted-foreground">
          AI-powered insights and analysis for property management operations
        </p>
      </div>

      {messages.length === 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Welcome to Naltos Agent</CardTitle>
                <CardDescription className="mt-1">
                  Your AI assistant for property management analytics and operations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Naltos Agent helps you analyze collections data, reconcile transactions, optimize treasury operations, and make data-driven decisions. Ask questions in natural language or use the quick prompts below to get started.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-2 p-3 bg-background rounded-lg border">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium">Smart Analysis</p>
                  <p className="text-xs text-muted-foreground">Get insights from your data with AI-powered analytics</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-background rounded-lg border">
                <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium">Predictive Insights</p>
                  <p className="text-xs text-muted-foreground">Forecast trends and identify patterns automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-background rounded-lg border">
                <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium">Real-time Answers</p>
                  <p className="text-xs text-muted-foreground">Get instant responses to complex business questions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Prompts</CardTitle>
              <CardDescription>
                Select a prompt to get started instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {presetPrompts.map((category) => (
                <div key={category.category}>
                  <div className="flex items-center gap-2 mb-3">
                    <category.icon className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold tracking-wide">
                      {category.category}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {category.prompts.map((prompt) => (
                      <Button
                        key={prompt}
                        variant="outline"
                        className="w-full text-left justify-start h-auto py-3 px-4 hover-elevate"
                        onClick={() => sendMessage(prompt)}
                        disabled={isStreaming}
                        data-testid={`button-preset-${prompt.substring(0, 20)}`}
                      >
                        <Sparkles className="mr-2 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                        <span className="text-sm">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <CardTitle>Conversation</CardTitle>
              </div>
              <CardDescription>
                Ask questions about your properties, tenants, collections, or treasury
              </CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Bot className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-lg font-medium mb-2">Start a conversation</p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Select a quick prompt from the left panel or type your own question below to begin analyzing your data
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
                            : "bg-muted border"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isStreaming && (
                    <div className="flex justify-start">
                      <div className="bg-muted border rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            <CardContent className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Naltos Agent anything about your portfolio..."
                  disabled={isStreaming}
                  className="flex-1"
                  data-testid="input-agent-message"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isStreaming || !input.trim()} 
                  data-testid="button-send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
