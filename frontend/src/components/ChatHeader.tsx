import { Menu, UserCircle } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { User } from "@/context/AppContext";

interface ChatHeaderProps {
  user: User | null;
  setSidebarOpen: (open: boolean) => void;
  isTyping: boolean;
  onlineUsers: string[];
}

const ChatHeader = ({
  user,
  setSidebarOpen,
  isTyping,
  onlineUsers,
}: ChatHeaderProps) => {
  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        {/* Chat header */}
        <div className="flex items-center gap-4 flex-1">
          {user ? (
            <>
              <div className="relative">
                <div className="p-2 bg-primary/10 rounded-full">
                  <UserCircle className="h-8 w-8 text-primary" />
                </div>
                {onlineUsers.includes(user._id) && (
                  <>
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card animate-ping opacity-70"></span>
                  </>
                )}
              </div>
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-card-foreground">
                    {user.name}
                  </h2>
                </div>
                {onlineUsers.includes(user._id) ? (
                  <>
                    {isTyping ? (
                      <div className="flex items-center gap-1">
                        <span className="flex gap-0.5">
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                        </span>
                        <span className="text-sm text-muted-foreground">
                          typing...
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Online
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Offline</span>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 bg-muted rounded-full">
                <UserCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Select a conversation
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose a chat from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu toggle - right side */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
