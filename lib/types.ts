export interface Initiative {
  id: string;
  title: string;
  description: string;
  created_at: string;
  created_by: string;
  is_archived: boolean;
}

export interface Task {
  id: string;
  initiative_id: string;
  title: string;
  description: string;
  vote_count: number;
  created_at: string;
  created_by: string;
  is_archived: boolean;
}

export interface Vote {
  id: string;
  task_id: string;
  user_address: string;
  created_at: string;
}