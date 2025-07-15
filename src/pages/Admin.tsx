import React, { useState, useEffect } from 'react';
import { QAItem } from '@/types/chat';
import Layout from '@/components/Layout';
import QAForm from '@/components/admin/QAForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare,
  Users,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const Admin: React.FC = () => {
  const [qaItems, setQAItems] = useState<QAItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<QAItem | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [serverAvailable, setServerAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQAItems();
  }, []);

  const fetchQAItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/qa');
      
      if (response.ok) {
        const data = await response.json();
        setQAItems(data);
        setServerAvailable(true);
      } else {
        throw new Error('Server response not ok');
      }
    } catch (error) {
      console.log('Server not available, using fallback Q&A data');
      setQAItems(FALLBACK_QA_DATA);
      setServerAvailable(false);
      toast({
        title: "Server Offline",
        description: "Using demo data. Start json-server to enable full functionality.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQA = async (qaData: Omit<QAItem, 'id'>) => {
    if (!serverAvailable) {
      toast({
        title: "Server Offline",
        description: "Cannot save changes. Please start the json-server.",
        variant: "destructive"
      });
      return;
    }

    try {
      let response;
      
      if (editingItem) {
        // Update existing item
        response = await fetch(`http://localhost:5000/qa/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...qaData, id: editingItem.id }),
        });
      } else {
        // Create new item
        response = await fetch('http://localhost:5000/qa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(qaData),
        });
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: `Q&A ${editingItem ? 'updated' : 'created'} successfully`,
        });
        setShowForm(false);
        setEditingItem(undefined);
        fetchQAItems();
      } else {
        throw new Error('Failed to save Q&A');
      }
    } catch (error) {
      console.error('Error saving Q&A:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? 'update' : 'create'} Q&A`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteQA = async (id: number) => {
    if (!serverAvailable) {
      toast({
        title: "Server Offline",
        description: "Cannot delete items. Please start the json-server.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this Q&A item?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/qa/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Q&A deleted successfully",
        });
        fetchQAItems();
      } else {
        throw new Error('Failed to delete Q&A');
      }
    } catch (error) {
      console.error('Error deleting Q&A:', error);
      toast({
        title: "Error",
        description: "Failed to delete Q&A",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item: QAItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };

  if (showForm) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <QAForm
            item={editingItem}
            onSave={handleSaveQA}
            onCancel={handleCancelForm}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Admin Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage Q&A knowledge base and support system</p>
              {!serverAvailable && (
                <p className="text-sm text-destructive">⚠️ Server offline - using demo data</p>
              )}
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            variant="tech"
            disabled={!serverAvailable}
          >
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
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">24</p>
                </div>
                <Users className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved Issues</p>
                  <p className="text-2xl font-bold text-foreground">157</p>
                </div>
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Q&A Management */}
        <Card>
          <CardHeader>
            <CardTitle>Q&A Knowledge Base</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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
                              <span className="step-indicator">{index + 1}</span>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          disabled={!serverAvailable}
                        >
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
    </Layout>
  );
};

export default Admin;
