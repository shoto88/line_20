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
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">日曜診療日</h2>
        <Button
          onClick={handleUpdate}
          disabled={updateMutation.isPending}
          variant="outline"
          className="min-w-[140px]"
        >
          {updateMutation.isPending ? "更新中..." : "次回の日程を更新"}
        </Button>
      </div>
      <div className="space-y-3">
        {sundayClinics?.map((clinic: SundayClinic) => (
          <div
            key={clinic.date}
            className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <span className="text-blue-700 font-medium">
              {format(new Date(clinic.date), "M月d日(E)", { locale: ja })}
            </span>
          </div>
        ))}
        {(!sundayClinics || sundayClinics.length === 0) && (
          <div className="text-center text-gray-500 py-4">
            日曜診療日が設定されていません
          </div>
        )}
      </div>
    </div>
  );
};

export default SundayClinicDates;
