import React, { useState, useMemo } from 'react';
import { FeedRecord, FeedSide, FeedType } from '../types';
import { PlusIcon, TrashIcon, DownloadIcon } from './icons';

interface FeedPanelProps {
  records: FeedRecord[];
  onAdd: (record: Omit<FeedRecord, 'id' | 'profileId'>) => void;
  onDelete: (id: string) => void;
}

const FeedPanel: React.FC<FeedPanelProps> = ({ records, onAdd, onDelete }) => {
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [type, setType] = useState<FeedType>('🤱 ទឹកដោះម៉ាក់');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [side, setSide] = useState<FeedSide>('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = () => {
    if (!dateTime) {
      alert('សូមបញ្ចូលកាលបរិច្ឆេទ និងម៉ោង');
      return;
    }
    onAdd({
      dateTime,
      type,
      amount: amount ? Number(amount) : undefined,
      duration: duration ? Number(duration) : undefined,
      side,
      notes,
    });
    // Reset form
    setDateTime(new Date().toISOString().slice(0, 16));
    setType('🤱 ទឹកដោះម៉ាក់');
    setAmount('');
    setDuration('');
    setSide('');
    setNotes('');
  };

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => 
        r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [records, searchTerm]);

  const exportToCsv = () => {
    const headers = 'DateTime,Type,Amount (ml/g),Duration (min),Side,Notes';
    const rows = filteredRecords.map(r => 
      [
        `"${new Date(r.dateTime).toLocaleString()}"`,
        r.type,
        r.amount || '',
        r.duration || '',
        r.side || '',
        `"${r.notes || ''}"`
      ].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "feeding_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl sm:text-2xl font-bold">🍼 ការបំបៅ</h3>
          <span className="badge badge-primary">{records.length} កំណត់ត្រា</span>
        </div>
        <div className="flex gap-3 flex-wrap">
          <input 
            type="search" 
            className="w-full sm:w-48"
            placeholder="🔍 ស្វែងរក..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={exportToCsv} className="btn btn-success">
            <DownloadIcon /> Export
          </button>
        </div>
      </div>

      <div className="grid-auto mb-6">
        <div>
          <label className="klabel">⏰ កាលបរិច្ឆេទ/ម៉ោង</label>
          <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} />
        </div>
        <div>
          <label className="klabel">📝 ប្រភេទ</label>
          <select value={type} onChange={e => setType(e.target.value as FeedType)}>
            <option>🤱 ទឹកដោះម៉ាក់</option>
            <option>🍼 ទឹកដោះគោ/Formula</option>
            <option>🥄 បបរ/អាហាររឹង</option>
            <option>💧 ទឹក/ភេសជ្ជៈ</option>
          </select>
        </div>
        <div>
          <label className="klabel">📏 បរិមាណ (ml/gram)</label>
          <input type="number" min="0" placeholder="120" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="klabel">⏱️ រយៈពេល (នាទី)</label>
          <input type="number" min="0" placeholder="15" value={duration} onChange={e => setDuration(e.target.value)} />
        </div>
        <div>
          <label className="klabel">👈👉 ជើង</label>
          <select value={side} onChange={e => setSide(e.target.value as FeedSide)}>
            <option value="">—</option>
            <option>👈 ឆ្វេង</option>
            <option>👉 ស្ដាំ</option>
            <option>👐 ទាំងពីរ</option>
          </select>
        </div>
        <div className="md:col-span-2">
            <label className="klabel">🗒️ កំណត់ចំណាំ</label>
            <input type="text" placeholder="ឧ. បានបៅយ៉ាងល្អ" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="md:col-span-full">
            <button onClick={handleAdd} className="btn btn-primary w-full">
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
              <th>បរិមាណ</th>
              <th>រយៈពេល</th>
              <th>ជើង</th>
              <th>ចំណាំ</th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(record => (
              <tr key={record.id}>
                <td>{new Date(record.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>{record.type}</td>
                <td>{record.amount ? `${record.amount} ml/g` : '—'}</td>
                <td>{record.duration ? `${record.duration} min` : '—'}</td>
                <td>{record.side || '—'}</td>
                <td>{record.notes || '—'}</td>
                <td>
                  <button onClick={() => onDelete(record.id)} className="text-red-500 hover:text-red-700">
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-8">គ្មានកំណត់ត្រា</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default FeedPanel;