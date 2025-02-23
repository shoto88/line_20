import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

type ClosedDay = {
  id: number;
  date: string;
  type: 'holiday' | 'custom';
  name?: string;
};

export const useClosedDays = () => {
  const queryClient = useQueryClient();

  const fetchClosedDays = async () => {
    const response = await axios.get<ClosedDay[]>(`${import.meta.env.VITE_API_URL}/api/closed-days`);
    return response.data;
  };

  const { data: closedDays, isLoading, error, refetch } = useQuery({
    queryKey: ['closedDays'],
    queryFn: fetchClosedDays,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/closed-days/${id}`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AUTH_KEY}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closedDays'] });
    },
    onError:(error) => {
      console.error(error)
    }
  });

  const addMutation = useMutation(
    async (newClosedDay: { date: string; type: 'holiday' | 'custom'; name?: string }) => {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/closed-days`, newClosedDay, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_AUTH_KEY}`,
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['closedDays'] });
      },
      onError:(error) => {
        console.error(error)
      }
    }
  );

  const updateMutation = useMutation(
    async (updatedData: { id: number; updatedClosedDay: { date: string; type: 'holiday' | 'custom'; name?: string } }) => {
      const { id, updatedClosedDay } = updatedData;
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/closed-days/${id}`, updatedClosedDay, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_AUTH_KEY}`,
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['closedDays'] });
      },
      onError:(error) => {
        console.error(error)
      }
    }
  );

  return { closedDays, isLoading, error, refetch, deleteMutation, addMutation, updateMutation };
}; 