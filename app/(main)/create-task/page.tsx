import TasksPageClient from "@/components/createTask/CreateTaskClient";
import { auth } from "@/lib/auth"; 
import prisma  from "@/lib/prisma"; 
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function TasksPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  const tasks = await prisma.taskSetting.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      scheduledAt: "asc"
    },
  });

  return <TasksPageClient tasks={tasks} />;
}