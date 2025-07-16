
"use client"

import type React from "react"
import type { ChatMessage as ChatMessageType } from "@/types/chat"
import { Bot, User, CheckCircle, XCircle, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ChatMessageProps {
  message: ChatMessageType
  onAction: (actionType: "worked" | "not_working" | "contact_support") => void
  onSendMailClick: () => void
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAction, onSendMailClick }) => {
  const isUser = message.type === "user"

  return (
    <div className={cn("flex items-start space-x-3 mb-4", isUser ? "flex-row-reverse space-x-reverse" : "")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
          isUser ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm border",
          isUser
            ? "bg-blue-600 text-white border-blue-600 rounded-tr-md"
            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-tl-md",
        )}
      >
        {/* Step indicator for bot messages */}
        {!isUser && message.isStep && message.stepNumber && (
          <div className="flex items-center mb-3 pb-2 border-b border-slate-200 dark:border-slate-600">
            <Badge variant="secondary" className="text-xs font-medium">
              <CheckCircle className="h-3 w-3 mr-1" />
              Step {message.stepNumber} of {message.totalSteps}
            </Badge>
          </div>
        )}

        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

        <div
          className={cn(
            "text-xs mt-2 opacity-70",
            isUser ? "text-right text-blue-100" : "text-left text-slate-500 dark:text-slate-400",
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* Action buttons for bot steps */}
        {!isUser && message.showActionButtons && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
              onClick={() => onAction("worked")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              It worked!
            </Button>
            <Button
              variant="outline"
              className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600"
              onClick={() => onAction("not_working")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Still not working
            </Button>
            <Button
              variant="outline"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
              onClick={() => onAction("contact_support")}
            >
              <Phone className="h-4 w-4 mr-2" />
              Contact support
            </Button>
          </div>
        )}

        {/* Send Mail button */}
        {!isUser && message.showSendMailOption && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 border-slate-300 dark:border-slate-600"
              onClick={onSendMailClick}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Mail
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
