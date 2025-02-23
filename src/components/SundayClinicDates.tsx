import { Button } from "@/components/ui/button";
import {
  useSundayClinics,
  SundayClinic,
} from "@/components/hooks/useSundayClinics";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

const SundayClinicDates = () => {
  const { sundayClinics, isLoading, error, updateMutation } =
    useSundayClinics();

  const handleUpdate = () => {
    updateMutation.mutate();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading sunday clinic dates</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">日曜診療日</h2>
        <Button
          onClick={handleUpdate}
          disabled={updateMutation.isPending}
          variant="outline"
        >
          {updateMutation.isPending ? "更新中..." : "次回の日程を更新"}
        </Button>
      </div>
      <div className="space-y-2">
        {sundayClinics?.map((clinic: SundayClinic) => (
          <div
            key={clinic.date}
            className="flex items-center p-2 bg-blue-50 rounded"
          >
            <span className="text-blue-700">
              {format(new Date(clinic.date), "M月d日(E)", { locale: ja })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SundayClinicDates;
