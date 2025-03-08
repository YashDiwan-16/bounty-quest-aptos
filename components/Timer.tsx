"use client";
import React, { useEffect } from "react";

const Timer = ({ endtime }: { endtime: Date }) => {
  const [timeLeft, setTimeLeft] = React.useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  useEffect(() => {
    const timer = setInterval(() => {
      const endTime = new Date(endtime).getTime();
      const now = new Date().getTime();
      const timeLeft = endTime - now;
      setTimeLeft({
        hours: Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((timeLeft % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endtime]);

  return (
    <div>
      {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
    </div>
  );
};

export default Timer;
