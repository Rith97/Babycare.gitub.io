
export interface Profile {
  id: string;
  name: string;
  dob: string; // ISO string 'YYYY-MM-DD'
  gender: 'male' | 'female' | 'other' | '';
  note?: string;
}

export type FeedType = '🤱 ទឹកដោះម៉ាក់' | '🍼 ទឹកដោះគោ/Formula' | '🥄 បបរ/អាហាររឹង' | '💧 ទឹក/ភេសជ្ជៈ';
export type FeedSide = '👈 ឆ្វេង' | '👉 ស្ដាំ' | '👐 ទាំងពីរ' | '';

export interface FeedRecord {
  id: string;
  profileId: string;
  dateTime: string; // ISO string
  type: FeedType;
  amount?: number; // in ml or grams
  duration?: number; // in minutes
  side?: FeedSide;
  notes?: string;
}

export interface SleepRecord {
  id: string;
  profileId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  notes?: string;
}

export type HealthEventType = '💧 សើម' | '💩 ប្រឡាក់' | '🌡️ កម្តៅ' | '⚖️ ទម្ងន់' | '📏 កម្ពស់' | '🩺 រោគសញ្ញា';

export interface HealthRecord {
  id: string;
  profileId: string;
  dateTime: string; // ISO string
  type: HealthEventType;
  value: string; // e.g., '37.5 C', '5.2 kg', 'Fever'
  notes?: string;
}

export interface Reminder {
  id: string;
  text: string;
  dateTime: string; // ISO string
  completed: boolean;
}

export interface VaxInfo {
  key: string;
  name: string;
  age: number; // in months
  description: string;
}

export type Tab = 'feed' | 'sleep' | 'health' | 'vax' | 'reminders' | 'knowledge' | 'analytics';

export interface AppData {
  profiles: Profile[];
  activeProfileId: string | null;
  feedRecords: { [profileId: string]: FeedRecord[] };
  sleepRecords: { [profileId:string]: SleepRecord[] };
  healthRecords: { [profileId: string]: HealthRecord[] };
  completedVax: { [profileId: string]: { [vaxKey: string]: string } }; // { vax_key: 'YYYY-MM-DD' }
  reminders: Reminder[];
  isDarkMode: boolean;
}
