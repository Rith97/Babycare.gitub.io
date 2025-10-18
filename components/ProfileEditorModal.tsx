
import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { SaveIcon, TrashIcon } from './icons';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: Profile) => void;
  onDelete?: (profileId: string) => void;
  profileToEdit?: Profile | null;
}

const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({ isOpen, onClose, onSave, onDelete, profileToEdit }) => {
  const [profile, setProfile] = useState<Profile>({ id: '', name: '', dob: '', gender: '' });

  useEffect(() => {
    if (profileToEdit) {
      setProfile(profileToEdit);
    } else {
      setProfile({
        id: `profile_${Date.now()}`,
        name: '',
        dob: new Date().toISOString().split('T')[0],
        gender: '',
        note: ''
      });
    }
  }, [profileToEdit, isOpen]);

  const handleSave = () => {
    if (profile.name && profile.dob && profile.gender) {
      onSave(profile);
    } else {
      alert('សូមបំពេញគ្រប់ព័ត៌មាន');
    }
  };

  const handleDelete = () => {
    if (onDelete && profileToEdit && window.confirm(`តើអ្នកប្រាកដទេថាចង់លុបប្រវត្តិរូប "${profileToEdit.name}"?`)) {
        onDelete(profileToEdit.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="card modal-content max-w-lg w-full">
        <h3 className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {profileToEdit ? '✏️ កែប្រែព័ត៌មានទារក' : '➕ បន្ថែមព័ត៌មានទារកថ្មី'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="klabel">ឈ្មោះ</label>
            <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full" placeholder="ឈ្មោះទារក" />
          </div>
          <div>
            <label className="klabel">ថ្ងៃកំណើត</label>
            <input value={profile.dob} onChange={e => setProfile({ ...profile, dob: e.target.value })} type="date" className="w-full" />
          </div>
          <div>
            <label className="klabel">ភេទ</label>
            <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value as Profile['gender'] })} className="w-full">
              <option value="">—</option>
              <option value="male">👦 ប្រុស</option>
              <option value="female">👧 ស្រី</option>
              <option value="other">👶 ផ្សេងៗ</option>
            </select>
          </div>
          <div>
            <label className="klabel">ចំណាំ</label>
            <input value={profile.note || ''} onChange={e => setProfile({ ...profile, note: e.target.value })} className="w-full" placeholder="ព័ត៌មានបន្ថែម..." />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} className="btn btn-primary flex-1">
            <SaveIcon /> រក្សាទុក
          </button>
          <button onClick={onClose} className="btn btn-outline flex-1">❌ បោះបង់</button>
          {profileToEdit && onDelete && (
            <button onClick={handleDelete} className="btn btn-ghost !text-red-500 hover:!bg-red-500/10" title="Delete Profile">
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditorModal;