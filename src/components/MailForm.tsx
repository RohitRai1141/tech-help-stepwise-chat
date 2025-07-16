
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

  useEffect(() => {
    setMessage(initialMessage)
  }, [initialMessage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && email && subject && message) {
      onSend({ name, email, subject, message, originalQuestion: lastUserQuestion })
    } else {
      alert("Please fill in all fields.")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-6 w-6" /> Send Mail to Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Your Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
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
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Send className="h-4 w-4 mr-2" />
              Send Mail
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default MailForm
