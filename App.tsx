
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { AppData, Profile, Tab, FeedRecord, SleepRecord, HealthRecord, Reminder } from './types';
import ProfileEditorModal from './components/ProfileEditorModal';
import FeedPanel from './components/FeedPanel';
import SleepPanel from './components/SleepPanel';
import HealthPanel from './components/HealthPanel';
import VaccinationPanel from './components/VaccinationPanel';
import RemindersPanel from './components/RemindersPanel';
import KnowledgePanel from './components/KnowledgePanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import { PlusIcon, EditIcon, DownloadIcon, UploadIcon } from './components/icons';

const initialData: AppData = {
  profiles: [],
  activeProfileId: null,
  feedRecords: {},
  sleepRecords: {},
  healthRecords: {},
  completedVax: {},
  reminders: [],
  isDarkMode: false,
};

const App: React.FC = () => {
  const [data, setData] = useLocalStorage<AppData>('babyCareData', initialData);
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);

  useEffect(() => {
    if (data.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.isDarkMode]);
  
  const activeProfile = useMemo(() => {
    return data.profiles.find(p => p.id === data.activeProfileId) || null;
  }, [data.profiles, data.activeProfileId]);

  const handleProfileSave = (profile: Profile) => {
    const existing = data.profiles.find(p => p.id === profile.id);
    let newProfiles;
    if (existing) {
      newProfiles = data.profiles.map(p => p.id === profile.id ? profile : p);
    } else {
      newProfiles = [...data.profiles, profile];
    }
    setData(prev => ({
      ...prev,
      profiles: newProfiles,
      activeProfileId: profile.id,
      feedRecords: { ...prev.feedRecords, [profile.id]: prev.feedRecords[profile.id] || [] },
      sleepRecords: { ...prev.sleepRecords, [profile.id]: prev.sleepRecords[profile.id] || [] },
      healthRecords: { ...prev.healthRecords, [profile.id]: prev.healthRecords[profile.id] || [] },
      completedVax: { ...prev.completedVax, [profile.id]: prev.completedVax[profile.id] || {} },
    }));
    setProfileModalOpen(false);
    setProfileToEdit(null);
  };

  const handleProfileDelete = (profileId: string) => {
    const { [profileId]: deletedFeed, ...remainingFeeds } = data.feedRecords;
    const { [profileId]: deletedSleep, ...remainingSleeps } = data.sleepRecords;
    const { [profileId]: deletedHealth, ...remainingHealth } = data.healthRecords;
    const { [profileId]: deletedVax, ...remainingVax } = data.completedVax;

    const newProfiles = data.profiles.filter(p => p.id !== profileId);
    
    setData({
      ...data,
      profiles: newProfiles,
      activeProfileId: newProfiles.length > 0 ? newProfiles[0].id : null,
      feedRecords: remainingFeeds,
      sleepRecords: remainingSleeps,
      healthRecords: remainingHealth,
      completedVax: remainingVax,
    });
    setProfileModalOpen(false);
    setProfileToEdit(null);
  };
  
  const addRecord = useCallback(<T extends { id: string, profileId: string }>(recordType: keyof AppData, record: Omit<T, 'id' | 'profileId'>) => {
      if (!activeProfile) return;
      const newRecord = {
        ...record,
        id: `${recordType}_${Date.now()}`,
        profileId: activeProfile.id,
      } as T;

      setData(prev => {
        const currentRecords = (prev[recordType] as { [key: string]: T[] })[activeProfile.id] || [];
        return {
            ...prev,
            [recordType]: {
                ...prev[recordType],
                [activeProfile.id]: [...currentRecords, newRecord],
            },
        };
      });
  }, [activeProfile, setData]);

  const deleteRecord = useCallback((recordType: 'feedRecords' | 'sleepRecords' | 'healthRecords', id: string) => {
    if (!activeProfile) return;
    setData(prev => {
        const updatedRecords = ((prev[recordType] as any)[activeProfile.id] || []).filter((r: any) => r.id !== id);
        return {
            ...prev,
            [recordType]: {
                ...prev[recordType],
                [activeProfile.id]: updatedRecords,
            }
        };
    });
  }, [activeProfile, setData]);

  const addReminder = useCallback((reminder: Omit<Reminder, 'id' | 'completed'>) => {
    const newReminder = { ...reminder, id: `reminder_${Date.now()}`, completed: false };
    setData(prev => ({ ...prev, reminders: [...prev.reminders, newReminder] }));
  }, [setData]);

  const deleteReminder = useCallback((id: string) => {
    setData(prev => ({ ...prev, reminders: prev.reminders.filter(r => r.id !== id) }));
  }, [setData]);
  
  const toggleReminder = useCallback((id: string) => {
    setData(prev => ({ ...prev, reminders: prev.reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r) }));
  }, [setData]);

  const toggleVax = useCallback((vaxKey: string, date: string) => {
    if(!activeProfile) return;
    setData(prev => {
        const profileVax = { ...(prev.completedVax[activeProfile.id] || {}) };
        if (profileVax[vaxKey]) {
            delete profileVax[vaxKey];
        } else {
            profileVax[vaxKey] = date;
        }
        return {
            ...prev,
            completedVax: {
                ...prev.completedVax,
                [activeProfile.id]: profileVax
            }
        };
    })
  }, [activeProfile, setData]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years > 0 ? `${years} ឆ្នាំ ` : ''}${months > 0 ? `${months} ខែ ` : ''}${days} ថ្ងៃ`;
  };

  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "babycare_data.json";
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = JSON.parse(e.target?.result as string) as AppData;
          // Basic validation
          if (result.profiles && result.feedRecords) {
            setData(result);
            alert('Data imported successfully!');
          } else {
            throw new Error('Invalid data format');
          }
        } catch (error) {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };


  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      
      <header className="glass rounded-3xl p-4 sm:p-6 mb-8 sticky top-4 z-40">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="logo w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">👶</div>
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">BabyCare Web</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">🚀 PWA-ready • 📊 Analytics • 🌙 Dark Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="klabel mb-0">Theme</span>
              <div onClick={() => setData(d => ({ ...d, isDarkMode: !d.isDarkMode }))} className={`switch ${data.isDarkMode ? 'on' : ''}`} role="button" aria-label="Toggle dark mode"></div>
            </div>
            <button onClick={handleExport} className="btn btn-ghost"><DownloadIcon/> Export</button>
            <label className="btn btn-outline cursor-pointer"><UploadIcon /> Import <input type="file" accept="application/json" className="sr-only" onChange={handleImport} /></label>
          </div>
        </div>
      </header>

      <section className="card mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[280px]">
            <label className="klabel">ជ្រើសរើសទារក</label>
            <div className="flex gap-3">
              <select className="flex-1" value={data.activeProfileId || ''} onChange={e => setData(d => ({ ...d, activeProfileId: e.target.value }))} disabled={!data.profiles.length}>
                {data.profiles.length === 0 && <option>គ្មានប្រវត្តិរូប</option>}
                {data.profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button onClick={() => { setProfileToEdit(null); setProfileModalOpen(true); }} className="btn btn-secondary"><PlusIcon /> បន្ថែម</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="info-card"><div className="text-xs text-gray-500 mb-1">អាយុ</div><div className="font-bold text-lg">{activeProfile ? calculateAge(activeProfile.dob) : '—'}</div></div>
            <div className="info-card"><div className="text-xs text-gray-500 mb-1">ថ្ងៃកើត</div><div className="font-bold text-lg">{activeProfile ? new Date(activeProfile.dob).toLocaleDateString() : '—'}</div></div>
            <div className="info-card"><div className="text-xs text-gray-500 mb-1">ភេទ</div><div className="font-bold text-lg">{activeProfile?.gender === 'male' ? '👦' : activeProfile?.gender === 'female' ? '👧' : '👶'}</div></div>
          </div>
          <button onClick={() => { if (activeProfile) { setProfileToEdit(activeProfile); setProfileModalOpen(true); } }} disabled={!activeProfile} className="btn btn-outline"><EditIcon /> កែប្រែ</button>
        </div>
      </section>

      <ProfileEditorModal 
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSave={handleProfileSave}
        onDelete={handleProfileDelete}
        profileToEdit={profileToEdit}
      />
      
      <nav className="flex flex-nowrap gap-3 mb-8 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-lg overflow-x-auto no-scrollbar">
        {(['feed', 'sleep', 'health', 'vax', 'reminders', 'knowledge', 'analytics'] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`tab ${activeTab === tab ? 'tab-active' : ''}`}>
                {{
                    feed: '🍼 ការបំបៅ', sleep: '😴 ការគេង', health: '❤️ សុខភាព', vax: '💉 វ៉ាក់សាំង', reminders: '⏰ ការរំលឹក', knowledge: '📚 ចំណេះដឹង', analytics: '📊 ក្រាហ្វ'
                }[tab]}
            </button>
        ))}
      </nav>

      <main>
        {!activeProfile && data.profiles.length > 0 && <div className="card text-center"><p>សូមជ្រើសរើសប្រវត្តិរូប</p></div>}
        {!activeProfile && data.profiles.length === 0 && <div className="card text-center"><p>សូមចាប់ផ្តើមដោយការបន្ថែមប្រវត្តិរូបទារកថ្មី</p></div>}
        
        {activeProfile && (
            <div className="space-y-8">
                <div className={activeTab === 'feed' ? '' : 'hidden'}><FeedPanel records={data.feedRecords[activeProfile.id] || []} onAdd={(r) => addRecord('feedRecords', r)} onDelete={(id) => deleteRecord('feedRecords', id)} /></div>
                <div className={activeTab === 'sleep' ? '' : 'hidden'}><SleepPanel records={data.sleepRecords[activeProfile.id] || []} onAdd={(r) => addRecord('sleepRecords', r)} onDelete={(id) => deleteRecord('sleepRecords', id)} /></div>
                <div className={activeTab === 'health' ? '' : 'hidden'}><HealthPanel records={data.healthRecords[activeProfile.id] || []} onAdd={(r) => addRecord('healthRecords', r)} onDelete={(id) => deleteRecord('healthRecords', id)} /></div>
                <div className={activeTab === 'vax' ? '' : 'hidden'}><VaccinationPanel babyDob={activeProfile.dob} completedVax={data.completedVax[activeProfile.id] || {}} onToggleVax={toggleVax} /></div>
                <div className={activeTab === 'reminders' ? '' : 'hidden'}><RemindersPanel reminders={data.reminders} onAdd={addReminder} onDelete={deleteReminder} onToggle={toggleReminder} /></div>
                <div className={activeTab === 'knowledge' ? '' : 'hidden'}><KnowledgePanel /></div>
                <div className={activeTab === 'analytics' ? '' : 'hidden'}><AnalyticsPanel feedRecords={data.feedRecords[activeProfile.id] || []} sleepRecords={data.sleepRecords[activeProfile.id] || []} /></div>
            </div>
        )}
      </main>

    </div>
  );
};

export default App;