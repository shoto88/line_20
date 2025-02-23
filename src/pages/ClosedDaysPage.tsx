import ClosedDaysCalendar from "@/components/ClosedDaysCalendar";
import SundayClinicDates from "@/components/SundayClinicDates";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ClosedDaysPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              休診日カレンダー
            </h1>
            <p className="mt-2 text-gray-600">
              休診日と祝日の管理ができます。日付をクリックして編集や、新規追加が可能です。
            </p>
          </div>
          <Link to="/frontdesk">
            <Button
              variant="outline"
              className="text-blue-700 border-blue-700 hover:bg-blue-700 hover:text-white"
            >
              受付画面に戻る
            </Button>
          </Link>
        </div>
        <SundayClinicDates />
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ClosedDaysCalendar />
        </div>
      </div>
    </div>
  );
};

export default ClosedDaysPage;
