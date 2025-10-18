
import React, { useState, useMemo } from 'react';
import { Reminder } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface RemindersPanelProps {
  reminders: Reminder[];
  onAdd: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const RemindersPanel: React.FC<RemindersPanelProps> = ({ reminders, onAdd, onDelete, onToggle }) => {
  const [text, setText] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));

  const handleAdd = () => {
    if (!text || !dateTime) {
        alert('សូមបញ្ចូលចំណងជើង និងពេលវេលា');
        return;
    }
    onAdd({ text, dateTime });
    setText('');
    setDateTime(new Date().toISOString().slice(0, 16));
  };
  
  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).sort((a,b) => Number(a.completed) - Number(b.completed));
  }, [reminders]);

  return (
    <section className="card">
       <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl sm:text-2xl font-bold">⏰ ការរំលឹក</h3>
          <span className="badge badge-warning">{reminders.filter(r => !r.completed).length} កំពុងរង់ចាំ</span>
        </div>
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
        {sortedReminders.map(reminder => (
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
         {sortedReminders.length === 0 && (
            <div className="text-center text-gray-500 py-8">គ្មានការរំលឹក</div>
        )}
      </div>
    </section>
  );
};

export default RemindersPanel;