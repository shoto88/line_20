
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface TreatData {
    waiting: number;
    treatment: number;
  }
  
export const useSharedTreatData = () => {
    return useQuery<TreatData, Error>({
      queryKey: ['treatData'],
      queryFn: async () => {
        const { data } = await axios.get<TreatData>(`${import.meta.env.VITE_API_URL}/api/treat`); // レスポンスの型を TreatData に変更
        return data; // レスポンスデータをそのまま返す
      },
      refetchInterval: 1000,
    });
  };