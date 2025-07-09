export function formatMessageTime(date: string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
}

export function formatLastSeen(lastSeen: string) {
  const date = new Date(lastSeen);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // в минутах

  if (diff < 1) return "just now";
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;

  return date.toLocaleDateString(); // например "7/8/2025"
}
