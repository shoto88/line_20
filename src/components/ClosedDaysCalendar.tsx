import React, { useState, useCallback } from "react";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useClosedDays } from "./hooks/useClosedDays";
import AddClosedDayModal from "./AddClosedDayModal";
import EditClosedDayModal from "./EditClosedDayModal";

dayjs.locale("ja");

const ClosedDaysCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedClosedDay, setSelectedClosedDay] = useState<any | null>(null);

  const { closedDays, isLoading, error, refetch, deleteMutation } =
    useClosedDays();

  const handleDayClick = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      const clickedDate = dayjs(date).format("YYYY-MM-DD");
      const closedDay = closedDays?.find((day) => day.date === clickedDate);

      if (closedDay) {
        setSelectedClosedDay(closedDay);
        setEditModalOpen(true);
      }
    },
    [closedDays]
  );

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedClosedDay(null);
    refetch();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        Error: {error instanceof Error ? error.message : "An error occurred"}
      </div>
    );
  if (!closedDays) return <div>No data</div>;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setAddModalOpen(true)}>休診日追加</Button>
      </div>

      <Dialog open={editModalOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>休診日編集</DialogTitle>
          </DialogHeader>
          {selectedClosedDay && (
            <EditClosedDayModal
              closedDay={selectedClosedDay}
              onClose={handleCloseEditModal}
              onUpdate={() => {
                refetch();
              }}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AddClosedDayModal
        opened={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          refetch();
        }}
        onAdd={() => {
          refetch();
        }}
      />

      <ShadCalendar
        locale="ja"
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        onMonthChange={setCurrentMonth}
        initialFocus
        classNames={{
          cell: (date) => {
            const formattedDate = dayjs(date).format("YYYY-MM-DD");
            const closedDay = closedDays.find(
              (day) => day.date === formattedDate
            );
            if (closedDay) {
              return cn(
                "relative rounded-md p-2 text-center text-sm focus-within:relative focus-within:z-20",
                closedDay.type === "holiday"
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600"
              );
            }
            return "hover:bg-accent hover:text-accent-foreground rounded-md";
          },
        }}
        modifiers={{
          disabled: (date) => {
            return false;
          },
        }}
        components={{
          Day: ({ date, ...props }) => {
            const day = date.getDate();
            return (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => handleDayClick(date)}
                    className={cn(
                      "group relative flex h-9 w-9 cursor-pointer items-center justify-center p-0 text-sm",
                      "aria-selected:bg-primary aria-selected:text-primary-foreground",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    {...props}
                  >
                    {day}
                  </Button>
                </PopoverTrigger>
                {closedDays.find(
                  (day) => day.date === format(date, "yyyy-MM-dd")
                ) && (
                  <PopoverContent
                    align="center"
                    className="w-auto p-2"
                    side="top"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {closedDays.find(
                          (day) => day.date === format(date, "yyyy-MM-dd")
                        )?.type === "holiday"
                          ? "祝日"
                          : "休診日"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {closedDays.find(
                          (day) => day.date === format(date, "yyyy-MM-dd")
                        )?.name || ""}
                      </p>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            );
          },
        }}
      />
    </>
  );
};

export default ClosedDaysCalendar;
