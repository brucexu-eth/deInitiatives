/*
  # Initial Schema for DAO Voting App

  1. New Tables
    - `initiatives`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `created_by` (text)
      - `is_archived` (boolean)
    
    - `tasks`
      - `id` (uuid, primary key)
      - `initiative_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `vote_count` (integer)
      - `created_at` (timestamptz)
      - `created_by` (text)
      - `is_archived` (boolean)
    
    - `votes`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key)
      - `user_address` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create initiatives table
CREATE TABLE IF NOT EXISTS initiatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL,
  is_archived boolean DEFAULT false
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid REFERENCES initiatives(id),
  title text NOT NULL,
  description text,
  vote_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL,
  is_archived boolean DEFAULT false
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id),
  user_address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, user_address)
);

-- Enable RLS
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for initiatives
CREATE POLICY "Anyone can read initiatives"
  ON initiatives
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create initiatives"
  ON initiatives
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Creators can update their own initiatives"
  ON initiatives
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = created_by);

-- Create policies for tasks
CREATE POLICY "Anyone can read tasks"
  ON tasks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Creators can update their own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = created_by);

-- Create policies for votes
CREATE POLICY "Anyone can read votes"
  ON votes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create votes"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete their own votes"
  ON votes
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_address);