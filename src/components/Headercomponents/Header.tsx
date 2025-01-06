

import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import { useSharedTreatData } from "../useSharedTreatData";
import { useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import axios from "axios";
import { useState, useRef } from "react";


const Header: React.FC = () => {
  const [showSummaryComplete, setShowSummaryComplete] = useState(false); // 集計完了ダイアログの表示状態
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedTime, setEditedTime] = useState<number | null>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);

  const { data, status } = useSharedTreatData();
  const queryClient = useQueryClient(); 
  let emoji = '😐'; // デフォルトの絵文字
  let diff = 0;
if (status === 'success' && typeof data.waiting === 'number' && typeof data.treatment === 'number') {
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
  } else {
    emoji = '😭';
  }
}
  const summarizeMutation = useMutation<{ message: string }, unknown, void>({
    mutationFn: async () => {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ticket-summary`);
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
    queryKey: ['systemStatus'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/status`);
      return response.data;
    },
    refetchInterval: 2000,
  });

  const systemStatusMutation = useMutation<{ value: number }, unknown, void>({
    mutationFn: async () => {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/status`,
        null, // PUTの場合、送信データがなければ null または {} などを指定
        {
          headers: {
            // Bearer トークンの形で API Key を付与
            Authorization: `Bearer ${import.meta.env.AUTH_KEY}`,
          },
        },
      );
      console.log(import.meta.env.AUTH_KEY)
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Response data:", data);
      queryClient.invalidateQueries({ queryKey: ['systemStatus'] });
   
    },
    onError: (error) => {
      console.error('Error updating system status:', error);
    },
  });

  const systemStatus = systemStatusData?.value ?? 0;

  const toggleSystemStatus = () => {
    systemStatusMutation.mutate();
  };

  const resetMutation = useMutation<{ message: string }, unknown, void>({
    mutationFn: async () => {
      const counterResponse = await axios.put(`${import.meta.env.VITE_API_URL}/api/reset-counter`);
      const ticketsResponse = await axios.delete(`${import.meta.env.VITE_API_URL}/api/reset-tickets`);
      const queueStatusResponse = await axios.delete(`${import.meta.env.VITE_API_URL}/api/reset-queue-status`);
      return { 
        message: `Counter reset: ${counterResponse.data.message}, 
                  Tickets reset: ${ticketsResponse.data.message}, 
                  Queue status reset: ${queueStatusResponse.data.message}` 
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketSummary'] });
      queryClient.invalidateQueries({ queryKey: ['queueStatus'] });
    },
    onError: (error) => {
      console.error('Error resetting data:', error);
    },
  });

  const handleReset = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = () => {
    resetMutation.mutate();
    setShowResetConfirmation(false);
  };

  const cancelReset = () => {
    setShowResetConfirmation(false);
  };

  

  const { data: examinationTimeData, isLoading: isLoadingExaminationTime } = useQuery<{ minutes: number }, unknown>({
    queryKey: ['examinationTime'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/examination-time`);
      return response.data;
    },
  });

  const examinationTime = examinationTimeData?.minutes ?? 4;


  const updateExaminationTimeMutation = useMutation<{ minutes: number }, unknown, number>({
    mutationFn: async (newTime: number) => {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/examination-time`, { minutes: newTime });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examinationTime'] });
      setIsEditingTime(false);
      setEditedTime(null);
      setShowUpdateMessage(true);
      setTimeout(() => {
        setShowUpdateMessage(false);
      }, 3000); // 3秒後にメッセージを非表示
    },
  });


  const handleUpdateExaminationTime = () => {
    if (editedTime !== null && editedTime > 0) {
      updateExaminationTimeMutation.mutate(editedTime);
      if (timeInputRef.current) {
        timeInputRef.current.blur(); // フォーカスを外す
      }
    }
  };
  const handleTimeClick = () => {
    if (!isEditingTime) {
      setIsEditingTime(true);
      setEditedTime(examinationTime);
      setTimeout(() => timeInputRef.current?.focus(), 0);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (newTime > 0) {
      setEditedTime(newTime);
    }
  };
  const handleTimeBlur = () => {
    // 更新ボタンクリック時にも呼ばれるため、すぐには編集モードを解除しない
    setTimeout(() => {
      if (!showUpdateMessage) {
        setIsEditingTime(false);
        setEditedTime(null);
      }
    }, 200);
  };


  return (
    <>
      {/**ヘッダー */}
      <div className="fixed flex justify-between px-8 w-screen h-12 bg-teal-200 items-center drop-shadow-sm border-b border-gray-300 shadow-sm">
        <h1 className="font-bold text-2xl">大濠パーククリニック🏥</h1>
        <div className="flex items-center relative">
        <span className="mr-2 text-sm">平均診察時間:</span>
        {isEditingTime ? (
          <>
            <input
              ref={timeInputRef}
              type="number"
              value={editedTime ?? ''}
              onChange={handleTimeChange}
              onBlur={handleTimeBlur}
              className="w-12 px-1 py-0.5 text-sm border rounded mr-1 h-6"
            />
            <Button 
              onClick={handleUpdateExaminationTime} 
              className="px-2 py-0.5 text-xs bg-green-500 text-white hover:bg-green-700 h-6"
            >
              更新
            </Button>
          </>
        ) : (
          <span 
            className="font-bold text-sm mr-1 cursor-pointer hover:underline" 
            onClick={handleTimeClick}
          >
            {isLoadingExaminationTime ? '読み込み中...' : `${examinationTime}分`}
          </span>
        )}
        {showUpdateMessage && (
          <span className="absolute top-full left-0 text-xs text-green-600 bg-green-100 px-2 py-1 rounded mt-1">
            更新しました
          </span>
        )}
      </div>


        <Button onClick={toggleSystemStatus} className={systemStatus === 0 ? "bg-red-500 text-white text-xl hover:bg-red-700" : "bg-blue-500 text-xl font-bold hover:bg-blue-700"}> 
          {systemStatus === 0 ? 'ライン予約可能🙆' : 'ライン予約停止中🙅‍♀️'}
        </Button>
        <h1 className="font-bold text-2xl">現在の待ち人数は{String(diff) + '人です'}{emoji}</h1>
        <div className="flex gap-3">
        <Button onClick={handleReset} className="bg-red-500 text-white hover:bg-red-700">リセット</Button>
         <Button onClick={handleSummarize} className='bg-yellow-200 text-gray-800 hover:bg-yellow-300'>集計</Button>
         {showSummaryComplete && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-700 p-4 rounded-md shadow-md">
            集計が完了しました。
          </div>
        )}
          <Button>
            <Link to="/" className="text-2xl">
              ホーム画面
            </Link>
          </Button>
        </div>
    </div>
  {/* 削除確認ダイアログ */}
  {showResetConfirmation && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-8 rounded-md shadow-md relative">
      <h2 className="text-xl font-bold mb-4">データのリセット</h2>
      <p className="mb-4">リセット前に集計ボタンを押してください🔘</p>
      <p className="mb-4">本当にデータをリセットしますか？この操作は取り消せません。</p>
      <div className="flex justify-end">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            cancelReset();
          }} 
          className="bg-gray-500 text-white hover:bg-gray-700 mr-2"
        >
          キャンセル
        </Button>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            confirmReset();
          }} 
          className="bg-red-500 text-white hover:bg-red-700"
        >
          リセット
        </Button>
      </div>
    </div>
  </div>
)}
</>
  );
};

export default Header;
