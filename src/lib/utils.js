export function formatMessageTime(date) {
  if (!date) return "No time";

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "Invalid time";

  return parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}