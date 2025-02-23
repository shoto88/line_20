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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [type, setType] = useState<"holiday" | "custom">("custom");
  const [name, setName] = useState("");

  const { addMutation } = useClosedDays();

  const handleSubmit = () => {
    if (!date) {
      toast.error("日付を選択してください");
      return;
    }
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    addMutation.mutate(
      { date: formattedDate, type, name },
      {
        onSuccess: () => {
          onClose();
          setDate(null);
          setType("custom");
          setName("");
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              種別
            </Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as "holiday" | "custom")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="holiday">祝日</SelectItem>
                <SelectItem value="custom">その他休診日</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              休診日名
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
