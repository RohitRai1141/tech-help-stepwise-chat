"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { ChatMessage as ChatMessageType, QAItem, ChatSession } from "@/types/chat"
import ChatMessage from "@/components/ChatMessage"
import ChatInput from "@/components/ChatInput"
import MailForm from "@/components/MailForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageSquare, HelpCircle, Headphones, Sun, Moon, User, LogOut, Settings } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { addSubmittedIssue } from "@/lib/mock-issues"

// Fallback Q&A data when server is not available
const FALLBACK_QA_DATA: QAItem[] = [
  {
    id: 1,
    question: "My computer won't start after a Windows update",
    answer: [
      "Hold power button for 10 seconds to force shutdown",
      "Restart and press F8 repeatedly during boot to access Safe Mode",
      "In Safe Mode, go to Settings > Update & Security > Recovery",
      "Click 'Go back to the previous version of Windows 10' if available",
      "If not available, try System Restore from Advanced startup options",
      "Use Windows Recovery Environment if the above doesn't work",
    ],
  },
  {
    id: 2,
    question: "Internet connection is slow or not working",
    answer: [
      "Check if other devices can connect to the internet",
      "Restart your router by unplugging it for 30 seconds",
      "Run Windows Network Troubleshooter: Settings > Network & Internet > Status > Network troubleshooter",
      "Reset network settings: netsh winsock reset in Command Prompt (as admin)",
      "Update network adapter drivers through Device Manager",
      "Contact your ISP if the issue persists across all devices",
    ],
  },
  {
    id: 3,
    question: "Application keeps crashing or freezing",
    answer: [
      "Close the application completely and restart it",
      "Check for application updates in the software or Microsoft Store",
      "Restart your computer to clear temporary files and processes",
      "Run the application as administrator (right-click > Run as administrator)",
      "Check Windows Event Viewer for specific error messages",
      "Uninstall and reinstall the application if issues persist",
    ],
  },
  {
    id: 4,
    question: "Computer is running very slowly",
    answer: [
      "Check Task Manager (Ctrl+Shift+Esc) for high CPU/memory usage",
      "Close unnecessary programs and browser tabs",
      "Run Disk Cleanup to free up storage space",
      "Disable startup programs: Task Manager > Startup tab",
      "Run Windows Defender full system scan",
      "Consider adding more RAM or upgrading to an SSD if hardware is old",
    ],
  },
  {
    id: 5,
    question: "Can't print documents from my computer",
    answer: [
      "Check if printer is powered on and connected (USB/WiFi)",
      "Verify paper is loaded and there are no paper jams",
      "Run Windows printer troubleshooter: Settings > Devices > Printers & scanners",
      "Update printer drivers from manufacturer's website",
      "Remove and re-add the printer in Windows settings",
      "Try printing a test page from printer properties",
    ],
  },
]

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [qaItems, setQAItems] = useState<QAItem[]>([])
  const [session, setSession] = useState<ChatSession>({
    currentQA: null,
    currentStep: 0,
    isInProgress: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showMailForm, setShowMailForm] = useState(false)
  const [lastUserQuestion, setLastUserQuestion] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // --- temporary local theme & auth placeholders (remove when real contexts are added)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
    // optional: add/remove html class for Tailwind dark mode
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "light")
    }
  }

  type FakeUser = { name: string; email: string; role: "user" | "admin" }
  const [user] = useState<FakeUser | null>({
    name: "Regular User",
    email: "user@example.com",
    role: "user",
  })
  const logout = () => alert("Logged out (stub)")
  // --- end placeholders

  // Load Q&A items on component mount
  useEffect(() => {
    fetchQAItems()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Add welcome message after qaItems are loaded
  useEffect(() => {
    if (qaItems.length > 0) {
      addBotMessage(getWelcomeMessage())
    }
  }, [qaItems])

  const fetchQAItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/qa")

      if (response.ok) {
        const data = await response.json()
        setQAItems(data)
      } else {
        throw new Error("Server response not ok")
      }
    } catch (error) {
      console.log("Server not available, using fallback Q&A data")
      setQAItems(FALLBACK_QA_DATA)
    }
  }

  const getWelcomeMessage = () => {
    return `Welcome to IT Support Assistant! 🛠️

I can help you with technical issues. You can:
• Type a full question (e.g., "My computer won't start after a Windows update")
• Type a number (1-${qaItems.length}) to see a specific solution

How can I help you today?`
  }

  const addBotMessage = (
    content: string,
    isStep = false,
    stepNumber?: number,
    totalSteps?: number,
    showActionButtons = false,
    showSendMailOption = false,
  ) => {
    const message: ChatMessageType = {
      id: Date.now().toString(),
      type: "bot",
      content,
      timestamp: new Date(),
      isStep,
      stepNumber,
      totalSteps,
      showActionButtons,
      showSendMailOption,
    }
    setMessages((prev) => [...prev, message])
  }

  const addUserMessage = (content: string) => {
    const message: ChatMessageType = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])
  }

  const handleNextStep = (qa: QAItem, stepIndex: number) => {
    if (stepIndex < qa.answer.length) {
      const step = qa.answer[stepIndex]
      addBotMessage(step, true, stepIndex + 1, qa.answer.length, true)

      setSession({
        currentQA: qa,
        currentStep: stepIndex + 1,
        isInProgress: true,
      })
    } else {
      addBotMessage(
        "If none of the above steps helped, please contact our support team for further assistance.",
        false,
        undefined,
        undefined,
        false,
        true,
      )
      setSession({
        currentQA: null,
        currentStep: 0,
        isInProgress: false,
      })
    }
  }

  const handleAction = (actionType: "worked" | "not_working" | "contact_support") => {
    setIsLoading(true)
    setTimeout(() => {
      if (actionType === "worked") {
        addUserMessage("It worked!")
        addBotMessage(
          "Excellent! I'm glad that solution worked for you. Your issue has been resolved successfully.\n\nIs there anything else I can help you troubleshoot today? I'm here whenever you need technical assistance.",
        )
        setSession({ currentQA: null, currentStep: 0, isInProgress: false })
      } else if (actionType === "not_working") {
        addUserMessage("Still not working")
        if (session.isInProgress && session.currentQA) {
          handleNextStep(session.currentQA, session.currentStep)
        } else {
          addBotMessage(
            "I'm sorry the previous steps didn't resolve your issue. Please try contacting our support team for further assistance.",
            false,
            undefined,
            undefined,
            false,
            true,
          )
          setSession({ currentQA: null, currentStep: 0, isInProgress: false })
        }
      } else if (actionType === "contact_support") {
        addUserMessage("Contact support")
        addBotMessage(
          `I'll help you get in touch with our technical support team for personalized assistance.

**Contact Options:**
• 📧 Email: support@company.com
• 📞 Phone: 1-800-HELP-NOW
• 💬 Live Chat: Available 24/7 on our website

You can also use the Send Mail option below to forward your query directly to our IT support team.

If you've already typed your issue here, you can simply click "Send Mail" to forward it for review.

Our admin will review your request and respond as soon as possible.`,
          false,
          undefined,
          undefined,
          false,
          true,
        )
        setSession({ currentQA: null, currentStep: 0, isInProgress: false })
      }
      setIsLoading(false)
    }, 500)
  }

  const handleSendMailClick = () => {
    setShowMailForm(true)
  }

  const handleMailFormSubmit = (formData: {
    name: string
    email: string
    subject: string
    message: string
    originalQuestion: string
  }) => {
    setIsLoading(true)
    setTimeout(() => {
      console.log("Simulating email to admin:", formData)
      addSubmittedIssue(formData)
      addUserMessage("Sent mail to support")
      addBotMessage(
        `✅ This issue has been forwarded to the admin.

🕵️‍♂️ Status: Pending Review

The admin will review the submitted message and prepare a solution or response shortly.`,
      )
      setSession({ currentQA: null, currentStep: 0, isInProgress: false })
      setShowMailForm(false)
      setIsLoading(false)
    }, 1000)
  }

  const handleCancelMailForm = () => {
    setShowMailForm(false)
  }

  const handleUserMessage = async (userInput: string) => {
    setIsLoading(true)
    addUserMessage(userInput)
    setLastUserQuestion(userInput)

    const questionNumber = Number.parseInt(userInput.trim())
    if (!isNaN(questionNumber) && questionNumber >= 1 && questionNumber <= qaItems.length) {
      const selectedQA = qaItems[questionNumber - 1]
      setTimeout(() => {
        addBotMessage(`Great! I found a solution for: "${selectedQA.question}"\n\nLet me walk you through the steps:`)
        handleNextStep(selectedQA, 0)
        setIsLoading(false)
      }, 1000)
      return
    }

    const matchedQA = qaItems.find(
      (qa) =>
        qa.question.toLowerCase().includes(userInput.toLowerCase()) ||
        userInput.toLowerCase().includes(qa.question.toLowerCase()),
    )

    setTimeout(() => {
      if (matchedQA) {
        addBotMessage(
          `I found a solution for your issue: "${matchedQA.question}"\n\nLet me guide you through the troubleshooting steps:`,
        )
        handleNextStep(matchedQA, 0)
      } else {
        addBotMessage(
          `I couldn't find a specific solution for "${userInput}". Here are the available topics:\n\n${qaItems.map((qa, index) => `${index + 1}. ${qa.question}`).join("\n")}\n\nPlease type the number of the topic that best matches your issue, or try rephrasing your question.`,
        )
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Fixed Header */}
      <header className="flex-shrink-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">IT Support</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Assistant</p>
            </div>
          </div>

          {/* Center Status */}
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-xs">
              <HelpCircle className="h-3 w-3 mr-1" />
              {qaItems.length} solutions available
            </Badge>
            {session.isInProgress && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Active session
              </Badge>
            )}
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-9 h-9 p-0">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* User Profile */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === "admin"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {user.role}
                    </span>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Scrollable Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto px-6 py-6">
          <Card className="h-full overflow-hidden bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onAction={handleAction}
                    onSendMailClick={handleSendMailClick}
                  />
                ))}

                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Chat Input Area or Mail Form */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="max-w-4xl mx-auto p-6">
          {showMailForm ? (
            <MailForm
              initialMessage={lastUserQuestion}
              onSend={handleMailFormSubmit}
              onCancel={handleCancelMailForm}
              lastUserQuestion={lastUserQuestion}
            />
          ) : (
            <ChatInput
              onSendMessage={handleUserMessage}
              disabled={isLoading}
              placeholder={
                session.isInProgress
                  ? "Type 'next' to continue or ask a new question..."
                  : `Type your question or a number (1-${qaItems.length})...`
              }
            />
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <footer className="flex-shrink-0 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <p>&copy; 2024 IT Support Assistant. All rights reserved.</p>
            <p className="flex items-center space-x-4">
              <span>v1.0.0</span>
              <span>•</span>
              <span>Need help? Contact support</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Chat
