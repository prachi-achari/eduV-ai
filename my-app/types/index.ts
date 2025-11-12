// types/index.ts
export interface UserProfile {
  id?: string;
  name: string;
  role: "student" | "teacher";
  age: number | string;
  subject: string;
  chat_style: string; // ✅ Changed to match database column
  qualification: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
