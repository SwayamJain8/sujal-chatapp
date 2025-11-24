import { Message } from "@/app/chat/page";
import { User } from "@/context/AppContext";
import { Check, CheckCheck, Mail } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useRef } from "react";
import moment from "moment";

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
}

const ChatMessages = ({
  selectedUser,
  messages,
  loggedInUser,
}: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  //seen feature
  const uniqueMessages = useMemo(() => {
    if (!messages) return [];
    const seen = new Set();
    return messages.filter((message) => {
      if (seen.has(message._id)) return false;
      seen.add(message._id);
      return true;
    });
  }, [messages]);

  useEffect(() => {
    console.log(uniqueMessages);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser, uniqueMessages]);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 space-y-4">
        {!selectedUser ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-card-foreground mb-2">
                Please select a user to start chatting
              </p>
              <p className="text-sm text-muted-foreground">
                Choose a conversation from the sidebar
              </p>
            </div>
          </div>
        ) : (
          <>
            {uniqueMessages.map((e, i) => {
              const isSentByMe = e.sender === loggedInUser?._id;
              const uniqueKey = `${e._id}-${i}`;

              return (
                <div
                  className={`flex ${
                    isSentByMe ? "justify-end" : "justify-start"
                  }`}
                  key={uniqueKey}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg ${
                      isSentByMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-card-foreground"
                    } rounded-lg p-3 shadow-sm`}
                  >
                    {e.messageType === "image" && e.image && (
                      <div className="mb-2">
                        <Image
                          src={e.image.url}
                          alt="shared image"
                          width={200}
                          height={200}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    )}
                    {e.text && (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {e.text}
                      </p>
                    )}

                    <div
                      className={`flex items-center justify-between mt-2 text-xs ${
                        isSentByMe
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span>
                        {moment(e.createdAt).format("hh:mm A • MMM D")}
                      </span>
                      {isSentByMe && (
                        <div className="flex items-center gap-1 ml-2">
                          {e.seen ? (
                            <div className="flex items-center gap-1">
                              <CheckCheck className="h-3 w-3 text-blue-400" />
                              {e.seenAt && (
                                <span>
                                  {moment(e.seenAt).format("hh:mm A • MMM D")}
                                </span>
                              )}
                            </div>
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef}></div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessages;
