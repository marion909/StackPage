import { useState, useEffect } from "react";
import type { CountdownBlock } from "../../types/blocks";

interface Props {
  block: CountdownBlock;
  onChange: (props: Partial<CountdownBlock["props"]>) => void;
  isEditing: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

export default function CountdownBlock({ block }: Props) {
  const { targetDate, heading, expiredText, accentColor, textColor, backgroundColor, showDays, showHours, showMinutes, showSeconds, align, paddingTop, paddingBottom } = block.props;
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  const alignMap: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" };

  return (
    <div style={{ backgroundColor, color: textColor, paddingTop, paddingBottom }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: alignMap[align], gap: "16px", padding: "0 16px" }}>
        {heading && <h3 style={{ margin: 0, color: textColor, fontWeight: 700, textAlign: align }}>{heading}</h3>}
        {timeLeft.expired ? (
          <p style={{ color: textColor, opacity: 0.7, textAlign: align }}>{expiredText}</p>
        ) : (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: alignMap[align] }}>
            {showDays && <Unit value={timeLeft.days} label="Days" color={accentColor} textColor={textColor} />}
            {showHours && <Unit value={timeLeft.hours} label="Hours" color={accentColor} textColor={textColor} />}
            {showMinutes && <Unit value={timeLeft.minutes} label="Minutes" color={accentColor} textColor={textColor} />}
            {showSeconds && <Unit value={timeLeft.seconds} label="Seconds" color={accentColor} textColor={textColor} />}
          </div>
        )}
      </div>
    </div>
  );
}

function Unit({ value, label, color, textColor }: { value: number; label: string; color: string; textColor: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: "80px" }}>
      <div style={{ fontSize: "2.5rem", fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {String(value).padStart(2, "0")}
      </div>
      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: textColor, opacity: 0.6, marginTop: "4px" }}>{label}</div>
    </div>
  );
}
