import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const Patient = () => {
  const { data, status, error } = useQuery({
    queryKey: ['kv'],
    queryFn: async () => {
      const { data } = await axios.get('https://backend.shotoharu.workers.dev/api/treat');
      return data;
    },
  });

  if (error) {
    return <div>エラーが発生しました: {error.message}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Button variant="outline"
        className="self-start m-4 text-transparent hover:text-gray-800 focus:text-gray-800 focus:outline-none"
      >
        <Link to="/" className="text-2xl">
          Home
        </Link>
      </Button>
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
      <div className="text-center text-2xl font-bold mb-8">
        お待たせしてしまい申し訳ございません。
      </div>
    </div>
  );
};

export default Patient;