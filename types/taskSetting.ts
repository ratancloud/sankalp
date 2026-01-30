import { WeekDay } from "@/generated/prisma/enums";

export interface TaskSetting {
  id: string;
  userId: string;
  
  title: string;
  description: string | null;
  isPrivate: boolean;

  startDate: Date | string; 
  endDate: Date | string;

  time: Date | string;
  duration: number | null; 
  
  createdAt: Date | string;
  updatedAt: Date | string;
  
  repeatOn: WeekDay[];
}