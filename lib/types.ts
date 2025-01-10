export interface Topic {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Item {
  id: string;
  topic_id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  upVotes: number;
  downVotes: number;
  userVote?: string | null;
}

export interface Vote {
  id: string;
  itemId: string;
  voter: string;
  voteType: string;
  createdAt: Date;
}