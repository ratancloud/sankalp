import type { Metadata } from "next";
import TaskClient from "./TaskClient";

export const metadata: Metadata = {
  title: "Task",
};

export default function TaskPage() {
  return <TaskClient />;
}