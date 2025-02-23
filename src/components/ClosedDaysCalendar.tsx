import { useState, useCallback } from "react";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useClosedDays } from "./hooks/useClosedDays";
import AddClosedDayModal from "./AddClosedDayModal";
import EditClosedDayModal from "./EditClosedDayModal";
import { ja } from "date-fns/locale";

dayjs.locale("ja");

const ClosedDaysCalendar = () => {
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
      />

      <ShadCalendar
        locale={ja}
        mode="single"
        selected={selectedDate as Date}
        onSelect={(day: Date | undefined) => setSelectedDate(day || null)}
        initialFocus
        className="p-0"
        classNames={{
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          day_disabled: "text-muted-foreground opacity-50",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
        }}
        modifiers={{
          disabled: () => false,
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
