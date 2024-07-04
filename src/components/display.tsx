'use client'

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

interface QueueData {
  treatData: {
    waiting: number;
    treatment: number;
  };
  queueStatus: Array<{
    number: number;
    status: number;
  }>;
}

const fetchQueueData = async () => {
  const [treatData, queueStatus] = await Promise.all([
    axios.get(`${import.meta.env.VITE_API_URL}/api/treat`),
    axios.get(`${import.meta.env.VITE_API_URL}/api/queue-status`)
  ]);
  return {
    treatData: treatData.data,
    queueStatus: queueStatus.data
  };
};

const WaitingRoomDisplay = () => {
  const { data, status } = useQuery<QueueData, Error>({
    queryKey: ['queueData'],
    queryFn: fetchQueueData,
    refetchInterval: 2000
  });

  let waitingCount = 0;
  let emoji = '😐';

  if (status === 'success' && data) {
    waitingCount = data.queueStatus.filter(item => item.status === 0).length;

    if (waitingCount <= 5) {
      emoji = '😊';
    } else if (waitingCount <= 10) {
      emoji = '😥';
    } else if (waitingCount <= 15) {
      emoji = '😱';
    } else {
      emoji = '😭';
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダー */}
      <div className="fixed flex justify-center px-8 w-screen h-32 bg-teal-200 items-center drop-shadow-sm border-b border-gray-300 shadow-sm">
        {status === 'pending' ? (
          <h1 className="font-bold text-2xl">読み込み中...</h1>
        ) : (
          <h1 className="font-bold text-6xl">
            現在の待ち人数は{waitingCount}人です{emoji}
          </h1>
        )}
      </div>
      <div className="fixed top-4 left-4"> {/* ボタンの位置を左上に固定 */}
        <Button variant="outline"
          className="text-transparent bg-teal-200 hover:text-gray-800 focus:text-gray-800 focus:outline-none"
        >
          <Link to="/" className="text-2xl">
            管理画面
          </Link>
        </Button>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-44 p-8 md:p-16 flex-grow mt-32">
        {status === 'pending' ? (
          <p>読み込み中...</p>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg p-8 md:p-12 shadow-md bg-red-100 w-full md:w-auto flex-grow">
              <span className="text-center font-bold text-3xl md:text-4xl">
                現在の待ち組数
              </span>
              <span className="mt-8 text-[min(10vw,180px)] font-bold">{waitingCount}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg p-8 md:p-12 shadow-md bg-blue-100 w-full md:w-auto flex-grow">
              <span className="text-center font-bold text-3xl md:text-4xl">
                待ち番号一覧
              </span>
              <div className="mt-8 w-full max-h-[50vh] overflow-y-auto">
                <div className="grid grid-cols-5 gap-4">
                  {data?.queueStatus.filter(item => item.status === 0).map(item => (
                    <div key={item.number} className="p-3 bg-yellow-100 rounded-lg text-center text-4xl font-bold shadow">
                      {item.number}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="text-center text-4xl font-bold mb-8">
      お待たせしてしまい申し訳ございません🙇‍♂️
      </div>
    </div>
  );
};

export default WaitingRoomDisplay;