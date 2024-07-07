import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const Patient = () => {
  
  const { data, status } = useQuery({
    queryKey: ['kv'],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/treat`);
      return data;
    },
  });

  let diff = 0;
  let emoji = '😐';

  if (status === 'success' && data) {
    const waitingValue = data.waiting;
    const treatmentValue = data.treatment;
    diff = Math.abs(waitingValue - treatmentValue);

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

  return (
    <div className="flex flex-col min-h-screen">
          {/* ヘッダー */}
          <div className="fixed flex justify-center px-8 w-screen h-32 bg-teal-200 items-center drop-shadow-sm border-b border-gray-300 shadow-sm">

          {status === 'pending' ? (
            <h1 className="font-bold text-2xl">Loading...</h1> // ローディング中の表示
          ) : (
            <h1 className="font-bold text-6xl">
              現在の待ち人数は{String(diff)}人です{emoji}
            </h1>
          )}

        </div>
      <div className="fixed top-4 left-4"> {/* ボタンの位置を左上に固定 */}
        <Button variant="outline"
          className="text-transparent bg-teal-200 hover:text-gray-800 focus:text-gray-800 focus:outline-none"
        >
          <Link to="/" className="text-2xl">
            ホーム画面
          </Link>
        </Button>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-44 p-8 md:p-16 flex-grow">
        {status === 'pending' ? (
          <p>Loading...</p>
        ) : (
          Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className={`flex flex-col items-center justify-center gap-4 rounded-lg p-8 md:p-12 shadow-md ${
                key === 'waiting' ? 'bg-red-100' : 'bg-blue-100'
              } w-full md:w-auto flex-grow`}
            >
              <span className="text-center font-bold" style={{
                fontSize: 'calc(4.5vw + 1rem)',
                maxWidth: '100%',
                lineHeight: '1.2',
              }}>
                {key === 'waiting' ? '発券済番号' : '診療中番号'}
              </span>
              <span className="mt-14 text-[min(13vw,220px)] font-bold">{String(value)}</span>
            </div>
          ))
        )}
      </div>
      <div className="text-center text-6xl font-bold mb-8">
        お待たせしてしまい申し訳ございません🙇‍♂️
      </div>
    </div>
  );
};

export default Patient;