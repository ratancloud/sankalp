import { CheckCircle2, LayoutList, ListTodo } from "lucide-react";

export default function EmptyState({ type }: { type: string }) {
  const data = {
    today: { icon: CheckCircle2, text: "All caught up! Enjoy your day." },
    upcoming: { icon: LayoutList, text: "Your schedule is clear." },
    previous: { icon: ListTodo, text: "No past tasks found." },
  }[type] || { icon: ListTodo, text: "No tasks found" };

  const Icon = data.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <div className="mb-4 rounded-full bg-muted/50 p-4 ring-1 ring-border/50">
        <Icon className="h-8 w-8 opacity-50" />
      </div>
      <p className="font-medium">{data.text}</p>
    </div>
  );
}
