
import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import { useSharedTreatData } from "../useSharedTreatData";

const Header: React.FC = () => {
  const { data, status } = useSharedTreatData();
  
  let emoji = '😐'; // デフォルトの絵文字
  let diff = 0;
  if (status === 'success' && data.waiting && data.treatment) { // data.waiting と data.treatment が存在する場合のみ
    const waitingValue = data.waiting;
    const treatmentValue = data.treatment;
    diff = Math.abs(waitingValue - treatmentValue);
    console.log(diff)

    if (diff <= 5) {
      emoji = '😊';
    } else if (diff <= 10) {
      emoji = '😥';
    } else if (diff <= 15) {
      emoji = '😱';
    }else{
      emoji = '😭';
    }
  }

  
  return (
  <>
 {/**ヘッダー */}
 <div className="fixed flex justify-between px-8 w-screen h-12 bg-teal-200 items-center drop-shadow-sm border-b border-gray-300 shadow-sm">
            <h1 className="font-bold text-2xl">大濠パーククリニック🏥</h1>
            <h1 className="font-bold text-2xl">現在の待ち人数は{String(diff) + '人です'}{emoji}</h1>
            <div className="flex gap-3">
                <Button variant="outline">
                <Link to="/" className="text-2xl font-bold">
              管理画面
            </Link>
                </Button>
                <Button>    <Link to="/patient" className="text-2xl">
              モニター画面
            </Link></Button>
            </div>
        </div>
  </>
  );
};

export default Header;