"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Send, XCircle } from "lucide-react"

interface MailFormProps {
  initialMessage?: string
  initialSubject?: string
  onSend: (formData: {
    name: string
    email: string
    subject: string
    message: string
    originalQuestion: string
  }) => void
  onCancel: () => void
  lastUserQuestion: string
}

const MailForm: React.FC<MailFormProps> = ({
  initialMessage = "",
  initialSubject = "IT Support Query",
  onSend,
  onCancel,
  lastUserQuestion,
}) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState(initialSubject)
  const [message, setMessage] = useState(initialMessage)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMessage(initialMessage)
  }, [initialMessage])

  // Method 1: Using mailto (opens user's default email client)
  const sendViaMailto = (formData: {
    name: string
    email: string
    subject: string
    message: string
    originalQuestion: string
  }) => {
    const mailtoBody = `
Name: ${formData.name}
Email: ${formData.email}
Original Question: ${formData.originalQuestion}

Message:
${formData.message}
    `.trim()

    const mailtoUrl = `mailto:rohitrai.26csb@licet.ac.in?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(mailtoBody)}`
    
    window.open(mailtoUrl, '_blank')
    return { success: true }
  }

  // Method 2: Using your own backend API endpoint
  const sendViaAPI = async (formData: {
    name: string
    email: string
    subject: string
    message: string
    originalQuestion: string
  }) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'rohitrai.26csb@licet.ac.in',
          from: formData.email,
          subject: formData.subject,
          html: `
            <h3>IT Support Query</h3>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Original Question:</strong> ${formData.originalQuestion}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${formData.message.replace(/\n/g, '<br>')}</p>
          `,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      return { success: true }
    } catch (error) {
      console.error('API Error:', error)
      return { success: false, error: error.message }
    }
  }

  // Method 3: Using Web3Forms (free service)
  const sendViaWeb3Forms = async (formData: {
    name: string
    email: string
    subject: string
    message: string
    originalQuestion: string
  }) => {
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'your-web3forms-access-key', // Get from web3forms.com
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: `Original Question: ${formData.originalQuestion}\n\n${formData.message}`,
          to: 'rohitrai.26csb@licet.ac.in',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      return { success: true }
    } catch (error) {
      console.error('Web3Forms Error:', error)
      return { success: false, error: error.message }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !subject || !message) {
      alert("Please fill in all fields.")
      return
    }

    setIsLoading(true)
    
    const formData = { name, email, subject, message, originalQuestion: lastUserQuestion }
    
    try {
      // Choose your preferred method:
      
      // Option 1: Open default email client (always works)
      const result = sendViaMailto(formData)
      
      // Option 2: Use your backend API (requires backend setup)
      // const result = await sendViaAPI(formData)
      
      // Option 3: Use Web3Forms (requires free signup)
      // const result = await sendViaWeb3Forms(formData)
      
      if (result.success) {
        onSend(formData)
        alert("Email client opened successfully!")
      } else {
        alert("Failed to send email. Please try again.")
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert("An error occurred while sending the email.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Mail to Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="email">Your Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Describe your issue in detail..."
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send Mail'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default MailForm