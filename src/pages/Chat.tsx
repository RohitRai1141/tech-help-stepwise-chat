
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType, QAItem, ChatSession } from '@/types/chat';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, HelpCircle } from 'lucide-react';

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
      "Use Windows Recovery Environment if the above doesn't work"
    ]
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
      "Contact your ISP if the issue persists across all devices"
    ]
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
      "Uninstall and reinstall the application if issues persist"
    ]
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
      "Consider adding more RAM or upgrading to an SSD if hardware is old"
    ]
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
      "Try printing a test page from printer properties"
    ]
  }
];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [qaItems, setQAItems] = useState<QAItem[]>([]);
  const [session, setSession] = useState<ChatSession>({
    currentQA: null,
    currentStep: 0,
    isInProgress: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Q&A items on component mount
  useEffect(() => {
    fetchQAItems();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message after qaItems are loaded
  useEffect(() => {
    if (qaItems.length > 0) {
      addBotMessage(getWelcomeMessage());
    }
  }, [qaItems]);

  const fetchQAItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/qa');
      
      if (response.ok) {
        const data = await response.json();
        setQAItems(data);
      } else {
        throw new Error('Server response not ok');
      }
    } catch (error) {
      console.log('Server not available, using fallback Q&A data');
      setQAItems(FALLBACK_QA_DATA);
    }
  };

  const getWelcomeMessage = () => {
    return `Welcome to IT Support Assistant! 🛠️

I can help you with technical issues. You can:
• Type a full question (e.g., "My computer won't start after a Windows update")
• Type a number (1-${qaItems.length}) to see a specific solution

How can I help you today?`;
  };

  const addBotMessage = (content: string, isStep = false, stepNumber?: number, totalSteps?: number) => {
    const message: ChatMessageType = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      isStep,
      stepNumber,
      totalSteps
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessageType = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleNextStep = (qa: QAItem, stepIndex: number) => {
    if (stepIndex < qa.answer.length) {
      const step = qa.answer[stepIndex];
      addBotMessage(step, true, stepIndex + 1, qa.answer.length);
      
      setSession({
        currentQA: qa,
        currentStep: stepIndex + 1,
        isInProgress: true
      });
    } else {
      // All steps completed
      addBotMessage("If none of the above steps helped, please contact our support team for further assistance.");
      setSession({
        currentQA: null,
        currentStep: 0,
        isInProgress: false
      });
    }
  };

  const handleUserMessage = async (userInput: string) => {
    setIsLoading(true);
    addUserMessage(userInput);

    // Check if user wants to continue with current troubleshooting
    if (session.isInProgress && session.currentQA) {
      const continueKeywords = ['next', 'continue', 'step', "didn't work", "not working", "try next"];
      const shouldContinue = continueKeywords.some(keyword => 
        userInput.toLowerCase().includes(keyword)
      );

      if (shouldContinue) {
        setTimeout(() => {
          handleNextStep(session.currentQA!, session.currentStep);
          setIsLoading(false);
        }, 1000);
        return;
      }
    }

    // Check if input is a number (question index)
    const questionNumber = parseInt(userInput.trim());
    if (!isNaN(questionNumber) && questionNumber >= 1 && questionNumber <= qaItems.length) {
      const selectedQA = qaItems[questionNumber - 1];
      setTimeout(() => {
        addBotMessage(`Great! I found a solution for: "${selectedQA.question}"\n\nLet me walk you through the steps:`);
        handleNextStep(selectedQA, 0);
        setIsLoading(false);
      }, 1000);
      return;
    }

    // Search for matching question
    const matchedQA = qaItems.find(qa => 
      qa.question.toLowerCase().includes(userInput.toLowerCase()) ||
      userInput.toLowerCase().includes(qa.question.toLowerCase())
    );

    setTimeout(() => {
      if (matchedQA) {
        addBotMessage(`I found a solution for your issue: "${matchedQA.question}"\n\nLet me guide you through the troubleshooting steps:`);
        handleNextStep(matchedQA, 0);
      } else {
        addBotMessage(`I couldn't find a specific solution for "${userInput}". Here are the available topics:\n\n${qaItems.map((qa, index) => `${index + 1}. ${qa.question}`).join('\n')}\n\nPlease type the number of the topic that best matches your issue, or try rephrasing your question.`);
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="h-full flex flex-col max-w-4xl mx-auto">
        {/* Chat Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Support Chat</h1>
                <p className="text-sm text-muted-foreground">Get help with technical issues</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <HelpCircle className="h-3 w-3 mr-1" />
                {qaItems.length} solutions available
              </Badge>
              {session.isInProgress && (
                <Badge className="bg-success text-success-foreground text-xs">
                  Troubleshooting in progress
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <Card className="flex-1 m-6 mb-0 overflow-hidden">
          <div className="h-96 overflow-y-auto p-4 space-y-2">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Chat Input */}
        <ChatInput 
          onSendMessage={handleUserMessage}
          disabled={isLoading}
          placeholder={
            session.isInProgress 
              ? "Type 'next' to continue or ask a new question..."
              : "Type your question or a number (1-" + qaItems.length + ")..."
          }
        />
      </div>
    </Layout>
  );
};

export default Chat;
