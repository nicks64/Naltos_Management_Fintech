import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Sparkles,
  Send,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Copy,
  Check,
  Zap,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  FileText,
  Activity,
  Target,
  ChevronRight,
  MessageSquare,
  Loader2,
} from "lucide-react";

interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  actions?: AgentAction[];
}

interface AgentAction {
  label: string;
  path?: string;
  type: "navigate" | "execute" | "info";
}

interface SuggestedPrompt {
  icon: typeof Brain;
  label: string;
  prompt: string;
  category: string;
}

interface AgentCommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
  role?: string;
  endpoint?: string;
  portalMode?: "business" | "vendor" | "merchant";
  suggestedPrompts?: SuggestedPrompt[];
}

const defaultBusinessPrompts: SuggestedPrompt[] = [
  { icon: AlertTriangle, label: "Delinquency risks today", prompt: "What are the current delinquency risks across my portfolio? Identify tenants flagged by the neural model and suggest interventions.", category: "Risk" },
  { icon: DollarSign, label: "Cash flow forecast", prompt: "Give me a 30-day cash flow forecast including rent inflows, vendor payouts, and treasury yield projections.", category: "Finance" },
  { icon: Users, label: "Tenant health summary", prompt: "Summarize tenant payment behavior across all properties. Who improved? Who is declining? What collection nudges should I send?", category: "Collections" },
  { icon: TrendingUp, label: "NOI optimization", prompt: "Analyze my current NOI and suggest 3 specific actions I can take this week to improve it.", category: "Operations" },
  { icon: Target, label: "Renewal predictions", prompt: "Which leases are expiring in the next 90 days? What are the renewal probabilities and what terms should I offer?", category: "Leases" },
  { icon: Zap, label: "Vendor payment optimization", prompt: "Review vendor payment schedules and identify float optimization opportunities. Which payments can earn more yield?", category: "Vendors" },
];

const defaultVendorPrompts: SuggestedPrompt[] = [
  { icon: FileText, label: "Invoice status", prompt: "What's the status of my pending invoices? When can I expect the next payments?", category: "Payments" },
  { icon: Activity, label: "Performance score", prompt: "How is my performance score calculated? What can I do to improve it?", category: "Performance" },
  { icon: AlertTriangle, label: "Document compliance", prompt: "Are any of my compliance documents expiring soon? What do I need to upload?", category: "Compliance" },
  { icon: DollarSign, label: "Yield earnings", prompt: "How much yield have I earned on my float balances? How can I maximize my returns?", category: "Finance" },
];

const defaultMerchantPrompts: SuggestedPrompt[] = [
  { icon: TrendingUp, label: "Sales trends", prompt: "What are my sales trends this month compared to last month? Which products are performing best?", category: "Sales" },
  { icon: Users, label: "Customer insights", prompt: "Who are my top customers? What are the peak hours and what should I promote during off-peak times?", category: "Customers" },
  { icon: Zap, label: "Promotion ROI", prompt: "Which of my promotions have the highest ROI? Should I adjust or create new promotions?", category: "Promotions" },
  { icon: DollarSign, label: "Settlement forecast", prompt: "When is my next settlement? How much yield am I earning on pending settlements?", category: "Finance" },
];

export function AgentCommandCenter({
  isOpen,
  onClose,
  context = "",
  role = "Admin",
  endpoint = "/api/agent",
  portalMode = "business",
  suggestedPrompts,
}: AgentCommandCenterProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const prompts = suggestedPrompts || (
    portalMode === "vendor" ? defaultVendorPrompts :
    portalMode === "merchant" ? defaultMerchantPrompts :
    defaultBusinessPrompts
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (promptText?: string) => {
    const text = promptText || input.trim();
    if (!text || isStreaming) return;

    const userMsg: AgentMessage = { role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const assistantMsg: AgentMessage = { role: "assistant", content: "", timestamp: new Date() };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const contextPrefix = context ? `[Context: ${context}] ` : "";
      const rolePrefix = `[User Role: ${role}] `;
      const fullPrompt = `${rolePrefix}${contextPrefix}${text}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) throw new Error("Agent request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullContent };
            return updated;
          });
        }
      }
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "I encountered an issue processing your request. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
  };

  if (!isOpen) return null;

  const agentName = portalMode === "vendor" ? "Vendor Agent" : portalMode === "merchant" ? "Merchant Agent" : "Naltos Agent";
  const agentDesc = portalMode === "vendor" ? "Your AI assistant for vendor operations" : portalMode === "merchant" ? "Your AI assistant for merchant analytics" : "AI-native financial intelligence";

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-background border-l z-50 flex flex-col transition-all duration-300 ${isExpanded ? "w-[600px]" : "w-[420px]"}`}
      data-testid="agent-command-center"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate">{agentName}</h3>
            <p className="text-xs text-muted-foreground truncate">{agentDesc}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge variant="outline" className="text-[10px]">
            <Sparkles className="w-3 h-3 mr-1" />
            GPT-5
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-agent-expand"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-agent-close">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{agentName}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {portalMode === "vendor" ? "Ask about your invoices, performance, compliance, or financial insights." :
                 portalMode === "merchant" ? "Ask about sales analytics, promotions, customer insights, or settlements." :
                 "Ask about your portfolio, tenants, vendors, financials, or get AI-driven recommendations."}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Suggested</p>
              {prompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.prompt)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border text-left hover-elevate transition-colors"
                  data-testid={`button-agent-prompt-${idx}`}
                >
                  <prompt.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{prompt.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{prompt.category}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg px-4 py-3`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-3 h-3" />
                      <span className="text-xs font-medium">{agentName}</span>
                      {isStreaming && idx === messages.length - 1 && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {msg.role === "assistant" && msg.content && (
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/30">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(msg.content, idx)}
                        data-testid={`button-copy-msg-${idx}`}
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t p-3 space-y-2">
        {messages.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs"
              data-testid="button-agent-reset"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              New chat
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Ask ${agentName}...`}
            disabled={isStreaming}
            className="flex-1"
            data-testid="input-agent-prompt"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            data-testid="button-agent-send"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          AI responses are generated and may not always be accurate.
        </p>
      </div>
    </div>
  );
}

interface AgentTriggerButtonProps {
  onClick: () => void;
  isOpen: boolean;
  unreadInsights?: number;
  portalMode?: "business" | "vendor" | "merchant";
}

export function AgentTriggerButton({ onClick, isOpen, unreadInsights = 0, portalMode = "business" }: AgentTriggerButtonProps) {
  const label = portalMode === "vendor" ? "Ask Agent" : portalMode === "merchant" ? "Ask Agent" : "AI Agent";

  return (
    <Button
      variant={isOpen ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="relative gap-2"
      data-testid="button-agent-trigger"
    >
      <Brain className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      {unreadInsights > 0 && !isOpen && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
          {unreadInsights}
        </span>
      )}
    </Button>
  );
}
