
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface Option {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: Option[];
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  voted: string[]; // user IDs who already voted
}
