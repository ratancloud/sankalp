import { TaskStatus } from "@/generated/prisma/enums";

export interface VirtualTask {
  id: string;
  taskSettingId: string;
  
  title: string;
  description?: string | null;
  isPrivate: boolean;

  date: Date;
  scheduledAt: string;
  duration: number;
  actualDuration: number

  status: TaskStatus;
  isVirtual: boolean;
}

export type Task = {
  id: string;
  userId?: string;
  taskSettingId?: string;

  title: string;
  description?: string | null;
  isPrivate: boolean;

  status: TaskStatus;

  date: string;
  scheduledAt: string;
  duration: number;
  actualDuration: number
  
  createdAt?: Date
  updatedAt?: Date
};

