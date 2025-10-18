import React, { useState, useMemo } from 'react';
import { SleepRecord } from '../types';
import { PlusIcon, TrashIcon, DownloadIcon } from './icons';

interface SleepPanelProps {
  records: SleepRecord[];
  onAdd: (record: Omit<SleepRecord, 'id' | 'profileId'>) => void;
  onDelete: (id: string) => void;
}

const SleepPanel: React.FC<SleepPanelProps> = ({ records, onAdd, onDelete }) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const [startTime, setStartTime] = useState(oneHourAgo.toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(now.toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '—';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    if (diff < 0) return 'Invalid';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  const handleAdd = () => {
    if (!startTime || !endTime) {
      alert('សូមបញ្ចូលពេលចាប់ផ្តើម និងពេលបញ្ចប់');
      return;
    }
    if (new Date(endTime) < new Date(startTime)) {
        alert('ពេលបញ្ចប់ត្រូវតែក្រោយពេលចាប់ផ្តើម');
        return;
    }
    onAdd({ startTime, endTime, notes });
    // Reset form
    setStartTime(new Date().toISOString().slice(0, 16));
    setEndTime(new Date(new Date().getTime() + 60 * 60 * 1000).toISOString().slice(0, 16));
    setNotes('');
  };
  
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [records]);

  const exportToCsv = () => {
    const headers = 'StartTime,EndTime,Duration (hours),Notes';
    const rows = sortedRecords.map(r => {
      const diff = new Date(r.endTime).getTime() - new Date(r.startTime).getTime();
      const durationHours = diff > 0 ? (diff / (1000 * 60 * 60)).toFixed(2) : '0';
      return [
        `"${new Date(r.startTime).toLocaleString()}"`,
        `"${new Date(r.endTime).toLocaleString()}"`,
        durationHours,
        `"${r.notes || ''}"`
      ].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sleep_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl sm:text-2xl font-bold">😴 ការគេង</h3>
          <span className="badge badge-secondary">{records.length} កំណត់ត្រា</span>
        </div>
        <button onClick={exportToCsv} className="btn btn-success">
            <DownloadIcon /> Export
        </button>
      </div>

      <div className="grid-auto mb-6">
        <div>
          <label className="klabel">ពេលចាប់ផ្តើម</label>
          <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div>
          <label className="klabel">ពេលបញ្ចប់</label>
          <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="klabel">រយៈពេល</label>
          <div className="info-card !p-3 text-center text-lg font-bold">{calculateDuration(startTime, endTime)}</div>
        </div>
         <div className="md:col-span-2">
            <label className="klabel">🗒️ កំណត់ចំណាំ</label>
            <input type="text" placeholder="ឧ. គេងលក់ស្កប់ស្កល់" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="md:col-span-full">
            <button onClick={handleAdd} className="btn btn-secondary w-full">
                <PlusIcon /> បន្ថែមកំណត់ត្រា
            </button>
        </div>
      </div>
      
       <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ពេលចាប់ផ្តើម</th>
              <th>ពេលបញ្ចប់</th>
              <th>រយៈពេល</th>
              <th>ចំណាំ</th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map(record => (
              <tr key={record.id}>
                <td>{new Date(record.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>{new Date(record.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td className="font-semibold">{calculateDuration(record.startTime, record.endTime)}</td>
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

export default SleepPanel;