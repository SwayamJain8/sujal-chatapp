import { Loader2, Paperclip, Send, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Input } from "./ui/input";

interface MessageInputProps {
  selectedUser: string | null;
  message: string;
  setMessage: (message: string) => void;
  handleMessageSend: (
    e: React.FormEvent<HTMLFormElement>,
    imageFile?: File | null
  ) => void;
}

const MessageInput = ({
  selectedUser,
  message,
  setMessage,
  handleMessageSend,
}: MessageInputProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;
    setIsUploading(true);
    await handleMessageSend(e, imageFile);
    setImageFile(null);
    setIsUploading(false);
  };

  if (!selectedUser) return null;

  return (
    <div className="bg-card border-t border-border p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        {imageFile && (
          <div className="relative inline-block">
            <Image
              src={URL.createObjectURL(imageFile)}
              alt="preview"
              width={200}
              height={200}
              className="rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setImageFile(null)}
              className="absolute -top-2 -right-2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <Paperclip className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.type.startsWith("image/")) {
                  setImageFile(file);
                }
              }}
            />
          </label>
          <Input
            type="text"
            placeholder={imageFile ? "Add a caption..." : "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={(!imageFile && !message.trim()) || isUploading}
            className="px-4"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
