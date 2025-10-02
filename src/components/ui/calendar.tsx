import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown-buttons"
      fromYear={1900}
      toYear={2050}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        caption: "flex justify-center pt-2 relative items-center mb-4 z-10 w-full",
        caption_label: "hidden",
        caption_dropdowns: "flex gap-3 items-center justify-center z-20",
        dropdown_month: "px-4 py-2 text-sm font-bold border-2 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all bg-card shadow-lg cursor-pointer relative z-30 min-w-[120px]",
        dropdown_year: "px-4 py-2 text-sm font-bold border-2 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all bg-card shadow-lg cursor-pointer relative z-30 min-w-[100px]",
        dropdown: "w-full h-full opacity-100 cursor-pointer appearance-none bg-transparent text-center font-bold pointer-events-auto",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-card p-0 border-2 hover:bg-primary hover:text-primary-foreground hover:scale-125 transition-all shadow-lg font-bold",
        ),
        nav_button_previous: "absolute left-2 top-3",
        nav_button_next: "absolute right-2 top-3",
        table: "w-full border-collapse space-y-1 mt-2",
        head_row: "flex mb-1",
        head_cell: "text-muted-foreground rounded-md w-9 font-bold text-xs uppercase tracking-wide",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }), 
          "h-9 w-9 p-0 font-semibold text-sm aria-selected:opacity-100 hover:scale-110 transition-all rounded-xl hover:bg-primary/20 hover:shadow-md"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg scale-105 ring-2 ring-primary/50",
        day_today: "bg-gradient-to-br from-accent to-accent/60 text-accent-foreground font-bold ring-2 ring-accent-foreground/20 shadow-md",
        day_outside:
          "day-outside text-muted-foreground/30 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-30",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
