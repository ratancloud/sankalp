"use client";

import React, { useCallback, useState } from "react";
import { useForm, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, startOfDay } from "date-fns";
import { CalendarIcon, Clock, Loader2, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { WeekDay } from "@/generated/prisma/enums";

const DAY_MAP = {
  Monday: WeekDay.Monday,
  Tuesday: WeekDay.Tuesday,
  Wednesday: WeekDay.Wednesday,
  Thursday: WeekDay.Thursday,
  Friday: WeekDay.Friday,
  Saturday: WeekDay.Saturday,
  Sunday: WeekDay.Sunday,
};

const DAYS_ORDER: Record<WeekDay, number> = {
  [WeekDay.Monday]: 0,
  [WeekDay.Tuesday]: 1,
  [WeekDay.Wednesday]: 2,
  [WeekDay.Thursday]: 3,
  [WeekDay.Friday]: 4,
  [WeekDay.Saturday]: 5,
  [WeekDay.Sunday]: 6,
};

const UI_DAYS = Object.keys(DAY_MAP) as (keyof typeof DAY_MAP)[];

const formSchema = z
  .object({
    title: z.string().min(2).max(50),
    description: z.string().max(200).optional(),
    isPrivate: z.boolean().default(false),
    startDate: z.date(),
    endDate: z.date(),
    scheduledAt: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    duration: z.coerce.number().min(5).max(36000),
    repeatOn: z.array(z.enum(WeekDay)).min(1, "Select at least one day"),
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "End date cannot be before start date",
        path: ["endDate"],
      });
    }
  });

type FormValues = z.input<typeof formSchema>;

export interface TaskSetting {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPrivate: boolean;
  repeatOn: WeekDay[];
  scheduledAt: string;
  duration: number | null;
  startDate: Date | string;
  endDate: Date | string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskFormProps {
  initialData?: TaskSetting;
  onSuccess?: () => void;
}

export default function TaskForm({ initialData, onSuccess }: TaskFormProps) {
  const [isPending, setIsPending] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      isPrivate: initialData?.isPrivate ?? false,
      startDate: initialData?.startDate
        ? new Date(initialData.startDate)
        : new Date(),
      endDate: initialData?.endDate ? new Date(initialData.endDate) : undefined,
      scheduledAt: initialData?.scheduledAt || "09:00",
      duration: initialData?.duration || 30,
      repeatOn: (initialData?.repeatOn as WeekDay[]) || [
        WeekDay.Monday,
        WeekDay.Tuesday,
        WeekDay.Wednesday,
        WeekDay.Thursday,
        WeekDay.Friday,
      ],
    } as DefaultValues<FormValues>,
  });

  const selectedDays = form.watch("repeatOn");

  const toggleDay = useCallback(
    (uiDay: keyof typeof DAY_MAP) => {
      const enumDay = DAY_MAP[uiDay];
      const currentDays = form.getValues("repeatOn");

      const newDays = currentDays.includes(enumDay)
        ? currentDays.filter((d) => d !== enumDay)
        : [...currentDays, enumDay];

      newDays.sort((a, b) => DAYS_ORDER[a] - DAYS_ORDER[b]);

      form.setValue("repeatOn", newDays, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    try {
      const payload = {
        ...data,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const url =
        isEditMode && initialData?.id
          ? `/api/taskSetting/${initialData.id}`
          : "/api/taskSetting";

      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save task");
      }

      if (!isEditMode) {
        form.reset();
      }

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Morning Workout" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (Max 200 chars)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Details..."
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="h-px bg-border" />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const start = form.getValues("startDate");
                        return date < (start || startOfDay(new Date()));
                      }}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Time and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="time" className="pl-10" {...field} />
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(parseInt(val))}
                  defaultValue={String(field.value)}
                  key={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="900">15 Minutes</SelectItem>
                    <SelectItem value="1800">30 Minutes</SelectItem>
                    <SelectItem value="2700">45 Minutes</SelectItem>
                    <SelectItem value="3600">1 Hour</SelectItem>
                    <SelectItem value="5400">1.5 Hours</SelectItem>
                    <SelectItem value="7200">2 Hours</SelectItem>
                    <SelectItem value="10800">3 Hours</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Repeat Days */}
        <FormField
          control={form.control}
          name="repeatOn"
          render={() => (
            <FormItem>
              <FormLabel>Repeat On</FormLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto min-h-12 whitespace-normal"
                  >
                    <div className="flex flex-wrap gap-1 items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {selectedDays.length === 0 ? (
                        <span className="text-muted-foreground">
                          Select Days
                        </span>
                      ) : selectedDays.length === 7 ? (
                        <Badge variant="secondary">Every Day</Badge>
                      ) : (
                        selectedDays.map((enumDay) => (
                          <Badge
                            key={enumDay}
                            variant="secondary"
                            className="px-1.5"
                          >
                            {enumDay.slice(0, 3)}
                          </Badge>
                        ))
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  {UI_DAYS.map((dayLabel) => (
                    <DropdownMenuCheckboxItem
                      key={dayLabel}
                      checked={selectedDays.includes(DAY_MAP[dayLabel])}
                      onCheckedChange={() => toggleDay(dayLabel)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {dayLabel}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="h-px bg-border" />

        {/* Privacy Switch */}
        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-secondary/10">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2 text-base">
                  {field.value ? (
                    <Lock className="size-4 text-orange-500" />
                  ) : (
                    <Globe className="size-4 text-indigo-500" />
                  )}
                  {field.value ? "Private Task" : "Public Task"}
                </FormLabel>
                <FormDescription>
                  {field.value
                    ? "Only you can see this task."
                    : "This task is visible to your friends."}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? "Updating..." : "Scheduling..."}
            </>
          ) : isEditMode ? (
            "Update Schedule"
          ) : (
            "Create Schedule"
          )}
        </Button>
      </form>
    </Form>
  );
}
