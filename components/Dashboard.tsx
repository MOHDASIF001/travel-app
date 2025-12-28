
import React from 'react';
import { Plus, Search, FileText, Eye, Pencil, Trash2, Calendar, User } from 'lucide-react';
import { Button } from './Button';
import { ItineraryData } from '../types';

interface DashboardProps {
  itineraries: ItineraryData[];
  onNew: () => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onDelete: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ itineraries, onNew, onEdit, onPreview, onDelete }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Itinerary Control Room</h1>
          <p className="text-slate-500 font-medium mt-1">Design, manage, and export premium tour packages</p>
        </div>
        <Button onClick={onNew} className="gap-2 h-14 px-8 text-lg shadow-xl shadow-rose-500/20">
          <Plus className="w-6 h-6" />
          Create New Trip
        </Button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by client or package..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 font-medium transition-all"
            />
          </div>
          <div className="flex gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <span className="bg-slate-200 px-3 py-1 rounded-full">{itineraries.length} Total Packages</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[2px]">
                <th className="px-8 py-5">Package Information</th>
                <th className="px-8 py-5">Client Details</th>
                <th className="px-8 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itineraries.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                       <FileText className="w-16 h-16 mb-4" />
                       <span className="text-xl font-bold">No itineraries found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                itineraries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{item.packageName || 'KASHMIR TOUR'}</div>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><Calendar className="w-3 h-3"/> {item.duration}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                             <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">{item.packageType}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-tight"><User className="w-4 h-4 text-slate-300"/> {item.clientName || 'Valued Client'}</span>
                        <span className="text-xs font-bold text-slate-400 mt-1">{item.travelDates}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => onPreview(item.id)} 
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-rose-600 transition-all"
                        >
                          <Eye className="w-4 h-4" /> Preview PDF
                        </button>
                        <button 
                          onClick={() => onEdit(item.id)} 
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" 
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => onDelete(item.id)} 
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
