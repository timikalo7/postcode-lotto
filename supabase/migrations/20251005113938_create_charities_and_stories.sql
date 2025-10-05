/*
  # Create Charities and Stories Tables

  1. New Tables
    - `charities`
      - `id` (uuid, primary key)
      - `name` (text, charity name)
      - `latitude` (numeric, location latitude)
      - `longitude` (numeric, location longitude)
      - `address` (text, full address)
      - `description` (text, brief description)
      - `created_at` (timestamptz)
    
    - `stories`
      - `id` (uuid, primary key)
      - `charity_id` (uuid, foreign key to charities)
      - `title` (text, story title)
      - `content` (text, story content)
      - `author` (text, story author/subject)
      - `news_url` (text, link to original article)
      - `created_at` (timestamptz)
    
    - `charity_suggestions`
      - `id` (uuid, primary key)
      - `user_name` (text, user's name)
      - `user_email` (text, user's email)
      - `charity_name` (text, suggested charity name)
      - `reason` (text, why they suggest this charity)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public can read charities and stories
    - Authenticated users can insert charity suggestions
    - Public users can insert charity suggestions (for accessibility)
*/

CREATE TABLE IF NOT EXISTS charities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  address text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  charity_id uuid REFERENCES charities(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  author text,
  news_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS charity_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text NOT NULL,
  charity_name text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read charities"
  ON charities FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read stories"
  ON stories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can submit charity suggestions"
  ON charity_suggestions FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_stories_charity_id ON stories(charity_id);
CREATE INDEX IF NOT EXISTS idx_charities_location ON charities(latitude, longitude);