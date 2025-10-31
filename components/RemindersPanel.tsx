
import React, { useState, useMemo } from 'react';
import { Reminder } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface RemindersPanelProps {
  reminders: Reminder[];
  onAdd: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

type FilterType = 'all' | 'today' | 'next7days' | 'overdue' | 'completed' | 'incomplete';

const RemindersPanel: React.FC<RemindersPanelProps> = ({ reminders, onAdd, onDelete, onToggle }) => {
  const [text, setText] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const handleAdd = () => {
    if (!text || !dateTime) {
        alert('សូមបញ្ចូលចំណងជើង និងពេលវេលា');
        return;
    }
    onAdd({ text, dateTime });
    setText('');
    setDateTime(new Date().toISOString().slice(0, 16));
  };
  
  const reminderCounts = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const sevenDaysFromNow = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const counts: Record<FilterType, number> = {
      all: reminders.length,
      today: 0,
      next7days: 0,
      overdue: 0,
      completed: 0,
      incomplete: 0,
    };

    reminders.forEach(reminder => {
      const reminderDate = new Date(reminder.dateTime);

      if (reminderDate >= todayStart && reminderDate <= todayEnd) {
        counts.today++;
      }
      if (reminderDate >= todayStart && reminderDate < sevenDaysFromNow && !reminder.completed) {
        counts.next7days++;
      }
      if (!reminder.completed && reminderDate < now) {
        counts.overdue++;
      }
      if (reminder.completed) {
        counts.completed++;
      }
      if (!reminder.completed) {
        counts.incomplete++;
      }
    });

    return counts;
  }, [reminders]);

  const filteredAndSortedReminders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const sevenDaysFromNow = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    const filtered = reminders.filter(reminder => {
      const reminderDate = new Date(reminder.dateTime);
      switch (activeFilter) {
        case 'today':
          return reminderDate >= todayStart && reminderDate <= todayEnd;
        case 'next7days':
          return reminderDate >= todayStart && reminderDate < sevenDaysFromNow && !reminder.completed;
        case 'overdue':
          return !reminder.completed && reminderDate < now;
        case 'completed':
          return reminder.completed;
        case 'incomplete':
          return !reminder.completed;
        case 'all':
        default:
          return true;
      }
    });

    return filtered
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [reminders, activeFilter]);

  const filters: { key: FilterType, label: string }[] = [
    { key: 'all', label: 'ទាំងអស់' },
    { key: 'incomplete', label: 'មិនទាន់​បញ្ចប់' },
    { key: 'today', label: 'ថ្ងៃនេះ' },
    { key: 'next7days', label: '7 ថ្ងៃបន្ទាប់' },
    { key: 'overdue', label: 'ហួសកំណត់' },
    { key: 'completed', label: 'បាន​បញ្ចប់' },
  ];

  return (
    <section className="card">
       <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl sm:text-2xl font-bold">⏰ ការរំលឹក</h3>
          <span className="badge badge-warning">{reminderCounts.incomplete} កំពុងរង់ចាំ</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 overflow-x-auto no-scrollbar">
        <span className="self-center font-semibold text-text-muted mr-2 whitespace-nowrap">តម្រៀបតាម:</span>
        {filters.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveFilter(key)} className={`tab ${activeFilter === key ? 'tab-active' : ''}`}>
            {label}
            <span className="ml-2 bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded-full">
              {reminderCounts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-grow min-w-[200px]">
            <label className="klabel">ការរំលឹកថ្មី</label>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="ឧ. ទៅជួបពេទ្យ" />
        </div>
        <div className="flex-grow min-w-[200px]">
            <label className="klabel">កាលបរិច្ឆេទ/ម៉ោង</label>
            <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} />
        </div>
        <div className="self-end">
            <button onClick={handleAdd} className="btn btn-primary w-full"><PlusIcon /> បន្ថែម</button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAndSortedReminders.map(reminder => (
          <div key={reminder.id} className={`info-card flex items-center gap-4 ${reminder.completed ? 'opacity-50' : ''}`}>
            <input 
              type="checkbox" 
              checked={reminder.completed} 
              onChange={() => onToggle(reminder.id)}
              className="w-6 h-6 rounded-md accent-indigo-500 cursor-pointer"
            />
            <div className="flex-grow">
              <p className={`font-semibold ${reminder.completed ? 'line-through' : ''}`}>{reminder.text}</p>
              <p className="text-sm text-gray-500">{new Date(reminder.dateTime).toLocaleString()}</p>
            </div>
            <button onClick={() => onDelete(reminder.id)} className="btn btn-ghost !text-red-500 hover:!bg-red-500/10">
              <TrashIcon />
            </button>
          </div>
        ))}
         {filteredAndSortedReminders.length === 0 && (
            <div className="text-center text-gray-500 py-8">
                {activeFilter === 'all' ? 'គ្មានការរំលឹក' : 'គ្មានការរំលឹកដែលត្រូវនឹងតម្រងនេះ'}
            </div>
        )}
      </div>
    </section>
  );
};

export default RemindersPanel;
