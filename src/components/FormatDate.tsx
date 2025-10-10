import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from "date-fns";

interface FormatDateProps {
  date: string | Date;
  variant?: "short" | "full";
}

const FormatDate = ({ date, variant = "short" }: FormatDateProps) => {
  const d = new Date(date);

  function formatShortTimeAgo(date: string | Date) {
    const now = new Date();
    const diffDate = new Date(date);

    const minutes = differenceInMinutes(now, diffDate);
    const hours = differenceInHours(now, diffDate);
    const days = differenceInDays(now, diffDate);
    const weeks = differenceInWeeks(now, diffDate);
    const months = differenceInMonths(now, diffDate);
    const years = differenceInYears(now, diffDate);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    if (weeks < 4) return `${weeks}w`;
    if (months < 12) return `${months}mo`;
    return `${years}y`;
  }

  if (variant === "short") {
    return <span>{formatShortTimeAgo(d)}</span>;
  }

  return (
    <span>
      {d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}
    </span>
  );
};

export default FormatDate;
