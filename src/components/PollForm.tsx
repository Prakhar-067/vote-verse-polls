
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash, Plus } from "lucide-react";
import { usePolls } from "@/context/PollContext";

interface PollFormProps {
  initialQuestion?: string;
  initialOptions?: string[];
  editingPollId?: string;
  isTemplate?: boolean;
  onClose?: () => void;
}

const PollForm = ({
  initialQuestion = "",
  initialOptions = ["", ""],
  editingPollId,
  isTemplate = false,
  onClose
}: PollFormProps) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [options, setOptions] = useState(initialOptions);
  const { createPoll, updatePoll } = usePolls();

  // Only update state from props when component mounts or props actually change
  useEffect(() => {
    if (initialQuestion !== question) {
      setQuestion(initialQuestion);
    }
    
    // Check if options array has actually changed
    const optionsChanged = 
      initialOptions.length !== options.length || 
      initialOptions.some((opt, index) => options[index] !== opt);
    
    if (optionsChanged) {
      setOptions([...initialOptions]);
    }
  }, [initialQuestion, initialOptions]); // Remove options and question from dependency array

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return; // Require at least 2 options
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty options
    const validOptions = options.filter(opt => opt.trim() !== "");
    
    if (validOptions.length < 2) {
      alert("You need at least 2 options");
      return;
    }
    
    if (editingPollId) {
      updatePoll(editingPollId, question, validOptions);
    } else {
      createPoll(question, validOptions);
    }
    
    if (onClose) onClose();
    
    // Reset form if not editing
    if (!editingPollId) {
      setQuestion("");
      setOptions(["", ""]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Poll Question</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          required
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Options</Label>
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-1" /> Add Option
          </Button>
        </div>
        
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              required
              className="flex-grow"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(index)}
              disabled={options.length <= 2}
              className="text-destructive hover:text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {editingPollId ? "Update Poll" : isTemplate ? "Create from Template" : "Create Poll"}
        </Button>
      </div>
    </form>
  );
};

export default PollForm;
