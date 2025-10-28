import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "agent";
  content: string;
}

const presetPrompts = [
  {
    category: "Collections",
    prompts: [
      "Rank tenants by likelihood to pay this week",
      "Draft SMS and email for top 10 delinquent accounts",
    ],
  },
  {
    category: "Reconciliation",
    prompts: [
      "Explain today's unmatched items and generate variance report",
      "Identify patterns in reconciliation discrepancies",
    ],
  },
  {
    category: "Treasury",
    prompts: [
      "Target 550 bps over SOFR with OC ≥ 1.35; show expected yield",
      "Stress test: -20% BTC movement; show OC% impact path",
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
      // Get organization ID and user role from localStorage for multitenant isolation
      const orgData = localStorage.getItem("organization");
      const orgId = orgData ? JSON.parse(orgData).id : "demo-org";
      
      const userData = localStorage.getItem("user");
      const userRole = userData ? JSON.parse(userData).role : "Admin";

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId,
          "x-user-role": userRole,
        },
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
          AI-powered insights and analysis for your business
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Prompts</h2>
            <div className="space-y-6">
              {presetPrompts.map((category) => (
                <div key={category.category}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    {category.category}
                  </h3>
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
                        <Sparkles className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Bot className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Start a conversation</p>
                  <p className="text-sm">
                    Select a quick prompt or type your own question below
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${message.role}-${idx}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isStreaming && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
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
                  placeholder="Ask Naltos Agent anything..."
                  disabled={isStreaming}
                  data-testid="input-agent-message"
                />
                <Button type="submit" size="icon" disabled={isStreaming || !input.trim()} data-testid="button-send">
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
