import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClosedDays } from "./hooks/useClosedDays";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import toast from "react-hot-toast";

type Props = {
  opened: boolean;
  onClose: () => void;
};

const AddClosedDayModal: React.FC<Props> = ({ opened, onClose }) => {
  const [date, setDate] = useState<Date | null>(null);
  const { addMutation } = useClosedDays();

  const handleSubmit = () => {
    if (!date) {
      toast.error("日付を選択してください");
      return;
    }
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    addMutation.mutate(
      { date: formattedDate },
      {
        onSuccess: () => {
          onClose();
          setDate(null);
          toast.success("休診日を追加しました");
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.error || "休診日の追加に失敗しました。"
          );
        },
      }
    );
  };

  return (
    <Dialog open={opened} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>休診日追加</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              日付
            </Label>
            <Input
              id="date"
              type="date"
              value={date ? dayjs(date).format("YYYY-MM-DD") : ""}
              onChange={(e) => setDate(e.target.valueAsDate)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddClosedDayModal;
