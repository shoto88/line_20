"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PatientQueueManagement from "./test";

import { useState } from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
type Ticket = {
  ticket_number: number;
  name: string;
  time: Date;
  examination_number: number | null;
  line_user_id: string;
};

const columnHelper = createColumnHelper<Ticket>();
const columns = [
  columnHelper.accessor("ticket_number", {
    header: "発券番号",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("name", {
    header: "ライン名",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("time", {
    header: "発券時刻",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("examination_number", {
    header: "診察券番号",
    cell: (info) => {
      const queryClient = useQueryClient();
      const ticket = info.row.original;
      const [inputValue, setInputValue] = useState<string>(
        ticket.examination_number?.toString() ?? ""
      );

      const { mutate, isPending } = useMutation<
        void,
        Error,
        { examinationNumber: number }
      >({
        mutationFn: async ({ examinationNumber }) => {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/follow/${ticket.line_user_id}/examination-number`,
            { examinationNumber },
            {
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_AUTH_KEY}`,
              },
            }
          );
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["d1"] });
        },
        onError: (error) => {
          console.error("Error updating examination number:", error);
        },
      });
      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
      };

      const handleSaveClick = () => {
        const value = parseInt(inputValue, 10);
        if (!isNaN(value)) {
          mutate({ examinationNumber: value });
        }
      };

      return (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            className="w-16"
          />
          <Button
            onClick={handleSaveClick}
            disabled={isPending}
            className="w-10 bg-blue-300 h-6 text-white"
          >
            {isPending ? "保存中..." : "登録"}
          </Button>
        </div>
      );
    },
    footer: (info) => info.column.id,
  }),
];

const UserInfo = () => {
  const { data, status, error } = useQuery<Ticket[]>({
    queryKey: ["d1"],
    queryFn: async () => {
      const response = await axios.get<Ticket[]>(
        `${import.meta.env.VITE_API_URL}/api/lineinfo`
      );
      console.log("Fetched data:", response.data);
      return response.data;
    },
    refetchInterval: 2000,
  });
  if (error) {
    <div>エラーが発生しました</div>;
  }

  const lineIssuedNumbers = data
    ? data.map((ticket) => ticket.ticket_number)
    : [];
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PatientQueueManagement lineIssuedNumbers={lineIssuedNumbers} />

      <div className="mx-auto max-w-full px-0">
        {status === "pending" ? (
          <p>Loading...</p>
        ) : (
          <div className="w-full">
            <div className="flex flex-col items-center justify-center py-0">
              <div className="rounded-md border">
                <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                  <div className="text-md font-bold">
                    lineで発券済みの方の一覧
                  </div>
                  <div className="text-md font-bold">{today}</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x-[3px]">
                  {Array.from(
                    { length: Math.ceil(table.getRowModel().rows.length / 15) },
                    (_, i) => (
                      <div key={i}>
                        <Table className="w-full text-sm">
                          <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                              <TableRow className="h-6" key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                  <TableHead key={header.id}>
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                  </TableHead>
                                ))}
                              </TableRow>
                            ))}
                          </TableHeader>
                          <TableBody>
                            {table
                              .getRowModel()
                              .rows.slice(i * 15, (i + 1) * 15)
                              .map((row) => (
                                <TableRow className="h-6" key={row.id}>
                                  {row.getVisibleCells().map((cell) => (
                                    <TableCell className="p-3" key={cell.id}>
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Link to="/ticket-summary">
        <Button
          variant="outline"
          className="ml-10 mt-20 text-blue-700 border-teal-700 hover:bg-teal-700 hover:text-white text-sm"
        >
          summary
        </Button>
      </Link>
      {/* <Link to="/display">
            <Button variant="outline" className="ml-10 mt-20 text-blue-700 border-teal-700 hover:bg-teal-700 hover:text-white text-sm">
              display
            </Button>
          </Link> */}
    </>
  );
};

export default UserInfo;

// const handleSave = async () => {
//     // KVにデータを保存
//     await fetch('http://localhost:8787/api/kv', {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   };

//   interface Data {
//     waiting: number; // Adjust the type based on the actual data expected
//   }
