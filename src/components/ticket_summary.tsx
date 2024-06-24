// import React from 'react';
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
//   } from "@/components/ui/table";
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import axios from 'axios';
// import { format } from 'date-fns';
// import { Button } from './ui/button';
// import { Link } from 'react-router-dom';

// const TicketSummary: React.FC = () => {
//   const today = format(new Date(), 'yyyy年MM月dd日');
//   const queryClient = useQueryClient();

//   const { data: summaryData, status } = useQuery<{ line_user_id: string, line_display_name: string, ticket_time: string, ticket_date: string }[], unknown>({
//     queryKey: ['ticketSummary'],
//     queryFn: async () => {
//       const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ticket-summary`);
//       return response.data;
//     },
//   });

//   const summarizeMutation = useMutation<{ message: string }, unknown, void>({
//     mutationFn: async () => {
//       const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ticket-summary`);
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['ticketSummary'] });
//     },
//   });

//   return (
//     <>
//       <div className="mx-auto max-w-full px-0">
//         {status === 'pending' ? (
//           <p>Loading...</p>
//         ) : (
//           <div className="w-full">
//             {summarizeMutation.isSuccess && (
//               <div className="fixed top-0 left-0 right-0 p-4 bg-green-500 text-white text-center">
//                 集計が完了しました
//               </div>
//             )}
//             <div className="fixed top-4 left-4"> {/* ボタンの位置を左上に固定 */}
//             <Button variant="outline"
//               className="bg-teal-200 hover:text-gray-800 focus:text-gray-800 focus:outline-none"
//             >
//               <Link to="/" className="text-2xl">
//                 管理画面
//               </Link>
//               </Button>
//             </div>
//             <div className="flex flex-col items-center justify-center py-0">
//               <div className="rounded-md border">
//                 <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
//                   <div className="text-md font-bold">利用者一覧</div>
//                   <div className="text-md font-bold">{today}</div>
//                 </div>
//                 <Table className="w-full text-sm">
//                   <TableHeader>
//                     <TableRow className="h-6">
//                       <TableHead>表示名</TableHead>
//                       <TableHead>発券時間</TableHead>
//                       <TableHead>発券日</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {summaryData?.map((row,index) => (
//                       <TableRow className="h-4" key={index}>
//                         <TableCell className="p-1">{row.line_display_name}</TableCell>
//                         <TableCell className="p-1">{row.ticket_time}</TableCell>
//                         <TableCell className="p-1">{row.ticket_date}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default TicketSummary;

'use client'

import React, { useMemo } from 'react';
import { format, parseISO, startOfWeek, addDays, subWeeks, isWithinInterval, getHours, eachWeekOfInterval, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TicketSummary: React.FC = () => {
  // const today = format(new Date(), 'yyyy年MM月dd日');
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

  const processedData = useMemo(() => {
    if (!summaryData) return null;
    const currentDate = new Date();
    const twelveWeeksAgo = subWeeks(currentDate, 11);

    // 12週間分の週の開始日を生成
    const weekStarts = eachWeekOfInterval(
      { start: twelveWeeksAgo, end: currentDate },
      { weekStartsOn: 1 }
    );

    const weeklyData = weekStarts.map((weekStart:any) => ({
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      count: 0
    }));

    const dailyData: { date: string; count: number }[] = [];
    const hourlyData = Array(10).fill(0); // 10時から19時までの10時間分
    const todayHourlyData = Array(10).fill(0); // 当日の10時から19時までの10時間分
    let monthlyTotal = 0;

    for (let i = 0; i < 7; i++) {
      const date = addDays(subWeeks(currentDate, 1), i);
      dailyData.push({ date: format(date, 'M/d'), count: 0 });
    }

    summaryData.forEach(ticket => {
      const ticketDate = parseISO(ticket.ticket_date);
      const ticketTime = parseISO(ticket.ticket_time);

      // Weekly data (直近12週間)
      if (ticketDate >= twelveWeeksAgo) {
        const weekStart = startOfWeek(ticketDate, { weekStartsOn: 1 });
        const weekIndex = weeklyData.findIndex(w => w.weekStart === format(weekStart, 'yyyy-MM-dd'));
        if (weekIndex !== -1) {
          weeklyData[weekIndex].count++;
        }
      }

      // Daily data (last 7 days)
      if (isWithinInterval(ticketDate, { start: subWeeks(currentDate, 1), end: currentDate })) {
        const dayIndex = dailyData.findIndex(d => d.date === format(ticketDate, 'M/d'));
        if (dayIndex !== -1) {
          dailyData[dayIndex].count++;
        }
      }

      const hour = getHours(ticketTime);
      if (hour >= 10 && hour < 20) {
        hourlyData[hour - 10]++;
        
        // Today's hourly data
        if (isToday(ticketDate)) {
          todayHourlyData[hour - 10]++;
        }
      }

      // Monthly total
      monthlyTotal++;
    });

    return { weeklyData, dailyData, hourlyData, todayHourlyData, monthlyTotal };
  }, [summaryData]);

  if (status === 'pending') return <div>Loading...</div>;
  if (!processedData) return <div>No data available</div>;

  return (
    <div className="p-6 md:p-10 space-y-10">
      {summarizeMutation.isSuccess && (
        <div className="fixed top-0 left-0 right-0 p-4 bg-green-500 text-white text-center">
          集計が完了しました
        </div>
      )}
      <div className="fixed top-6 left-6 md:top-10 md:left-10"> 
        <Button variant="outline" className="bg-teal-200 hover:text-gray-800 focus:text-gray-800 focus:outline-none">
          <Link to="/" className="text-2xl">
            管理画面
          </Link>
        </Button>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
      <Card className="mt-16"> 
        <CardHeader className="pb-2">
        <CardTitle className="text-xl mb-2">本日の時間帯別利用者数 (集計済みの人)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData.todayHourlyData.map((count, index) => ({ hour: index + 10, count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(hour) => `${hour}時`}
                domain={[10, 19]}
                type="number"
                ticks={[10, 11, 12, 13, 14, 15, 16, 17, 18, 19]}
              />
              <YAxis />
              <Tooltip labelFormatter={(label) => `${label}時`} />
              <Legend />
              <Bar dataKey="count" fill="#ff7300" name="利用者数" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-xl mb-2">週別利用者数（直近12週間）</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            {format(subWeeks(new Date(), 11), 'yyyy年MM月dd日', { locale: ja })} から 
            {format(new Date(), 'yyyy年MM月dd日', { locale: ja })} まで
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="weekStart" 
                tickFormatter={(tick) => format(parseISO(tick), 'M/d', { locale: ja })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `週開始: ${format(parseISO(label), 'yyyy/MM/dd', { locale: ja })}`}
              />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="利用者数" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-xl mb-2">直近1週間の日別利用者数</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="利用者数" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-xl mb-2">累計時間帯別利用者数（全データ）</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData.hourlyData.map((count, index) => ({ hour: index + 10, count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(hour) => `${hour}時`}
                domain={[10, 19]}
                type="number"
                ticks={[10, 11, 12, 13, 14, 15, 16, 17, 18, 19]}
              />
              <YAxis />
              <Tooltip labelFormatter={(label) => `${label}時`} />
              <Legend />
              <Bar dataKey="count" fill="#ffc658" name="利用者数" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </div>


      <Card>
      <CardHeader className="pb-2">
      <CardTitle className="text-xl mb-2">月間総利用者数</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-center py-4">{processedData.monthlyTotal}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketSummary;