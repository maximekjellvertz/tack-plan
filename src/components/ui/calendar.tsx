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
      className={cn("p-6 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-8 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-3 relative items-center mb-6 z-10 w-full",
        caption_label: "hidden",
        caption_dropdowns: "flex gap-4 items-center justify-center z-20",
        dropdown_month: "px-6 py-3 text-base font-bold border-2 rounded-2xl hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all bg-gradient-to-br from-card to-card/80 shadow-xl cursor-pointer relative z-30 min-w-[140px] backdrop-blur-sm",
        dropdown_year: "px-6 py-3 text-base font-bold border-2 rounded-2xl hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all bg-gradient-to-br from-card to-card/80 shadow-xl cursor-pointer relative z-30 min-w-[120px] backdrop-blur-sm",
        dropdown: "w-full h-full opacity-100 cursor-pointer appearance-none bg-transparent text-center font-bold pointer-events-auto",
        nav: "space-x-2 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-11 w-11 bg-gradient-to-br from-card to-card/80 p-0 border-2 hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-xl font-bold rounded-xl backdrop-blur-sm",
        ),
        nav_button_previous: "absolute left-3 top-4",
        nav_button_next: "absolute right-3 top-4",
        table: "w-full border-collapse space-y-2 mt-4",
        head_row: "flex mb-3",
        head_cell: "text-muted-foreground rounded-xl w-12 h-12 font-bold text-sm uppercase tracking-wider flex items-center justify-center",
        row: "flex w-full mt-2 gap-1",
        cell: "h-12 w-12 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-xl [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }), 
          "h-12 w-12 p-0 font-bold text-base aria-selected:opacity-100 hover:scale-110 transition-all duration-200 rounded-xl hover:bg-primary/20 hover:shadow-lg hover:border hover:border-primary/30"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary hover:to-primary/90 hover:text-primary-foreground focus:from-primary focus:to-primary/80 focus:text-primary-foreground shadow-xl scale-105 ring-2 ring-primary/50 border-2 border-primary/30",
        day_today: "bg-gradient-to-br from-accent to-accent/70 text-accent-foreground font-extrabold ring-2 ring-accent/40 shadow-lg border-2 border-accent/30",
        day_outside:
          "day-outside text-muted-foreground/30 opacity-40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground/20 opacity-20 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
