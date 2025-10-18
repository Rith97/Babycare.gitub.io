import React, { useState, useMemo } from 'react';
import { HealthRecord, HealthEventType } from '../types';
import { PlusIcon, TrashIcon, DownloadIcon } from './icons';

interface HealthPanelProps {
  records: HealthRecord[];
  onAdd: (record: Omit<HealthRecord, 'id' | 'profileId'>) => void;
  onDelete: (id: string) => void;
}

const HealthPanel: React.FC<HealthPanelProps> = ({ records, onAdd, onDelete }) => {
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [type, setType] = useState<HealthEventType>('💧 សើម');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    if (!dateTime || !value) {
      alert('សូមបញ្ចូលព័ត៌មានឲ្យបានគ្រប់គ្រាន់');
      return;
    }
    onAdd({ dateTime, type, value, notes });
    // Reset form
    setValue('');
    setNotes('');
  };

  const getInputType = () => {
    switch (type) {
      case '🌡️ កម្តៅ': return { placeholder: '37.5', suffix: '°C' };
      case '⚖️ ទម្ងន់': return { placeholder: '5.2', suffix: 'kg' };
      case '📏 កម្ពស់': return { placeholder: '58', suffix: 'cm' };
      case '🩺 រោគសញ្ញា': return { placeholder: 'ក្ដៅខ្លួន, ក្អក', suffix: '' };
      case '💧 សើម':
      case '💩 ប្រឡាក់':
        return { placeholder: '', suffix: '' };
      default: return { placeholder: '', suffix: '' };
    }
  };

  const isDiaperEvent = type === '💧 សើម' || type === '💩 ប្រឡាក់';

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [records]);

  const exportToCsv = () => {
    const headers = 'DateTime,Type,Value,Notes';
    const rows = sortedRecords.map(r => 
      [
        `"${new Date(r.dateTime).toLocaleString()}"`,
        r.type,
        `"${r.value}"`,
        `"${r.notes || ''}"`
      ].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "health_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl sm:text-2xl font-bold">❤️ សុខភាព</h3>
          <span className="badge badge-success">{records.length} កំណត់ត្រា</span>
        </div>
        <button onClick={exportToCsv} className="btn btn-success">
            <DownloadIcon /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="klabel">⏰ កាលបរិច្ឆេទ/ម៉ោង</label>
          <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} />
        </div>
        <div>
          <label className="klabel">📝 ប្រភេទ</label>
          <select value={type} onChange={e => { setType(e.target.value as HealthEventType); setValue(e.target.value === '💧 សើម' ? 'Yes' : e.target.value === '💩 ប្រឡាក់' ? 'Yes' : ''); }}>
            <option>💧 សើម</option>
            <option>💩 ប្រឡាក់</option>
            <option>🌡️ កម្តៅ</option>
            <option>⚖️ ទម្ងន់</option>
            <option>📏 កម្ពស់</option>
            <option>🩺 រោគសញ្ញា</option>
          </select>
        </div>
        
        {!isDiaperEvent && (
            <div className="relative">
                <label className="klabel">តម្លៃ</label>
                <input 
                    type={type === '🩺 រោគសញ្ញា' ? 'text' : 'number'}
                    placeholder={getInputType().placeholder}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                />
                {getInputType().suffix && <span className="absolute right-3 top-10 text-gray-400">{getInputType().suffix}</span>}
            </div>
        )}

        <div className={isDiaperEvent ? 'md:col-span-2' : 'md:col-span-3'}>
            <label className="klabel">🗒️ កំណត់ចំណាំ</label>
            <input type="text" placeholder="ព័ត៌មានបន្ថែម..." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        
        <div className="md:col-span-full">
            <button onClick={handleAdd} className="btn btn-success w-full">
                <PlusIcon /> បន្ថែមកំណត់ត្រា
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ម៉ោង</th>
              <th>ប្រភេទ</th>
              <th>តម្លៃ</th>
              <th>ចំណាំ</th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map(record => (
              <tr key={record.id}>
                <td>{new Date(record.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>{record.type}</td>
                <td>{record.type === '💧 សើម' || record.type === '💩 ប្រឡាក់' ? '✔️' : record.value}</td>
                <td>{record.notes || '—'}</td>
                <td>
                  <button onClick={() => onDelete(record.id)} className="text-red-500 hover:text-red-700">
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
             {sortedRecords.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-8">គ្មានកំណត់ត្រា</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default HealthPanel;