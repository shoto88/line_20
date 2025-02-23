import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useClosedDays } from "./hooks/useClosedDays";

type Props = {
  closedDay: {
    id: number;
    date: string;
    type: "holiday" | "custom";
    name?: string;
  };
  onClose: () => void;
  onDelete: (id: number) => void;
};

const EditClosedDayModal: React.FC<Props> = ({
  closedDay,
  onClose,
  onDelete,
}) => {
  const [date, setDate] = useState<Date | null>(dayjs(closedDay.date).toDate());
  const [type, setType] = useState<"holiday" | "custom">(closedDay.type);
  const [name, setName] = useState<string>(closedDay.name || "");

  const { updateMutation } = useClosedDays();

  const handleSubmit = () => {
    if (!date) {
      toast.error("日付を入力してください");
      return;
    }
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    updateMutation.mutate(
      {
        id: closedDay.id,
        updatedClosedDay: { date: formattedDate, type, name },
      },
      {
        onSuccess: () => {
          onClose();
          toast.success("休診日を更新しました。");
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.error || "休診日の更新に失敗しました。"
          );
        },
      }
    );
  };

  return (
    <>
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
              <SelectValue placeholder="Select a fruit" />
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
        <Button
          variant="outline"
          onClick={() => onDelete(closedDay.id)}
          className="bg-red-500 text-white"
        >
          削除
        </Button>
        <Button variant="outline" onClick={onClose}>
          キャンセル
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          更新
        </Button>
      </DialogFooter>
    </>
  );
};

export default EditClosedDayModal;
