import TasksPageClient from "@/components/createTask/CreateTaskClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule",
};

export default async function TasksPage() {


  return <TasksPageClient />;
}