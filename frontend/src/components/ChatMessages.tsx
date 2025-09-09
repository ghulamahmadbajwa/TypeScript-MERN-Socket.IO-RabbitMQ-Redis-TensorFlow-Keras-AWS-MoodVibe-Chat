import React, { useEffect, useRef, useMemo } from "react";
import { Message } from "@/app/chat/page";
import { User } from "@/context/appContext";
import { Check, CheckCheck, Inbox } from "lucide-react";
import moment from "moment";

// ---------------------------------------------------------
// Props expected by ChatMessages
// ---------------------------------------------------------
interface ChatMessagesProps {
  selectedUser: string | null; // ID of the currently selected chat
  messages: Message[] | null;  // Messages of the chat
  loggedInUser: User | null;   // Currently logged-in user
}

// ---------------------------------------------------------
// ChatMessages Component
// ---------------------------------------------------------
const ChatMessages = ({ selectedUser, messages, loggedInUser }: ChatMessagesProps) => {
  // Reference to the bottom of the chat, for auto-scroll
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ----------------------------
  // Deduplicate messages (avoid duplicate IDs)
  // ----------------------------
  const uniqueMessages = useMemo(() => {
    if (!messages) return [];
    const seen = new Set<string>();
    return messages.filter((msg) => {
      if (seen.has(msg._id)) return false;
      seen.add(msg._id);
      return true;
    });
  }, [messages]);

  // ----------------------------
  // Auto-scroll to bottom whenever messages or selected chat change
  // ----------------------------
  useEffect(() => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }, 100);
  }, [selectedUser, uniqueMessages]);

  // ----------------------------
  // Auto-scroll for new messages (faster, more immediate)
  // ----------------------------
  useEffect(() => {
    if (uniqueMessages.length > 0) {
      // For new messages, scroll immediately without smooth animation
      const scrollToBottom = () => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      };
      
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(scrollToBottom);
    }
  }, [uniqueMessages.length]);

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 custom-scroll" 
        style={{ maxHeight: 'calc(100vh - 215px)' }}
      >
        
        {/* Case 1: No chat selected */}
        {!selectedUser ? (
          <p className="text-gray-400 text-center mt-20 flex flex-col items-center gap-2">
            Please select a user to start a conversation
            <Inbox className="w-6 h-6 text-gray-500" />
          </p>
        ) : (
          <>
            {/* Case 2: Chat selected → show messages */}
            {uniqueMessages.map((msg, index) => {
              const isSentByMe = msg.sender === loggedInUser?._id;

              return (
                <div
                  key={msg._id || `${index}-${msg.createdAt}`}
                  className={`flex flex-col gap-1 mt-2 ${
                    isSentByMe ? "items-end" : "items-start"
                  }`}
                >
                  {/* Message bubble */}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-xs break-words ${
                      isSentByMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-700 text-white rounded-bl-none"
                    }`}
                  >
                    {/* Image message */}
                    {msg.messageType === "image" && msg.image?.url && (
                      <img
                        src={msg.image.url}
                        alt="Shared image"
                        className="max-w-full h-auto rounded-lg"
                      />
                    )}

                    {/* Text message or caption */}
                    {msg.text && <p>{msg.text}</p>}
                  </div>

                  {/* Timestamp + Seen status */}
                  <div
                    className={`flex items-center gap-1 text-xs text-gray-400 ${
                      isSentByMe ? "pr-2 flex-row-reverse" : "pl-2"
                    }`}
                  >
                    <span>{moment(msg.createdAt).format("hh:mm A · MMM D")}</span>

                    {/* Seen status only for messages I sent */}
                    {isSentByMe && (
                      <div className="flex items-center ml-1">
                        {msg.seen ? (
                          <div className="flex items-center gap-1 text-blue-400">
                            <CheckCheck className="w-3 h-3" />
                            {msg.seenAt && (
                              <span>{moment(msg.seenAt).format("hh:mm A")}</span>
                            )}
                          </div>
                        ) : (
                          <Check className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Invisible div → ensures auto-scroll to bottom */}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
