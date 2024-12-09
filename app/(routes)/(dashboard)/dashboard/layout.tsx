import { AIChatInterface } from "@/app/components/ai-assistant/chat-interface";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {children}
      <AIChatInterface />
    </div>
  );
} 