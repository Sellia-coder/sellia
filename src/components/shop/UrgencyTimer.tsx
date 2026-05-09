"use client";

import { useState, useEffect } from "react";
import { Flame } from "lucide-react";

interface Props {
  promoEndsAt: string | Date | null;
}

export default function UrgencyTimer({ promoEndsAt }: Props) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!promoEndsAt) {
      setTimeLeft(null);
      return;
    }

    const endDate = new Date(promoEndsAt);
    if (isNaN(endDate.getTime())) {
      setTimeLeft(null);
      return;
    }

    const compute = () => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ hours, minutes, seconds, total: diff });
    };

    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [promoEndsAt]);

  if (!timeLeft) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="shop-urgency-timer">
      <div className="shop-urgency-timer-icon">
        <Flame size={16} strokeWidth={2} />
      </div>
      <div className="shop-urgency-timer-content">
        <div className="shop-urgency-timer-label">Offre flash · Termine dans</div>
        <div className="shop-urgency-timer-counter">
          {timeLeft.hours > 99 ? (
            <span>{Math.floor(timeLeft.hours / 24)} jours</span>
          ) : (
            <>
              <span className="shop-urgency-timer-block">
                {pad(timeLeft.hours)}
                <span className="shop-urgency-timer-block-unit">h</span>
              </span>
              <span className="shop-urgency-timer-sep">:</span>
              <span className="shop-urgency-timer-block">
                {pad(timeLeft.minutes)}
                <span className="shop-urgency-timer-block-unit">m</span>
              </span>
              <span className="shop-urgency-timer-sep">:</span>
              <span className="shop-urgency-timer-block">
                {pad(timeLeft.seconds)}
                <span className="shop-urgency-timer-block-unit">s</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
