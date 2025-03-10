"use client";

import React, { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckSquare, Square } from "lucide-react";

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

interface PatientQueueManagementProps {
  lineIssuedNumbers: number[];
}

const fetchQueueData = async () => {
  const [treatData, queueStatus] = await Promise.all([
    axios.get(`${import.meta.env.VITE_API_URL}/api/treat`),
    axios.get(`${import.meta.env.VITE_API_URL}/api/queue-status`),
  ]);
  return {
    treatData: treatData.data,
    queueStatus: queueStatus.data,
  };
};

const updateQueueStatus = async ({
  number,
  status,
}: {
  number: number;
  status: number;
}) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_URL}/api/queue-status/${number}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AUTH_KEY}`,
      },
    }
  );
  return response.data;
};

const PatientQueueManagement: React.FC<PatientQueueManagementProps> =
  React.memo(({ lineIssuedNumbers }) => {
    const [localTreatment, setLocalTreatment] = useState(0);
    const { data, isLoading, error } = useQuery<QueueData, Error>({
      queryKey: ["queueData"],
      queryFn: fetchQueueData,
      refetchInterval: 2000,
    });

    const queryClient = useQueryClient();

    const updateMutation = useMutation({
      mutationFn: updateQueueStatus,
      onMutate: async (newStatus) => {
        await queryClient.cancelQueries({ queryKey: ["queueData"] });
        const previousData = queryClient.getQueryData<QueueData>(["queueData"]);

        if (previousData) {
          const newData = {
            ...previousData,
            queueStatus: previousData.queueStatus.map((item) =>
              item.number === newStatus.number
                ? { ...item, status: newStatus.status }
                : item
            ),
          };
          queryClient.setQueryData(["queueData"], newData);
        }

        setLocalTreatment((prev) => prev + (newStatus.status === 1 ? 1 : -1));

        return { previousData };
      },
      onError: (_, newStatus, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(["queueData"], context.previousData);
        }
        setLocalTreatment((prev) => prev - (newStatus.status === 1 ? 1 : -1));
      },
      onSettled: (data) => {
        queryClient.invalidateQueries({ queryKey: ["queueData"] });
        if (data && data.checkedCount !== undefined) {
          setLocalTreatment(data.checkedCount);
        }
      },
    });

    const handleCheck = useCallback(
      (number: number, currentStatus: number) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        updateMutation.mutate({ number, status: newStatus });
      },
      [updateMutation]
    );

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>エラーが発生しました: {error.message}</div>;
    if (!data) return <div>データがありません</div>;

    const { treatData, queueStatus } = data;
    const waiting = treatData.waiting;

    return (
      <div className="p-2 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold mb-2">診療管理</h2>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white p-2 rounded-lg shadow col-span-3">
            <div className="flex mb-2 text-sm">
              <div>
                <span className="font-bold">発券済み人数: </span>
                <span className="text-lg text-blue-600">{waiting}</span>
              </div>
              <div>
                <span className="font-bold ml-4">診療済み: </span>
                <span className="text-lg text-green-600">{localTreatment}</span>
              </div>
            </div>
            <QueueStatusGrid
              queueStatus={queueStatus}
              lineIssuedNumbers={lineIssuedNumbers}
              onCheck={handleCheck}
            />
          </div>
          <RemainingNumbersDisplay
            numbers={queueStatus
              .filter((item) => item.status === 0)
              .map((item) => item.number)}
            lineIssuedNumbers={lineIssuedNumbers}
          />
        </div>
      </div>
    );
  });

const QueueStatusGrid: React.FC<{
  queueStatus: Array<{ number: number; status: number }>;
  lineIssuedNumbers: number[];
  onCheck: (number: number, status: number) => void;
}> = React.memo(({ queueStatus, lineIssuedNumbers, onCheck }) => (
  <div className="grid grid-cols-10 gap-1 max-h-96 overflow-y-auto">
    {queueStatus.map(({ number, status }) => (
      <QueueStatusButton
        key={number}
        number={number}
        status={status}
        isLineIssued={lineIssuedNumbers.includes(number)}
        onCheck={onCheck}
      />
    ))}
  </div>
));

const QueueStatusButton: React.FC<{
  number: number;
  status: number;
  isLineIssued: boolean;
  onCheck: (number: number, status: number) => void;
}> = React.memo(({ number, status, isLineIssued, onCheck }) => (
  <button
    onClick={() => onCheck(number, status)}
    className={`p-1 rounded text-xs ${
      status === 1
        ? "bg-green-200"
        : isLineIssued
          ? "bg-purple-300"
          : "bg-gray-200"
    }`}
  >
    {status === 1 ? (
      <CheckSquare className="w-3 h-3 mx-auto" />
    ) : (
      <Square className="w-3 h-3 mx-auto" />
    )}
    <span className="block mt-0.5">{number}</span>
  </button>
));

interface RemainingNumbersDisplayProps {
  numbers: number[];
  lineIssuedNumbers: number[];
}

const RemainingNumbersDisplay: React.FC<RemainingNumbersDisplayProps> =
  React.memo(({ numbers, lineIssuedNumbers }) => (
    <div className="bg-white p-2 rounded-lg shadow">
      <h3 className="text-md font-semibold mb-1">待ち番号</h3>
      <div className="grid grid-cols-4 gap-1 max-h-96 overflow-y-auto">
        {numbers.slice(0, 30).map((num) => (
          <div
            key={num}
            className={`p-1 rounded text-center text-base ${
              lineIssuedNumbers.includes(num)
                ? "bg-purple-300"
                : "bg-yellow-100"
            }`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  ));

export default PatientQueueManagement;
