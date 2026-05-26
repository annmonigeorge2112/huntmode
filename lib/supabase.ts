import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HRContact {
  id?: string;
  name: string;
  title?: string;
  email?: string;
  linkedin_url?: string;
  company: string;
  company_domain?: string;
  location?: string;
  geography?: "singapore" | "malaysia" | "hong_kong" | "chennai" | "bangalore" | "kochi";
  domain?: string;
  source?: string;
  contacted_at?: string;
  reply_received?: boolean;
  reply_at?: string;
  notes?: string;
  match_score?: number;
  created_at?: string;
}

export interface Job {
  id?: string;
  title: string;
  company: string;
  location?: string;
  geography?: string;
  apply_url?: string;
  description?: string;
  match_score?: number;
  match_reasons?: string[];
  status?: "discovered" | "applied" | "no_reply" | "interview" | "rejected" | "offer";
  applied_at?: string;
  deadline?: string;
  source?: string;
  is_hot?: boolean;
  created_at?: string;
}

export interface OutreachEmail {
  id?: string;
  hr_id?: string;
  job_id?: string;
  subject: string;
  body: string;
  status?: "draft" | "reviewed" | "sent" | "replied";
  sent_at?: string;
  gmail_thread_id?: string;
  created_at?: string;
}

export interface Resume {
  id?: string;
  filename: string;
  storage_path: string;
  is_active?: boolean;
  uploaded_at?: string;
}

export interface DailyLog {
  id?: string;
  date: string;
  hrs_contacted?: number;
  emails_sent?: number;
  applications_submitted?: number;
  replies_received?: number;
}
