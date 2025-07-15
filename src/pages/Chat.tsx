import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType, QAItem, ChatSession } from '@/types/chat';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, HelpCircle } from 'lucide-react';

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
    // Add welcome message
    addBotMessage(getWelcomeMessage());
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchQAItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/qa');
      const data = await response.json();
      setQAItems(data);
    } catch (error) {
      console.error('Failed to fetch Q&A items:', error);
      addBotMessage("Sorry, I'm having trouble connecting to the support database. Please try again later.");
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