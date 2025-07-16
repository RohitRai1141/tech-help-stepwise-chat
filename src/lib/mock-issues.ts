
export interface SubmittedIssue {
  id: string
  name: string
  email: string
  subject: string
  message: string
  originalQuestion?: string
  status: "pending" | "resolved"
  timestamp: Date
}

// In-memory storage for demo purposes
let submittedIssues: SubmittedIssue[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    subject: "Computer won't start",
    message: "My computer suddenly stopped working after the latest Windows update. I've tried restarting it multiple times but nothing happens.",
    originalQuestion: "My computer won't start after a Windows update",
    status: "pending",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    subject: "Internet connectivity issues",
    message: "I'm experiencing very slow internet speeds and frequent disconnections. This has been happening for the past week.",
    originalQuestion: "Internet connection is slow or not working",
    status: "resolved",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
  }
]

export const getSubmittedIssues = (): SubmittedIssue[] => {
  return submittedIssues
}

export const addSubmittedIssue = (issueData: {
  name: string
  email: string
  subject: string
  message: string
  originalQuestion: string
}): void => {
  const newIssue: SubmittedIssue = {
    id: Date.now().toString(),
    ...issueData,
    status: "pending",
    timestamp: new Date()
  }
  submittedIssues.unshift(newIssue) // Add to beginning of array
}

export const updateIssueStatus = (id: string, status: "pending" | "resolved"): void => {
  const issueIndex = submittedIssues.findIndex(issue => issue.id === id)
  if (issueIndex !== -1) {
    submittedIssues[issueIndex].status = status
  }
}
