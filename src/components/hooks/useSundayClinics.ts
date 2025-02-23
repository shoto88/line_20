import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export type SundayClinic = {
  id: number;
  date: string;
};

export const useSundayClinics = () => {
  const queryClient = useQueryClient();

  const fetchSundayClinics = async () => {
    const response = await axios.get<SundayClinic[]>(
      `${import.meta.env.VITE_API_URL}/api/sunday-clinics`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AUTH_KEY}`,
        },
      }
    );
    return response.data;
  };

  const { data: sundayClinics, isLoading, error, refetch } = useQuery({
    queryKey: ["sundayClinics"],
    queryFn: fetchSundayClinics,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/sunday-clinics/update`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_AUTH_KEY}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sundayClinics"] });
    },
    onError: (error) => {
      console.error(error);
    }
  });

  return {
    sundayClinics,
    isLoading,
    error,
    refetch,
    updateMutation,
  };
};