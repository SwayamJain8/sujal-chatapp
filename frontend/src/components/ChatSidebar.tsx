import { Chats, User } from "@/context/AppContext";
import {
  CornerDownRight,
  CornerUpLeft,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  UserCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ChatSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showAllUsers: boolean;
  setShowAllUsers: (show: boolean | ((prev: boolean) => boolean)) => void;
  users: { users: User[] } | null;
  loggedInUser: User | null;
  chats: Chats[] | null;
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  handleLogout: () => void;
  createChat: (user: User) => void;
  onlineUsers: string[];
}

const ChatSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  showAllUsers,
  setShowAllUsers,
  users,
  loggedInUser,
  chats,
  selectedUser,
  setSelectedUser,
  handleLogout,
  createChat,
  onlineUsers,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <aside className="w-80 h-screen bg-card border-r border-border flex flex-col transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground">
              {showAllUsers ? "New Chat" : "Messages"}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllUsers((prev) => !prev)}
            className="p-2 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {showAllUsers ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showAllUsers ? (
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search Users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Users List */}
            <div className="space-y-2">
              {users?.users
                ?.filter((u) => {
                  return (
                    u._id !== loggedInUser?._id &&
                    u.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                })
                .map((u) => (
                  <Button
                    key={u._id}
                    variant="ghost"
                    onClick={() => createChat(u)}
                    className="w-full justify-start p-3 h-auto hover:bg-accent"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <UserCircle className="h-5 w-5 text-primary" />
                        </div>
                        {/* Online Symbol */}
                        {onlineUsers.includes(u._id) && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium text-card-foreground">
                          {u.name}
                        </span>
                        {onlineUsers.includes(u._id) ? (
                          <div className="text-xs text  -muted-foreground">
                            Online
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            Offline
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
            </div>
          </div>
        ) : chats && chats.length > 0 ? (
          <div className="p-4 space-y-2">
            {chats.map((chat) => {
              const latestMessage = chat.chat.latestMessage;
              const isSelected = selectedUser === chat.chat._id;
              const isSentByMe = latestMessage?.sender === loggedInUser?._id;
              const unseenCount = chat.chat.unseenCount || 0;

              return (
                <Button
                  key={chat.chat._id}
                  variant="ghost"
                  onClick={() => {
                    setSelectedUser(chat.chat._id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full justify-start p-3 h-auto ${
                    isSelected ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <UserCircle className="h-5 w-5 text-primary" />
                      </div>
                      {onlineUsers.includes(chat.user._id) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium truncate ${
                            isSelected ? "text-primary" : "text-card-foreground"
                          }`}
                        >
                          {chat.user.name}
                        </span>
                        {unseenCount > 0 && (
                          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {unseenCount > 99 ? "99+" : unseenCount}
                          </div>
                        )}
                      </div>
                      {latestMessage && (
                        <div className="flex items-center gap-1 mt-1">
                          {isSentByMe ? (
                            <CornerUpLeft className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <CornerDownRight className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground truncate">
                            {latestMessage.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-card-foreground mb-2">
              No conversation yet
            </p>
            <p className="text-sm text-muted-foreground">
              Start a new chat to begin messaging
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link href={"/profile"} className="block">
          <Button
            variant="ghost"
            className="w-full justify-start p-3 h-auto hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-card-foreground">Profile</span>
            </div>
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start p-3 h-auto hover:bg-destructive/10 text-destructive hover:text-destructive"
        >
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </div>
        </Button>
      </div>
    </aside>
  );
};

export default ChatSidebar;
