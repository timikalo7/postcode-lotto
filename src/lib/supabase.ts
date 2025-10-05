import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Charity {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string | null;
  created_at: string;
}

export interface Story {
  id: string;
  charity_id: string;
  title: string;
  content: string;
  author: string | null;
  news_url: string | null;
  created_at: string;
}

export interface CharityWithStory extends Charity {
  stories: Story[];
}
