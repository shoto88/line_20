

import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import { useSharedTreatData } from "../useSharedTreatData";
import { useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import axios from "axios";
import { useState } from "react";


const Header: React.FC = () => {
  const [showSummaryComplete, setShowSummaryComplete] = useState(false); // 集計完了ダイアログの表示状態

  const { data, status } = useSharedTreatData();
  const queryClient = useQueryClient(); 
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
  const summarizeMutation = useMutation<{ message: string }, unknown, void>({
    mutationFn: async () => {
      const response = await axios.post('https://backend.shotoharu.workers.dev/api/ticket-summary');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticketSummary"] });
      setShowSummaryComplete(true); // 集計完了ダイアログを表示
      setTimeout(() => {
        setShowSummaryComplete(false); // 1秒後に非表示
      }, 1000);
    },
  });

  const handleSummarize = () => {
    summarizeMutation.mutate();
  };
  
  const { data: systemStatusData } = useQuery<{ value: number }, unknown>({
    queryKey:['systemStatus'],
    queryFn:async () => {
      const response = await axios.get('https://backend.shotoharu.workers.dev/api/status');
      // console.log(response.data)
      return response.data;
    },
    // refetchInterval: 1000, // ここに移動
  });

  const systemStatusMutation = useMutation<{ value: number }, unknown, void>({
    mutationFn: async () => {
      const response = await axios.put('https://backend.shotoharu.workers.dev/api/status');
      return response.data.value;
    },
    onSuccess: (newStatus) => {
      queryClient.setQueryData(['systemStatus'], newStatus);
      queryClient.invalidateQueries({ queryKey: ['systemStatus'] });
      console.log(newStatus)
    },
  });

  const systemStatus = systemStatusData?.value ?? 0;



  const toggleSystemStatus = () => {
    systemStatusMutation.mutate();
  };
  
  return (
    <>
      {/**ヘッダー */}
      <div className="fixed flex justify-between px-8 w-screen h-12 bg-teal-200 items-center drop-shadow-sm border-b border-gray-300 shadow-sm">
        <h1 className="font-bold text-2xl">大濠パーククリニック🏥</h1>
        <Button onClick={toggleSystemStatus} className={systemStatus === 0 ? "bg-red-500 text-white text-md hover:bg-red-700" : "bg-blue-500 text-white font-bold hover:bg-blue-700"}> 
          {systemStatus === 0 ? 'ライン予約可能🙆' : 'ライン予約停止中🙅‍♀️'}
        </Button>
        <h1 className="font-bold text-2xl">現在の待ち人数は{String(diff) + '人です'}{emoji}</h1>
        <div className="flex gap-3">
         <Button onClick={handleSummarize} className='bg-yellow-200 text-gray-800 hover:bg-yellow-300'>集計</Button>
         {showSummaryComplete && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-700 p-4 rounded-md shadow-md">
            集計が完了しました。
          </div>
        )}
          <Button>
            <Link to="/patient" className="text-2xl">
              モニター画面
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Header;
