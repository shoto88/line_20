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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClosedDays } from "./hooks/useClosedDays";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  opened: boolean;
  onClose: () => void;
  onAdd: () => void;
};

const AddClosedDayModal: React.FC<Props> = ({ opened, onClose, onAdd }) => {
  const [date, setDate] = useState<Date | null>(null);
  const [type, setType] = useState<"holiday" | "custom">("custom");
  const [name, setName] = useState("");
  const { toast } = useToast();

  const { addMutation } = useClosedDays();

  const handleSubmit = () => {
    if (!date) {
      toast({
        title: "エラー",
        description: "日付を選択してください",
        variant: "destructive",
      });
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
          toast({
            title: "休診日追加",
            description: "休診日を追加しました",
            variant: "success",
          });
        },
        onError: (error: any) => {
          toast({
            title: "エラー",
            description:
              error.response?.data?.error || "休診日の追加に失敗しました。",
            variant: "destructive",
          });
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
                <SelectGroup>
                  <SelectItem value="holiday">祝日</SelectItem>
                  <SelectItem value="custom">その他休診日</SelectItem>
                </SelectGroup>
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
