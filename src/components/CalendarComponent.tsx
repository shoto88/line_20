import React, { useState } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import {toZonedTime, format } from 'date-fns-tz';

const timeZone = 'Asia/Tokyo';


const CalendarComponent: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); 

  const { data: closedDates, status } = useQuery<{ date: string }[], unknown>({
    queryKey: ['closedDates'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/closed-dates`);
      return response.data;
    },
    refetchInterval: 2000, 
  });

  const addClosedDateMutation = useMutation<void, AxiosError, string>({
    mutationFn: async (date) => {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/closed-dates`, { date });
    },
    onSuccess: () => {
      console.log('Closed date added successfully');
      console.log(closedDates);
      queryClient.invalidateQueries({ queryKey: ['closedDates'] });
    },
    onError: (error, date) => {
      console.error('Failed to add closed date:', error);
      const responseData = error.response?.data as { error?: string };
      if (responseData.error === 'Closed date already exists') {
        removeClosedDateMutation.mutate(date);
      }
    },
  });
  const removeClosedDateMutation = useMutation<void, unknown, string>({
    mutationFn: async (date) => {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/closed-dates/${date}`);
    },
    onSuccess: () => {
        console.log('Closed date removed successfully');
        queryClient.invalidateQueries({ queryKey: ['closedDates'] });
      },
      onError: (error) => {
        console.error('Failed to remove closed date:', error);
      },
    }
  );
  const handleDateClick = (date: Date) => {
    const japanTime = toZonedTime(date, timeZone);
    setSelectedDate(japanTime);

    // Format date to 'YYYY-MM-DD'
    const formattedDate = format(japanTime, 'yyyy-MM-dd', { timeZone });

    const isClosedDate = closedDates?.some(closedDate => closedDate.date === formattedDate);
    console.log(formattedDate);

    if (isClosedDate) {
      removeClosedDateMutation.mutate(formattedDate);
    } else {
      addClosedDateMutation.mutate(formattedDate);
    }
  };
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const japanTime = toZonedTime(date, timeZone);
      const formattedDate = format(japanTime, 'yyyy-MM-dd', { timeZone });
      const isClosedDate = closedDates?.some(closedDate => closedDate.date === formattedDate);
      // Added base style class 'bg-white text-black' and conditionally add 'bg-red-500 text-white' for closed dates
      return isClosedDate ? 'bg-red-500 text-white' : 'bg-white text-black';
    }
    return '';
  };

  const tileDisabled = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      // Here we disable only the selected holidays or non-working days as per your needs
      return date.getDay() === 0 || date.getDay() === 6; // Disable weekends
    }
    return false;
  };



  return (
    <div className="calendar-container">
      {status === 'pending' ? (
        <p>読み込み中...</p>
      ) : (
        <Calendar
        locale='ja-JP'
        value={selectedDate}
        onClickDay={handleDateClick}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        
        />
      )}
    </div>
  );
};


export default CalendarComponent;