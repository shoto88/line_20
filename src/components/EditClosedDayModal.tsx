import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import React, { useState } from "react";
import toast from "react-hot-toast";

type Props = {
  closedDay: {
    id: number;
    date: string;
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

  const handleDelete = () => {
    onDelete(closedDay.id);
    onClose();
    toast.success("休診日を削除しました。");
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
            disabled
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={handleDelete}
          className="bg-red-500 text-white"
        >
          削除
        </Button>
        <Button variant="outline" onClick={onClose}>
          キャンセル
        </Button>
      </DialogFooter>
    </>
  );
};

export default EditClosedDayModal;
