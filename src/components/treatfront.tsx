import { useQueryClient,useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Header from './Headercomponents/Header';
import { useSharedTreatData } from './useSharedTreatData';



const TreatFront = () => {

  const queryClient = useQueryClient()
  const { data, status, error } = useSharedTreatData();

    const waitingMutation = useMutation<void, unknown, string>({
      mutationFn: async (action) => await axios.put(`${import.meta.env.VITE_API_URL}/api/treat/waiting/${action}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['treatData'] })
      },
    });


// treatment の値を更新する useMutation
// const treatmentMutation = useMutation<void, unknown, string>({
//   mutationFn: async (action) => {
//     await axios.put(`${import.meta.env.VITE_API_URL}/api/treat/treatment/${action}`);
//   },
//   onSuccess: () => {
//     queryClient.invalidateQueries({ queryKey: ['treatData'] });
//   },
// });

// 


    if (error) {
      return <div>エラーが発生しました: {error.message}</div>; // エラー処理
    }
  
    return (
        <>
          <Header />
          <div className="flex justify-center gap-44 p-4 pt-16">
            {status === 'pending' ? (
              <p>Loading...</p>
            ) : (
              Object.entries(data).map(([key, value]) => (
                <div
                  key={key}
                  className={`flex flex-col items-center justify-center gap-4 rounded-lg p-8 shadow-md ${
                    key === 'waiting' ? 'bg-red-100' : 'bg-blue-100'
                  }`}
                >
                  <span className="text-xl font-bold">
                    {key === 'waiting' ? '発券済み番号' : '診療済み人数'}
                  </span>
                  <div className="flex items-center justify-center">
                    {key === 'waiting' ? (
                      <>
                        <button
                          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-3xl font-bold text-gray-800 transition-colors hover:bg-gray-300 mt-4"
                          onClick={() => waitingMutation.mutate('decrement')}
                        >
                          -
                        </button>
                        <span className="flex items-center justify-center text-6xl mx-4 font-bold w-24 text-center">
                          {String(value)}
                        </span>
                        <button
                          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-3xl font-bold text-gray-800 transition-colors hover:bg-gray-300 mt-4"
                          onClick={() => waitingMutation.mutate('increment')}
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <span className="flex items-center justify-center text-6xl mx-4 font-bold w-24 text-center">
                        {String(value)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      );
    };
  
  export default TreatFront;