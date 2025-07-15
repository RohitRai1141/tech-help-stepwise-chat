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

const Admin: React.FC = () => {
  const [qaItems, setQAItems] = useState<QAItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<QAItem | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQAItems();
  }, []);

  const fetchQAItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/qa');
      const data = await response.json();
      setQAItems(data);
    } catch (error) {
      console.error('Failed to fetch Q&A items:', error);
      toast({
        title: "Error",
        description: "Failed to load Q&A items",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQA = async (qaData: Omit<QAItem, 'id'>) => {
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
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} variant="tech">
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteQA(item.id)}
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