import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const TicketSummary: React.FC = () => {
  const today = format(new Date(), 'yyyy年MM月dd日');
  const queryClient = useQueryClient();

  const { data: summaryData, status } = useQuery<{ line_user_id: string, line_display_name: string, ticket_time: string, ticket_date: string }[], unknown>({
    queryKey: ['ticketSummary'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ticket-summary`);
      return response.data;
    },
  });

  const summarizeMutation = useMutation<{ message: string }, unknown, void>({
    mutationFn: async () => {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ticket-summary`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticketSummary'] });
    },
  });

  return (
    <>
      <div className="mx-auto max-w-full px-0">
        {status === 'pending' ? (
          <p>Loading...</p>
        ) : (
          <div className="w-full">
            {summarizeMutation.isSuccess && (
              <div className="fixed top-0 left-0 right-0 p-4 bg-green-500 text-white text-center">
                集計が完了しました
              </div>
            )}
            <div className="fixed top-4 left-4"> {/* ボタンの位置を左上に固定 */}
            <Button variant="outline"
              className="bg-teal-200 hover:text-gray-800 focus:text-gray-800 focus:outline-none"
            >
              <Link to="/" className="text-2xl">
                管理画面
              </Link>
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center py-0">
              <div className="rounded-md border">
                <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                  <div className="text-md font-bold">利用者一覧</div>
                  <div className="text-md font-bold">{today}</div>
                </div>
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="h-6">
                      <TableHead>表示名</TableHead>
                      <TableHead>発券時間</TableHead>
                      <TableHead>発券日</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summaryData?.map((row,index) => (
                      <TableRow className="h-4" key={index}>
                        <TableCell className="p-1">{row.line_display_name}</TableCell>
                        <TableCell className="p-1">{row.ticket_time}</TableCell>
                        <TableCell className="p-1">{row.ticket_date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TicketSummary;