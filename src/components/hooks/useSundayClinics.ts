import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useSundayClinics = () => {
  const queryClient = useQueryClient();

  const { data: sundayClinics, isLoading, error, refetch } = useQuery({
    queryKey: ["sundayClinics"],
    queryFn: async () => {
      const { data } = await axios.get("/api/sunday-clinics");
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post("/api/sunday-clinics/update");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sundayClinics"] });
    },
  });

  return {
    sundayClinics,
    isLoading,
    error,
    refetch,
    updateMutation,
  };
};