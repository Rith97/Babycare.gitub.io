
import React, { useMemo } from 'react';
import { VaxInfo } from '../types';
import { VACCINE_SCHEDULE } from '../constants';
import { CheckIcon } from './icons';

interface VaccinationPanelProps {
  babyDob: string;
  completedVax: { [vaxKey: string]: string };
  onToggleVax: (vaxKey: string, date: string) => void;
}

const VaccinationPanel: React.FC<VaccinationPanelProps> = ({ babyDob, completedVax, onToggleVax }) => {

  const getBabyAgeInMonths = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += today.getMonth();
    return months <= 0 ? 0 : months;
  };

  const babyAgeMonths = useMemo(() => getBabyAgeInMonths(babyDob), [babyDob]);

  const categorizedVaccines = useMemo(() => {
    const upcoming: VaxInfo[] = [];
    const completed: VaxInfo[] = [];
    const missed: VaxInfo[] = [];

    VACCINE_SCHEDULE.forEach(vax => {
      if (completedVax[vax.key]) {
        completed.push(vax);
      } else if (babyAgeMonths > vax.age) {
        missed.push(vax);
      } else {
        upcoming.push(vax);
      }
    });

    return { upcoming, completed, missed };
  }, [babyAgeMonths, completedVax]);

  const VaxRow: React.FC<{ vax: VaxInfo, status: 'upcoming' | 'completed' | 'missed' }> = ({ vax, status }) => {
    const isCompleted = status === 'completed';
    const completionDate = completedVax[vax.key];
    const badgeClass = {
        upcoming: 'badge-primary',
        completed: 'badge-success',
        missed: 'badge-danger'
    }[status];

    return (
        <tr className={isCompleted ? 'opacity-60' : ''}>
            <td>
                <div className="font-bold">{vax.name}</div>
                <div className="text-xs text-gray-500">{vax.description}</div>
            </td>
            <td><span className={`badge ${badgeClass}`}>{vax.age} ខែ</span></td>
            <td>
                {completionDate ? 
                    new Date(completionDate).toLocaleDateString() : 
                    <span className="text-gray-400">—</span>
                }
            </td>
            <td>
                <button
                    onClick={() => onToggleVax(vax.key, new Date().toISOString().split('T')[0])}
                    className={`btn ${isCompleted ? 'btn-outline' : 'btn-success'}`}
                >
                    {isCompleted ? 'ยกเลิก' : <><CheckIcon /> បានចាក់រួច</>}
                </button>
            </td>
        </tr>
    );
  };


  return (
    <section className="card">
       <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl sm:text-2xl font-bold">💉 វ៉ាក់សាំង</h3>
        </div>
      </div>
      <div className="space-y-8">
        <div>
            <h4 className="text-xl font-semibold mb-3 text-indigo-500">Upcoming ({categorizedVaccines.upcoming.length})</h4>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead><tr><th>ឈ្មោះ</th><th>អាយុ</th><th>កាលបរិច្ឆេទចាក់</th><th>សកម្មភាព</th></tr></thead>
                    <tbody>
                        {categorizedVaccines.upcoming.map(vax => <VaxRow key={vax.key} vax={vax} status="upcoming"/>)}
                    </tbody>
                </table>
            </div>
        </div>
        <div>
            <h4 className="text-xl font-semibold mb-3 text-red-500">Missed ({categorizedVaccines.missed.length})</h4>
             <div className="overflow-x-auto">
                <table className="table">
                     <thead><tr><th>ឈ្មោះ</th><th>អាយុ</th><th>កាលបរិច្ឆេទចាក់</th><th>សកម្មភាព</th></tr></thead>
                    <tbody>
                        {categorizedVaccines.missed.map(vax => <VaxRow key={vax.key} vax={vax} status="missed"/>)}
                    </tbody>
                </table>
            </div>
        </div>
        <div>
            <h4 className="text-xl font-semibold mb-3 text-green-500">Completed ({categorizedVaccines.completed.length})</h4>
             <div className="overflow-x-auto">
                <table className="table">
                     <thead><tr><th>ឈ្មោះ</th><th>អាយុ</th><th>កាលបរិច្ឆេទចាក់</th><th>សកម្មភាព</th></tr></thead>
                    <tbody>
                        {categorizedVaccines.completed.map(vax => <VaxRow key={vax.key} vax={vax} status="completed"/>)}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </section>
  );
};

export default VaccinationPanel;