import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 justify-center items-center">
      <div className="text-center">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-3 text-xl md:text-2xl font-bold animate-countdown transform scale-0.8">
          {String(timeLeft.days).padStart(2, "0")}
        </div>
        <p className="text-sm text-white/80 mt-2">Dias</p>
      </div>
      <div className="text-center">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-3 text-xl md:text-2xl font-bold animate-countdown transform scale-0.8">
          {String(timeLeft.hours).padStart(2, "0")}
        </div>
        <p className="text-sm text-white/80 mt-2">Horas</p>
      </div>
      <div className="text-center">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-3 text-xl md:text-2xl font-bold animate-countdown transform scale-0.8">
          {String(timeLeft.minutes).padStart(2, "0")}
        </div>
        <p className="text-sm text-white/80 mt-2">Min</p>
      </div>
      <div className="text-center">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-3 text-xl md:text-2xl font-bold animate-countdown transform scale-0.8">
          {String(timeLeft.seconds).padStart(2, "0")}
        </div>
        <p className="text-sm text-white/80 mt-2">Seg</p>
      </div>
    </div>
  );
};