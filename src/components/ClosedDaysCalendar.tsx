import { useState, useCallback } from "react";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { ja } from "date-fns/locale";
import { toast } from "react-hot-toast";

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
      const clickedDate = dayjs(date).format("YYYY-MM-DD");
      const closedDay = closedDays?.find((day) => day.date === clickedDate);

      if (closedDay) {
        setSelectedClosedDay(closedDay);
        setEditModalOpen(true);
      } else {
        setSelectedDate(date);
        setAddModalOpen(true);
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
    <div className="flex flex-col items-center max-w-md mx-auto">
      <div className="w-full space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">休診日</span>
          </div>
          <p className="text-sm text-gray-600">
            日付をタップして休診日を設定/解除できます
          </p>
        </div>

        <div className="flex justify-center">
          <ShadCalendar
            locale={ja}
            mode="single"
            selected={selectedDate as Date}
            onSelect={(day: Date | undefined) => {
              if (day) {
                handleDayClick(day);
              }
            }}
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
                const isClosedDay = closedDays.some(
                  (closedDay) => closedDay.date === format(date, "yyyy-MM-dd")
                );

                return (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={() => handleDayClick(date)}
                        className={cn(
                          "group relative flex h-9 w-9 cursor-pointer items-center justify-center p-0 text-sm",
                          "hover:bg-gray-100",
                          isClosedDay
                            ? "bg-red-100 hover:bg-red-200 text-red-700"
                            : "hover:bg-gray-100"
                        )}
                        {...props}
                      >
                        {day}
                      </Button>
                    </PopoverTrigger>
                    {isClosedDay && (
                      <PopoverContent
                        align="center"
                        className="w-auto p-2"
                        side="top"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            休診日
                          </p>
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                );
              },
            }}
          />
        </div>
      </div>

      <Dialog open={editModalOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>休診日の削除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 text-center">
              {selectedClosedDay
                ? dayjs(selectedClosedDay.date).format("YYYY年M月D日")
                : ""}
              の休診日を削除しますか？
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditModal}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedClosedDay) {
                  deleteMutation.mutate(selectedClosedDay.id, {
                    onSuccess: () => {
                      handleCloseEditModal();
                      toast.success("休診日を削除しました");
                    },
                    onError: (error: any) => {
                      toast.error(
                        error.response?.data?.error ||
                          "休診日の削除に失敗しました。"
                      );
                    },
                  });
                }
              }}
            >
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddClosedDayModal
        opened={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          refetch();
        }}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default ClosedDaysCalendar;
