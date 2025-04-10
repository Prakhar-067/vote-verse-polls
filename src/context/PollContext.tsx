
import React, { createContext, useContext, useState, useEffect } from "react";
import { Poll, Option } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface PollContextType {
  polls: Poll[];
  activePoll: Poll | null;
  setActivePoll: (poll: Poll | null) => void;
  createPoll: (question: string, options: string[]) => void;
  updatePoll: (pollId: string, question: string, options: string[]) => void;
  deletePoll: (pollId: string) => void;
  votePoll: (pollId: string, optionId: string) => void;
  saveAsTemplate: (pollId: string) => void;
  templates: Poll[];
  togglePollStatus: (pollId: string) => void;
  userCanVote: (pollId: string) => boolean;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

// Sample polls for demo
const initialPolls: Poll[] = [
  {
    id: "poll-1",
    question: "What's your favorite programming language?",
    options: [
      { id: "opt-1", text: "JavaScript", votes: 7 },
      { id: "opt-2", text: "Python", votes: 5 },
      { id: "opt-3", text: "Java", votes: 3 },
      { id: "opt-4", text: "C#", votes: 2 }
    ],
    createdAt: new Date().toISOString(),
    createdBy: "admin-1",
    isActive: true,
    voted: []
  },
  {
    id: "poll-2",
    question: "Which frontend framework do you prefer?",
    options: [
      { id: "opt-5", text: "React", votes: 10 },
      { id: "opt-6", text: "Vue", votes: 4 },
      { id: "opt-7", text: "Angular", votes: 3 },
      { id: "opt-8", text: "Svelte", votes: 6 }
    ],
    createdAt: new Date().toISOString(),
    createdBy: "admin-1",
    isActive: true,
    voted: []
  }
];

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [templates, setTemplates] = useState<Poll[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(initialPolls[0]);
  const { currentUser } = useAuth();

  // Load saved polls from localStorage
  useEffect(() => {
    const savedPolls = localStorage.getItem("polls");
    const savedTemplates = localStorage.getItem("templates");
    
    if (savedPolls) {
      setPolls(JSON.parse(savedPolls));
    }
    
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Save polls to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("polls", JSON.stringify(polls));
  }, [polls]);

  useEffect(() => {
    localStorage.setItem("templates", JSON.stringify(templates));
  }, [templates]);

  const createPoll = (question: string, optionTexts: string[]) => {
    if (!currentUser?.isAdmin) {
      toast.error("Only admins can create polls");
      return;
    }

    const options: Option[] = optionTexts.map(text => ({
      id: uuidv4(),
      text,
      votes: 0
    }));

    const newPoll: Poll = {
      id: uuidv4(),
      question,
      options,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      isActive: true,
      voted: []
    };

    setPolls([...polls, newPoll]);
    setActivePoll(newPoll);
    toast.success("Poll created successfully!");
  };

  const updatePoll = (pollId: string, question: string, optionTexts: string[]) => {
    if (!currentUser?.isAdmin) {
      toast.error("Only admins can update polls");
      return;
    }

    const pollToUpdate = polls.find(p => p.id === pollId);
    if (!pollToUpdate) return;

    // Create a map of existing options to maintain votes
    const existingOptionsMap = pollToUpdate.options.reduce<Record<string, number>>((acc, opt) => {
      acc[opt.text] = opt.votes;
      return acc;
    }, {});

    // Create new options array, preserving votes where text matches
    const updatedOptions: Option[] = optionTexts.map(text => ({
      id: uuidv4(),
      text,
      votes: existingOptionsMap[text] || 0
    }));

    const updatedPoll: Poll = {
      ...pollToUpdate,
      question,
      options: updatedOptions
    };

    const updatedPolls = polls.map(p => p.id === pollId ? updatedPoll : p);
    setPolls(updatedPolls);
    setActivePoll(updatedPoll);
    toast.success("Poll updated successfully!");
  };

  const deletePoll = (pollId: string) => {
    if (!currentUser?.isAdmin) {
      toast.error("Only admins can delete polls");
      return;
    }

    const updatedPolls = polls.filter(p => p.id !== pollId);
    setPolls(updatedPolls);
    
    if (activePoll?.id === pollId) {
      setActivePoll(updatedPolls.length > 0 ? updatedPolls[0] : null);
    }
    
    toast.success("Poll deleted");
  };

  const votePoll = (pollId: string, optionId: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to vote");
      return;
    }

    const pollToVote = polls.find(p => p.id === pollId);
    if (!pollToVote) return;

    if (!pollToVote.isActive) {
      toast.error("This poll is no longer active");
      return;
    }

    if (pollToVote.voted.includes(currentUser.id)) {
      toast.error("You have already voted in this poll");
      return;
    }

    const updatedOptions = pollToVote.options.map(opt => 
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );

    const updatedPoll: Poll = {
      ...pollToVote,
      options: updatedOptions,
      voted: [...pollToVote.voted, currentUser.id]
    };

    const updatedPolls = polls.map(p => p.id === pollId ? updatedPoll : p);
    setPolls(updatedPolls);
    
    if (activePoll?.id === pollId) {
      setActivePoll(updatedPoll);
    }
    
    toast.success("Vote recorded!");
  };

  const saveAsTemplate = (pollId: string) => {
    if (!currentUser?.isAdmin) {
      toast.error("Only admins can save templates");
      return;
    }

    const pollToSave = polls.find(p => p.id === pollId);
    if (!pollToSave) return;

    // Create a clean template with no votes
    const templateOptions: Option[] = pollToSave.options.map(opt => ({
      id: uuidv4(),
      text: opt.text,
      votes: 0
    }));

    const template: Poll = {
      ...pollToSave,
      id: uuidv4(),
      options: templateOptions,
      createdAt: new Date().toISOString(),
      voted: []
    };

    setTemplates([...templates, template]);
    toast.success("Poll saved as template");
  };

  const togglePollStatus = (pollId: string) => {
    if (!currentUser?.isAdmin) {
      toast.error("Only admins can activate/deactivate polls");
      return;
    }

    const updatedPolls = polls.map(p => 
      p.id === pollId ? { ...p, isActive: !p.isActive } : p
    );
    
    setPolls(updatedPolls);
    
    if (activePoll?.id === pollId) {
      const updatedActivePoll = updatedPolls.find(p => p.id === pollId);
      if (updatedActivePoll) {
        setActivePoll(updatedActivePoll);
      }
    }
    
    const poll = polls.find(p => p.id === pollId);
    toast.success(`Poll ${poll?.isActive ? 'deactivated' : 'activated'}`);
  };

  const userCanVote = (pollId: string): boolean => {
    if (!currentUser) return false;
    
    const poll = polls.find(p => p.id === pollId);
    if (!poll || !poll.isActive) return false;
    
    return !poll.voted.includes(currentUser.id);
  };

  const value = {
    polls,
    activePoll,
    setActivePoll,
    createPoll,
    updatePoll,
    deletePoll,
    votePoll,
    saveAsTemplate,
    templates,
    togglePollStatus,
    userCanVote
  };

  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
};

export const usePolls = (): PollContextType => {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error("usePolls must be used within a PollProvider");
  }
  return context;
};
