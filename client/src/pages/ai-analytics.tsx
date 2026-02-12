import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  DollarSign,
  ArrowUp,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const analyticsCategories = [
  {
    id: "portfolio",
    label: "Portfolio",
    icon: BarChart3,
    prompts: [
      "What is the on-time payment rate across all properties this quarter?",
      "Compare occupancy rates and revenue per unit across my portfolio",
      "Which properties are underperforming relative to market benchmarks?",
      "Show me a breakdown of NOI by property for the last 6 months",
    ],
  },
  {
    id: "collections",
    label: "Collections",
    icon: Users,
    prompts: [
      "Rank tenants by delinquency risk and suggest intervention strategies",
      "What is the average days sales outstanding (DSO) trend over the past year?",
      "Identify tenants who have improved their payment behavior recently",
      "What percentage of late payments convert to collections each month?",
    ],
  },
  {
    id: "revenue",
    label: "Revenue",
    icon: DollarSign,
    prompts: [
      "Forecast next quarter's rent revenue based on current occupancy and lease terms",
      "How much yield has been generated from rent float this month?",
      "What is the total cash flow impact of our behavioral incentive programs?",
      "Analyze the relationship between incentive spend and on-time payment improvement",
    ],
  },
  {
    id: "behavioral",
    label: "Behavioral",
    icon: Brain,
    prompts: [
      "Which incentive programs have the highest ROI on on-time payment conversion?",
      "Segment tenants by payment behavior patterns and suggest targeted incentives",
      "What is the correlation between cashback rewards and tenant retention?",
      "Predict which tenants are at risk of lease non-renewal based on behavior data",
    ],
  },
  {
    id: "treasury",
    label: "Treasury",
    icon: TrendingUp,
    prompts: [
      "What is the current weighted average yield across all treasury products?",
      "Compare yield performance of NRF vs NRK vs NRC products this quarter",
      "Stress test the portfolio: what happens if 20% of tenants are 30+ days late?",
      "Optimize my treasury allocation to maximize yield while maintaining 135% OC ratio",
    ],
  },
  {
    id: "vendor",
    label: "Vendor",
    icon: PieChart,
    prompts: [
      "What is the average vendor payment float and yield generated per vendor?",
      "Identify vendor payment patterns that could benefit from instant payment terms",
      "Break down operating expenses per unit across all properties",
      "Which vendor categories represent the best opportunity for float yield optimization?",
    ],
  },
];

export default function AIAnalytics() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCategory, setActiveCategory] = useState("portfolio");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      const response = await fetch("/api/ai-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt: content }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        const assistantMessage: Message = { role: "assistant", content: "", timestamp: new Date() };
        setMessages((prev) => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantContent += chunk;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantContent, timestamp: new Date() };
            return updated;
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get analytics response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const copyMessage = (idx: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const selectedCategory = analyticsCategories.find((c) => c.id === activeCategory)!;

  const hasMessages = messages.length > 0;

  return (
    <div className="-mx-8 -my-6 flex flex-col h-[calc(100vh-73px)]" data-testid="page-ai-analytics">
      {hasMessages && (
        <div className="flex items-center justify-between gap-4 px-4 py-2 border-b flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Analytics Agent</span>
            <Badge variant="secondary" className="text-xs" data-testid="badge-ai-model">
              NLP Intelligence
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            data-testid="button-clear-conversation"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            New chat
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
            <div className="w-full max-w-3xl space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight" data-testid="heading-greeting">
                  What would you like to analyze?
                </h1>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Ask questions about your portfolio in plain language and get data-driven insights powered by AI
                </p>
              </div>

              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {analyticsCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat.id)}
                    className="toggle-elevate"
                    data-testid={`tab-cat-${cat.id}`}
                  >
                    <cat.icon className="w-3.5 h-3.5 mr-1.5" />
                    {cat.label}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCategory.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    disabled={isStreaming}
                    className="group text-left p-4 rounded-md border bg-card hover-elevate active-elevate-2 transition-colors disabled:opacity-50"
                    data-testid={`button-prompt-${prompt.substring(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <p className="text-sm leading-relaxed">{prompt}</p>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <selectedCategory.icon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{selectedCategory.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message, idx) => (
              <div key={idx} data-testid={`message-${message.role}-${idx}`}>
                {message.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      {message.content && (
                        <div className="flex items-center gap-1 mt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyMessage(idx, message.content)}
                            data-testid={`button-copy-${idx}`}
                          >
                            {copiedIdx === idx ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex items-center gap-1.5 py-2">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t bg-background">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <div className="flex items-end gap-2 rounded-xl border bg-card p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask an analytics question about your portfolio..."
                disabled={isStreaming}
                rows={1}
                className="flex-1 resize-none border-0 bg-transparent text-sm min-h-[36px] max-h-[200px] focus-visible:ring-0 shadow-none"
                data-testid="input-analytics-prompt"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isStreaming || !input.trim()}
                className="flex-shrink-0 rounded-lg"
                data-testid="button-send-analytics"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI analytics may produce inaccurate results. Verify critical data before making decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
