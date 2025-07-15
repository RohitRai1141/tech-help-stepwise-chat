import React, { useState } from 'react';
import { QAItem } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Save } from 'lucide-react';

interface QAFormProps {
  item?: QAItem;
  onSave: (item: Omit<QAItem, 'id'>) => void;
  onCancel: () => void;
}

const QAForm: React.FC<QAFormProps> = ({ item, onSave, onCancel }) => {
  const [question, setQuestion] = useState(item?.question || '');
  const [steps, setSteps] = useState<string[]>(item?.answer || ['']);

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && steps.some(step => step.trim())) {
      onSave({
        question: question.trim(),
        answer: steps.filter(step => step.trim())
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? 'Edit Q&A' : 'Add New Q&A'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the technical issue or question"
              required
            />
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <Label>Troubleshooting Steps</Label>
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  {index + 1}
                </div>
                <Textarea
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder={`Step ${index + 1} instructions...`}
                  className="flex-1"
                  rows={2}
                />
                {steps.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeStep(index)}
                    className="mt-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addStep}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="tech">
              <Save className="h-4 w-4 mr-2" />
              Save Q&A
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QAForm;