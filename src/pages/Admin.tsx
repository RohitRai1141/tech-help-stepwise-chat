"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { QAItem, SubmittedIssue } from "@/types/chat"
import QAForm from "@/components/admin/QAForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Plus, Edit, Trash2, MessageSquare, Mail, CheckCircle, Headphones, Sun, Moon, User, LogOut, HelpCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getSubmittedIssues, updateIssueStatus } from "@/lib/mock-issues"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/contexts/ThemeContext"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

const Admin: React.FC = () => {
  const [qaItems, setQAItems] = useState<QAItem[]>([])
  const [submittedIssues, setSubmittedIssues] = useState<SubmittedIssue[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<QAItem | undefined>()
  const [isLoadingQA, setIsLoadingQA] = useState(true)
  const [isLoadingIssues, setIsLoadingIssues] = useState(true)
  const [serverAvailable, setServerAvailable] = useState(false)
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    fetchQAItems()
    fetchSubmittedIssues()
  }, [])

  const fetchQAItems = async () => {
    setIsLoadingQA(true)
    try {
      const response = await fetch("http://localhost:5000/qa")
      if (response.ok) {
        const data = await response.json()
        setQAItems(data)
        setServerAvailable(true)
      } else {
        throw new Error("Server response not ok")
      }
    } catch (error) {
      console.log("Server not available, using fallback Q&A data for QA items")
      setQAItems(FALLBACK_QA_DATA)
      setServerAvailable(false)
      toast({
        title: "Server Offline",
        description: "Using demo data. Start json-server to enable full functionality.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingQA(false)
    }
  }

  const fetchSubmittedIssues = async () => {
    setIsLoadingIssues(true)
    try {
      const issues = await getSubmittedIssues()
      setSubmittedIssues(issues)
      setServerAvailable(true)
    } catch (error) {
      console.error("Failed to fetch submitted issues:", error)
      setSubmittedIssues([])
      setServerAvailable(false)
      toast({
        title: "Server Offline",
        description: "Could not load submitted issues. Start json-server.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingIssues(false)
    }
  }

  const handleSaveQA = async (qaData: Omit<QAItem, "id">) => {
    if (!serverAvailable) {
      toast({
        title: "Server Offline",
        description: "Cannot save changes. Please start the json-server.",
        variant: "destructive",
      })
      return
    }
    try {
      let response
      if (editingItem) {
        response = await fetch(`http://localhost:5000/qa/${editingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...qaData, id: editingItem.id }),
        })
      } else {
        response = await fetch("http://localhost:5000/qa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(qaData),
        })
      }
      if (response.ok) {
        toast({
          title: "Success",
          description: `Q&A ${editingItem ? "updated" : "created"} successfully`,
        })
        setShowForm(false)
        setEditingItem(undefined)
        fetchQAItems()
      } else {
        throw new Error("Failed to save Q&A")
      }
    } catch (error) {
      console.error("Error saving Q&A:", error)
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? "update" : "create"} Q&A`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteQA = async (id: number) => {
    if (!serverAvailable) {
      toast({
        title: "Server Offline",
        description: "Cannot delete items. Please start the json-server.",
        variant: "destructive",
      })
      return
    }
    if (!confirm("Are you sure you want to delete this Q&A item?")) {
      return
    }
    try {
      const response = await fetch(`http://localhost:5000/qa/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "Success",
          description: "Q&A deleted successfully",
        })
        fetchQAItems()
      } else {
        throw new Error("Failed to delete Q&A")
      }
    } catch (error) {
      console.error("Error deleting Q&A:", error)
      toast({
        title: "Error",
        description: "Failed to delete Q&A",
        variant: "destructive",
      })
    }
  }

  const handleMarkIssueResolved = async (id: string) => {
    if (!serverAvailable) {
      toast({
        title: "Server Offline",
        description: "Cannot update issue status. Please start the json-server.",
        variant: "destructive",
      })
      return
    }
    try {
      const result = await updateIssueStatus(id, "resolved")
      if (result) {
        fetchSubmittedIssues()
        toast({
          title: "Issue Resolved",
          description: `Issue ${id} marked as resolved.`,
        })
      } else {
        throw new Error("Failed to update issue status.")
      }
    } catch (error) {
      console.error("Error marking issue resolved:", error)
      toast({
        title: "Error",
        description: "Failed to mark issue as resolved.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (item: QAItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingItem(undefined)
  }

  const handleBackToChat = () => {
    navigate("/")
  }

  // Ensure only admin users can see the form
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Access Denied. You must be an admin to view this page.</p>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <header className="flex-shrink-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between h-full px-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">IT Support</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Admin Panel</p>
              </div>
            </div>
            
            {/* Center Status */}
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                {editingItem ? "Editing Q&A" : "Adding Q&A"}
              </Badge>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-9 h-9 p-0">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              
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
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {user.role}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center space-x-2" onClick={handleBackToChat}>
                      <MessageSquare className="h-4 w-4" />
                      <span>Back to Chat</span>
                    </DropdownMenuItem>
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <QAForm item={editingItem} onSave={handleSaveQA} onCancel={handleCancelForm} />
          </div>
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <p>&copy; 2024 IT Support Assistant. All rights reserved.</p>
              <p className="flex items-center space-x-4">
                <span>v1.0.0</span>
                <span>•</span>
                <span>Admin Panel</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  const pendingIssues = submittedIssues.filter((issue) => issue.status === "pending")
  const resolvedIssues = submittedIssues.filter((issue) => issue.status === "resolved")

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">IT Support</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Admin Panel</p>
            </div>
          </div>
          
          {/* Center Status */}
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-xs">
              <HelpCircle className="h-3 w-3 mr-1" />
              {qaItems.length} Q&A items
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Mail className="h-3 w-3 mr-1" />
              {pendingIssues.length} pending issues
            </Badge>
            {!serverAvailable && (
              <Badge variant="destructive" className="text-xs">
                Server offline
              </Badge>
            )}
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-9 h-9 p-0">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            
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
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {user.role}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2" onClick={handleBackToChat}>
                    <MessageSquare className="h-4 w-4" />
                    <span>Back to Chat</span>
                  </DropdownMenuItem>
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

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Admin Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage Q&A knowledge base and support system</p>
                {!serverAvailable && <p className="text-sm text-destructive">⚠️ Server offline - using demo data</p>}
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} variant="default" disabled={!serverAvailable}>
              <Plus className="h-4 w-4 mr-2" />
              Add Q&A
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Q&A Items</p>
                    <p className="text-2xl font-bold text-foreground">{qaItems.length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Issues</p>
                    <p className="text-2xl font-bold text-foreground">{pendingIssues.length}</p>
                  </div>
                  <Mail className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved Issues</p>
                    <p className="text-2xl font-bold text-foreground">{resolvedIssues.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submitted Issues Section */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted User Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingIssues ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading submitted issues...</p>
                </div>
              ) : submittedIssues.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No submitted issues yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submittedIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`border rounded-lg p-4 ${
                        issue.status === "resolved" ? "border-green-300 bg-green-50/50" : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground mb-1">Subject: {issue.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            From: {issue.name} ({issue.email})
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Submitted: {issue.timestamp.toLocaleString()}
                          </p>
                          <p className="text-sm text-foreground mt-2">**Message:** {issue.message}</p>
                          {issue.originalQuestion && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Original Chat Question: {issue.originalQuestion}
                            </p>
                          )}
                          <Badge
                            className={`mt-2 text-xs ${
                              issue.status === "pending"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }`}
                          >
                            Status: {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {issue.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkIssueResolved(issue.id)}
                              disabled={!serverAvailable}
                              className="text-green-600 hover:text-green-700 border-green-600 hover:border-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Q&A Management */}
          <Card>
            <CardHeader>
              <CardTitle>Q&A Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingQA ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading Q&A items...</p>
                </div>
              ) : qaItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No Q&A items found. Add your first one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {qaItems.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground mb-2">{item.question}</h3>
                          <div className="space-y-2">
                            {item.answer.map((step, index) => (
                              <div key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {item.answer.length} steps
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(item)} disabled={!serverAvailable}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQA(item.id)}
                            disabled={!serverAvailable}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <p>&copy; 2024 IT Support Assistant. All rights reserved.</p>
            <p className="flex items-center space-x-4">
              <span>v1.0.0</span>
              <span>•</span>
              <span>Admin Panel</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Admin