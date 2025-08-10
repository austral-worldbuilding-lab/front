import { cn } from "@/lib/utils";

interface MessageProps {
  message: string;
  isUser: boolean;
}

const Message = ({ message, isUser }: MessageProps) => {
  return (
    <div
      className={cn(
        "bg-[#6b7dc3] text-white p-3 rounded-md mb-2 max-w-[80%]",
        isUser ? "bg-primary" : "bg-gray-200 text-black"
      )}
    >
      {message}
    </div>
  );
};

export default Message;
