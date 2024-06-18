import React, { useState, useEffect } from "react";

const MessageComponent: React.FC = () => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const hour = now.getHours();
      const minute = now.getMinutes();

      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const targetTimes = isWeekday
        ? [
            { hour: 10, minute: 20 },
            { hour: 11, minute: 40 },
            { hour: 16, minute: 47 },
            { hour: 18, minute: 30 },
          ]
        : [{ hour: 10, minute: 20 }, { hour: 14, minute: 40 }];

      const shouldShowMessage = targetTimes.some(
        (time) => time.hour === hour && time.minute === minute
      );

      if (shouldShowMessage) {
        setShowMessage(true);
      }
    };

    checkTime();
    const intervalId = setInterval(checkTime, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleConfirm = () => {
    setShowMessage(false);
  };

  return showMessage ? (
    <div
    className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-red-700 p-4 rounded-md shadow-md z-50 ${
      showMessage ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
  >
      <p>
        {`${new Date().getHours()}時${new Date().getMinutes()}分です！ 切り替えは済んでいますか？`}
      </p>
      <button
        onClick={handleConfirm}
        className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
      >
        OK
      </button>
    </div>
  ) : null;
};

export default MessageComponent;
