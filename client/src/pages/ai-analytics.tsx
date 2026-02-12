import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Brain,
  Send,
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  DollarSign,
  Activity,
  Target,
  AlertTriangle,
  Lightbulb,
  Clock,
  Trash2,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const analyticsCategories = [
  {
    id: "portfolio",
    title: "Portfolio Performance",
    icon: BarChart3,
    description: "Analyze property-level and portfolio-wide metrics",
    prompts: [
      "What is the on-time payment rate across all properties this quarter?",
      "Compare occupancy rates and revenue per unit across my portfolio",
      "Which properties are underperforming relative to market benchmarks?",
      "Show me a breakdown of NOI by property for the last 6 months",
    ],
  },
  {
    id: "collections",
    title: "Collections Intelligence",
    icon: Users,
    description: "Delinquency trends, risk scoring, and payment behavior",
    prompts: [
      "Rank tenants by delinquency risk and suggest intervention strategies",
      "What is the average days sales outstanding (DSO) trend over the past year?",
      "Identify tenants who have improved their payment behavior recently",
      "What percentage of late payments convert to collections each month?",
    ],
  },
  {
    id: "revenue",
    title: "Revenue & Cash Flow",
    icon: DollarSign,
    description: "Income optimization, float yield, and forecast modeling",
    prompts: [
      "Forecast next quarter's rent revenue based on current occupancy and lease terms",
      "How much yield has been generated from rent float this month?",
      "What is the total cash flow impact of our behavioral incentive programs?",
      "Analyze the relationship between incentive spend and on-time payment improvement",
    ],
  },
  {
    id: "behavioral",
    title: "Behavioral Analytics",
    icon: Brain,
    description: "Incentive ROI, tenant engagement, and behavior patterns",
    prompts: [
      "Which incentive programs have the highest ROI on on-time payment conversion?",
      "Segment tenants by payment behavior patterns and suggest targeted incentives",
      "What is the correlation between cashback rewards and tenant retention?",
      "Predict which tenants are at risk of lease non-renewal based on behavior data",
    ],
  },
  {
    id: "treasury",
    title: "Treasury & Yield",
    icon: TrendingUp,
    description: "Treasury deployment, yield optimization, and risk analysis",
    prompts: [
      "What is the current weighted average yield across all treasury products?",
      "Compare yield performance of NRF vs NRK vs NRC products this quarter",
      "Stress test the portfolio: what happens if 20% of tenants are 30+ days late?",
      "Optimize my treasury allocation to maximize yield while maintaining 135% OC ratio",
    ],
  },
  {
    id: "vendor",
    title: "Vendor & Expense",
    icon: PieChart,
    description: "Vendor payment patterns, expense analysis, and float optimization",
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const selectedCategory = analyticsCategories.find((c) => c.id === activeCategory)!;

  return (
    <div className="space-y-6" data-testid="page-ai-analytics">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">AI Analytics</h1>
        <p className="text-muted-foreground">
          Ask questions in plain language and get data-driven insights powered by NLP intelligence
        </p>
      </div>

      {messages.length === 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>NLP-Powered Portfolio Analytics</CardTitle>
                <CardDescription className="mt-1">
                  Ask any business question in natural language — get structured insights, forecasts, and recommendations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-2 p-3 bg-background rounded-lg border">
                <Target className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium">Predictive Scoring</p>
                  <p className="text-xs text-muted-foreground">Risk-rank tenants, forecast revenue, and identify delinquency before it happens</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-background rounded-lg border">
                <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium">Actionable Recommendations</p>
                  <p className="text-xs text-muted-foreground">Get specific strategies, not just data — optimize incentives, treasury, and collections</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-background rounded-lg border">
                <Activity className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium">Cross-Portfolio Analysis</p>
                  <p className="text-xs text-muted-foreground">Compare properties, benchmark performance, and spot trends across your entire portfolio</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Analytics Prompts</CardTitle>
              <CardDescription>
                Select a category and choose a prompt, or type your own question
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="grid grid-cols-3 h-auto" data-testid="tabs-analytics-categories">
                  {analyticsCategories.slice(0, 3).map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.id} className="text-xs px-2 py-1.5" data-testid={`tab-cat-${cat.id}`}>
                      <cat.icon className="w-3 h-3 mr-1" />
                      {cat.title.split(" ")[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsList className="grid grid-cols-3 h-auto mt-1" data-testid="tabs-analytics-categories-2">
                  {analyticsCategories.slice(3).map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.id} className="text-xs px-2 py-1.5" data-testid={`tab-cat-${cat.id}`}>
                      <cat.icon className="w-3 h-3 mr-1" />
                      {cat.title.split(" ")[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <selectedCategory.icon className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold">{selectedCategory.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{selectedCategory.description}</p>
                <div className="space-y-2">
                  {selectedCategory.prompts.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      className="w-full text-left justify-start h-auto py-3 px-3 hover-elevate whitespace-normal"
                      onClick={() => sendMessage(prompt)}
                      disabled={isStreaming}
                      data-testid={`button-prompt-${prompt.substring(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <Sparkles className="mr-2 h-3.5 w-3.5 flex-shrink-0 text-primary mt-0.5" />
                      <span className="text-xs break-words leading-relaxed">{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {messages.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{messages.filter((m) => m.role === "user").length} queries this session</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearConversation}
                    data-testid="button-clear-conversation"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[720px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <CardTitle>Analytics Console</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs" data-testid="badge-ai-model">
                  NLP Intelligence
                </Badge>
              </div>
              <CardDescription>
                Real-time AI analysis of your portfolio data — ask anything about performance, risk, revenue, or operations
              </CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Brain className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-lg font-medium mb-2">Ask a question</p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Select a prompt from the categories on the left, or type your own analytics question below
                  </p>
                  <div className="flex gap-2 mt-4 flex-wrap justify-center">
                    {["Portfolio", "Collections", "Revenue", "Treasury"].map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${message.role}-${idx}`}
                    >
                      <div className={`max-w-[90%] ${message.role === "user" ? "" : ""}`}>
                        {message.role === "assistant" && (
                          <div className="flex items-center gap-2 mb-1.5">
                            <Brain className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-medium text-primary">AI Analytics</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => copyMessage(idx, message.content)}
                              data-testid={`button-copy-${idx}`}
                            >
                              {copiedIdx === idx ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted border"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isStreaming && (
                    <div className="flex justify-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Brain className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">Analyzing...</span>
                        </div>
                        <div className="bg-muted border rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
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
                  placeholder="Ask an analytics question about your portfolio..."
                  disabled={isStreaming}
                  className="flex-1"
                  data-testid="input-analytics-prompt"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isStreaming || !input.trim()}
                  data-testid="button-send-analytics"
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
