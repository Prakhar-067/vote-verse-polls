
import React, { useState } from "react";
import { usePolls } from "@/context/PollContext";
import { useAuth } from "@/context/AuthContext";
import { Poll } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Copy, PowerOff, CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import PollChart from "@/components/PollChart";
import PollForm from "@/components/PollForm";

interface PollCardProps {
  poll: Poll;
  isActive?: boolean;
  isTemplate?: boolean;
}

const PollCard = ({ poll, isActive, isTemplate = false }: PollCardProps) => {
  const { votePoll, togglePollStatus, deletePoll, saveAsTemplate, userCanVote } = usePolls();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { currentUser } = useAuth();
  
  const isAdmin = currentUser?.isAdmin || false;
  const canVote = userCanVote(poll.id);
  
  const handleVote = () => {
    if (!selectedOption) return;
    votePoll(poll.id, selectedOption);
    setSelectedOption(null);
    setShowResults(true);
  };
  
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  if (isTemplate) {
    return (
      <Card className={cn("transition-all h-full flex flex-col hover:shadow-md")}>
        <CardHeader>
          <CardTitle className="text-base">{poll.question}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <ul className="space-y-2">
            {poll.options.map((option) => (
              <li key={option.id} className="text-sm">
                • {option.text}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" /> Use Template
          </Button>
        </CardFooter>
        
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create Poll from Template</DialogTitle>
              <DialogDescription>
                You can modify the template before creating a new poll
              </DialogDescription>
            </DialogHeader>
            <PollForm 
              initialQuestion={poll.question} 
              initialOptions={poll.options.map(opt => opt.text)} 
              isTemplate={true}
              onClose={() => setShowEditDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all h-full flex flex-col",
      isActive && "border-poll-primary/50 ring-1 ring-poll-primary/10"
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{poll.question}</CardTitle>
          {!poll.isActive && (
            <Badge variant="outline" className="bg-muted">Inactive</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {showResults ? (
          <div className="h-full flex flex-col">
            <div className="text-xs text-muted-foreground mb-2">
              Total votes: {totalVotes}
            </div>
            <PollChart poll={poll} className="h-64" />
          </div>
        ) : (
          <ul className="space-y-2">
            {poll.options.map((option) => (
              <li key={option.id}>
                <Button
                  variant="outline"
                  onClick={() => canVote && setSelectedOption(option.id)}
                  className={cn(
                    "w-full justify-start h-auto py-3 text-left font-normal poll-option-default",
                    selectedOption === option.id && "poll-option-selected",
                    !canVote && "opacity-80 cursor-not-allowed"
                  )}
                  disabled={!canVote}
                >
                  <span className="mr-2">
                    {selectedOption === option.id ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </span>
                  {option.text}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-wrap justify-between gap-2">
        {!showResults && canVote ? (
          <>
            <Button 
              variant="ghost" 
              onClick={() => setShowResults(true)}
              className="text-xs"
            >
              View results
            </Button>
            <Button
              onClick={handleVote}
              disabled={!selectedOption}
            >
              Submit Vote
            </Button>
          </>
        ) : (
          <>
            {!canVote && !showResults && (
              <Button 
                variant="ghost" 
                onClick={() => setShowResults(true)}
                className="text-xs"
              >
                View results
              </Button>
            )}
            {showResults && (
              <Button 
                variant="ghost" 
                onClick={() => setShowResults(false)}
                className="text-xs"
              >
                Hide results
              </Button>
            )}
            
            {isAdmin && (
              <div className="flex gap-2 ml-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => saveAsTemplate(poll.id)}
                >
                  <Copy className="h-4 w-4 mr-1" /> Template
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => togglePollStatus(poll.id)}
                >
                  <PowerOff className="h-4 w-4 mr-1" /> {poll.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deletePoll(poll.id)}
                >
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            )}
          </>
        )}
      </CardFooter>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Poll</DialogTitle>
            <DialogDescription>
              Make changes to your poll question or options
            </DialogDescription>
          </DialogHeader>
          <PollForm 
            initialQuestion={poll.question} 
            initialOptions={poll.options.map(opt => opt.text)} 
            editingPollId={poll.id}
            onClose={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PollCard;
