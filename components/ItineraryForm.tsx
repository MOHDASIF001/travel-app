
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Save, Plus, Trash2, Hotel as HotelIcon, List, DollarSign, FileText, CheckCircle2, Star, Image as ImageIcon, MapPin, Tag, Calendar, ArrowRight, X, Upload, ImagePlus, LayoutTemplate, Navigation2, Clock } from 'lucide-react';
import { Button } from './Button';
import { ItineraryData, DayPlan, Hotel, ItineraryHotel, Branding } from '../types';

interface ItineraryFormProps {
  initialData: ItineraryData;
  masterHotels: Hotel[];
  branding: Branding;
  onSave: (data: ItineraryData) => void;
  onCancel: () => void;
}

export const ItineraryForm: React.FC<ItineraryFormProps> = ({ initialData, masterHotels, branding, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ItineraryData>(initialData);
  const [newEntry, setNewEntry] = useState({ type: '', text: '' });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Refs for file inputs
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffNights = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      };

      const durationStr = `${diffNights}N / ${diffNights + 1}D`;
      const travelPeriodStr = `${formatDate(startDate)} to ${formatDate(endDate)}`;

      setFormData(prev => ({
        ...prev,
        duration: durationStr,
        travelDates: travelPeriodStr
      }));
    }
  }, [startDate, endDate]);

  // AUTOMATIC CALCULATION LOGIC FOR COSTING - FIXED
  useEffect(() => {
    const {
      adults,
      children,
      perAdultPrice,
      perChildPrice,
      extraBeds,
      extraBedPrice,
      cnbCount,
      cnbPrice
    } = formData.pricing;

    // Improved price parser: handles "5,000/-", "Rs. 2000", "1500" etc.
    const parsePrice = (priceStr: string | undefined): number => {
      if (!priceStr || typeof priceStr !== 'string') return 0;
      const numericPart = priceStr.replace(/[^0-9]/g, '');
      return parseInt(numericPart, 10) || 0;
    };

    const adultPriceValue = parsePrice(perAdultPrice);
    const childPriceValue = parsePrice(perChildPrice);
    const exBedPriceValue = parsePrice(extraBedPrice);
    const cnbPriceValue = parsePrice(cnbPrice);

    const calculatedTotalPax = (Number(adults) || 0) + (Number(children) || 0);

    // Total = (Adults * Price) + (Children * Price) + (ExtraBeds * Price) + (CNB * Price)
    const calculatedTotalPrice =
      ((Number(adults) || 0) * adultPriceValue) +
      ((Number(children) || 0) * childPriceValue) +
      ((Number(extraBeds) || 0) * exBedPriceValue) +
      ((Number(cnbCount) || 0) * cnbPriceValue);

    // Format back to INR standard currency string
    const formattedTotal = calculatedTotalPrice > 0
      ? new Intl.NumberFormat('en-IN').format(calculatedTotalPrice) + "/-"
      : formData.pricing.totalCost;

    // Only update state if values differ to prevent infinite loop
    if (
      calculatedTotalPax !== formData.pricing.totalPax ||
      (calculatedTotalPrice > 0 && formattedTotal !== formData.pricing.totalCost)
    ) {
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          totalPax: calculatedTotalPax,
          totalCost: calculatedTotalPrice > 0 ? formattedTotal : prev.pricing.totalCost
        }
      }));
    }
  }, [
    formData.pricing.adults,
    formData.pricing.children,
    formData.pricing.perAdultPrice,
    formData.pricing.perChildPrice,
    formData.pricing.extraBeds,
    formData.pricing.extraBedPrice,
    formData.pricing.cnbCount,
    formData.pricing.cnbPrice
  ]);

  const steps = [
    { id: 1, title: 'Details', icon: <FileText className="w-4 h-4" /> },
    { id: 2, title: 'Visuals', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 3, title: 'Plan', icon: <List className="w-4 h-4" /> },
    { id: 4, title: 'Hotels', icon: <HotelIcon className="w-4 h-4" /> },
    { id: 5, title: 'Costing', icon: <DollarSign className="w-4 h-4" /> },
    { id: 6, title: 'Inclusions', icon: <List className="w-4 h-4" /> },
    { id: 7, title: 'Policies', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newImages = [...formData.coverImages];
        newImages[index] = base64String;
        updateField('coverImages', newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleHotelSelection = (hotel: Hotel) => {
    setFormData(prev => {
      const exists = prev.selectedHotels.find(h => h.id === hotel.id);
      if (exists) {
        return { ...prev, selectedHotels: prev.selectedHotels.filter(h => h.id !== hotel.id) };
      } else {
        return { ...prev, selectedHotels: [...prev.selectedHotels, { ...hotel, isSelected: true }] };
      }
    });
  };

  const addListEntry = (field: keyof Pick<ItineraryData, 'inclusions' | 'exclusions' | 'supplementCosts' | 'terms' | 'cancellationPolicy'>) => {
    if (!newEntry.text.trim()) return;
    setFormData(prev => ({ ...prev, [field]: [...prev[field], newEntry.text] }));
    setNewEntry({ type: '', text: '' });
  };

  const calculateDateForDay = (index: number) => {
    if (!startDate) return "";
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);
    return date.toISOString().split('T')[0];
  };

  const getDayDateLabel = (index: number, manualDate?: string) => {
    const activeDate = manualDate || calculateDateForDay(index);
    if (!activeDate) return `Day ${String(index + 1).padStart(2, '0')}`;
    const date = new Date(activeDate);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const loadTemplateToDay = (dayId: string, templateId: string) => {
    const template = branding.savedDayTemplates.find(t => t.id === templateId);
    if (!template) return;
    updateField('days', formData.days.map(d => d.id === dayId ? {
      ...d,
      title: template.title,
      description: template.description,
      distance: template.distance || '',
      travelTime: template.travelTime || ''
    } : d));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Name</label>
                <input type="text" value={formData.clientName} onChange={e => updateField('clientName', e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl text-slate-900 font-black outline-none focus:border-rose-500" placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Package Name</label>
                <input type="text" value={formData.packageName} onChange={e => updateField('packageName', e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl text-slate-900 font-black outline-none focus:border-rose-500 uppercase" placeholder="e.g. MAGNIFICENT KASHMIR" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-3 h-3" /> Package Category
                </label>
                <select
                  value={formData.packageType}
                  onChange={e => updateField('packageType', e.target.value)}
                  className="w-full p-4 border-2 border-slate-100 rounded-2xl text-slate-900 font-black outline-none focus:border-rose-500 bg-slate-50 uppercase"
                >
                  <option value="">Select Category</option>
                  {branding.packageCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration (Auto-calculated)</label>
                <input type="text" value={formData.duration} onChange={e => updateField('duration', e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl text-slate-900 font-black outline-none focus:border-rose-500 bg-slate-50" placeholder="e.g. 4N / 5D" />
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[3px]">Travel window</label>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => { setStartDate(''); setEndDate(''); updateField('duration', ''); updateField('travelDates', ''); }}
                      className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-1 hover:underline"
                    >
                      <X className="w-3 h-3" /> Clear Dates
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row border-4 border-slate-900 rounded-[40px] overflow-hidden bg-white shadow-2xl relative">
                  <div className="flex-1 p-8 border-b-2 md:border-b-0 md:border-r-2 border-slate-100 hover:bg-slate-50 transition-colors relative">
                    <div className="flex items-center gap-3 mb-4 pointer-events-none">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departure Date</span>
                    </div>
                    <input
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={e => {
                        setStartDate(e.target.value);
                        if (!endDate || e.target.value > endDate) setEndDate('');
                      }}
                      className="w-full bg-transparent text-3xl font-black text-slate-900 uppercase tracking-tighter outline-none cursor-pointer"
                      style={{ colorScheme: 'light' }}
                    />
                  </div>

                  <div className="flex-1 p-8 hover:bg-slate-50 transition-colors relative">
                    <div className="flex items-center gap-3 mb-4 pointer-events-none">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Return Date</span>
                    </div>
                    <input
                      type="date"
                      min={startDate || today}
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full bg-transparent text-3xl font-black text-slate-900 uppercase tracking-tighter outline-none cursor-pointer"
                      style={{ colorScheme: 'light' }}
                    />
                  </div>

                  <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-900 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl border-4 border-white whitespace-nowrap pointer-events-none">
                    {formData.duration ? formData.duration.split(' / ')[0] : '0 Nights'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">Cover Images (Upload 4 Photos)</label>
                <span className="text-[9px] font-bold text-slate-300 uppercase italic">Tap any slot to upload</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {formData.coverImages.map((img, i) => (
                  <div key={i} className="space-y-4">
                    <div
                      onClick={() => fileInputRefs[i].current?.click()}
                      className={`relative aspect-[3/4] rounded-[32px] overflow-hidden border-4 cursor-pointer group transition-all duration-500 ${img ? 'border-white shadow-xl scale-100 hover:scale-[1.02]' : 'border-dashed border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200'}`}
                    >
                      {img ? (
                        <>
                          <img src={img} alt={`Cover ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                            <Upload className="w-8 h-8 mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Replace Photo</span>
                          </div>
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-black text-slate-900 uppercase">
                            Slot {i + 1}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                          <ImagePlus className="w-10 h-10 mb-3 group-hover:text-rose-400" />
                          <span className="text-[10px] font-black uppercase tracking-tighter">Add Photo</span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRefs[i]}
                        onChange={(e) => handleImageUpload(i, e)}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">Marketing Overview</label>
                {branding.savedOverviews && branding.savedOverviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Load Template:</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) updateField('overview', e.target.value);
                      }}
                      className="text-[8px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-rose-500 cursor-pointer shadow-sm"
                    >
                      <option value="">-- Choose --</option>
                      {branding.savedOverviews.map((ov: any, i) => (
                        <option key={i} value={typeof ov === 'string' ? ov : ov.content}>
                          {typeof ov === 'string' ? (ov.length > 30 ? ov.substring(0, 30) + '...' : ov) : ov.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="relative">
                <textarea
                  rows={6}
                  value={formData.overview}
                  onChange={e => updateField('overview', e.target.value)}
                  className="w-full p-8 border-2 border-slate-100 rounded-[40px] outline-none focus:border-rose-500 resize-none text-slate-900 font-medium leading-relaxed bg-slate-50 shadow-inner"
                  placeholder="Write a welcoming summary that captures the traveler's imagination..."
                />
                <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Professional Copywriting Recommended</div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center border-b-2 border-slate-100 pb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Day-Wise Plan</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mt-1">Schedule your itinerary timeline</p>
              </div>
              <Button onClick={() => setFormData({ ...formData, days: [...formData.days, { id: Date.now().toString(), title: '', description: '', distance: '', travelTime: '' }] })} variant="secondary" size="sm" className="gap-2 rounded-2xl h-12 px-6"><Plus className="w-4 h-4" /> Add Next Day</Button>
            </div>

            <div className="space-y-10">
              {formData.days.map((day, idx) => (
                <div key={day.id} className="group relative flex gap-8 items-start">
                  <div className="flex flex-col items-center shrink-0 w-24">
                    <div className="relative w-20 aspect-square rounded-[24px] bg-slate-900 flex flex-col items-center justify-center overflow-hidden shadow-2xl border-4 border-white transition-transform group-hover:scale-110">
                      <div className="absolute top-0 left-0 right-0 h-6 bg-rose-600 flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-white" />
                      </div>
                      <div className="mt-4 flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          {getDayDateLabel(idx, day.date).includes('Day') ? 'Day' : 'OCT'}
                        </span>
                        <span className="text-2xl font-black text-white leading-none">
                          {getDayDateLabel(idx, day.date).split(' ')[0]}
                        </span>
                        {!getDayDateLabel(idx, day.date).includes('Day') && (
                          <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest leading-none mt-1">
                            {getDayDateLabel(idx, day.date).split(' ')[1]}
                          </span>
                        )}
                      </div>
                    </div>
                    {idx < formData.days.length - 1 && (
                      <div className="w-1 bg-slate-200 h-24 my-2 rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 p-8 bg-slate-50 border-2 border-slate-100 rounded-[40px] relative transition-all group-hover:border-rose-200 group-hover:bg-white group-hover:shadow-xl">
                    <button onClick={() => updateField('days', formData.days.filter(d => d.id !== day.id))} className="absolute top-6 right-8 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-rose-500">
                          <LayoutTemplate className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Load Master Template:</span>
                        </div>
                        <select
                          onChange={(e) => loadTemplateToDay(day.id, e.target.value)}
                          className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-lg px-3 py-1 outline-none focus:border-rose-500 cursor-pointer shadow-sm"
                        >
                          <option value="">-- Choose Template --</option>
                          {branding.savedDayTemplates.map(t => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                        <div className="flex-1 w-full">
                          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Activity Title</span>
                          <input
                            type="text"
                            value={day.title}
                            onChange={e => updateField('days', formData.days.map(d => d.id === day.id ? { ...d, title: e.target.value } : d))}
                            className="w-full bg-transparent border-b-2 border-slate-100 py-2 font-black text-xl text-slate-900 outline-none focus:border-rose-500 transition-all uppercase tracking-tighter"
                            placeholder="e.g. Arrival at Srinagar & Local Sightseeing"
                          />
                        </div>

                        <label className="shrink-0 group/date bg-white border-2 border-slate-100 px-4 py-2 rounded-2xl flex items-center gap-3 hover:border-rose-400 hover:bg-rose-50 transition-all shadow-sm cursor-pointer relative overflow-hidden">
                          <Calendar className="w-4 h-4 text-rose-500" />
                          <div className="flex flex-col">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Schedule Date</label>
                            <input
                              type="date"
                              min={startDate || today}
                              max={endDate || undefined}
                              value={day.date || calculateDateForDay(idx)}
                              onChange={e => {
                                const newDate = e.target.value;
                                if (idx === 0) setStartDate(newDate);
                                updateField('days', formData.days.map(d => d.id === day.id ? { ...d, date: newDate } : d));
                              }}
                              className="bg-transparent text-xs font-black text-slate-900 outline-none cursor-pointer uppercase w-full"
                              style={{ colorScheme: 'light' }}
                            />
                          </div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <Navigation2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={day.distance || ''}
                            onChange={e => updateField('days', formData.days.map(d => d.id === day.id ? { ...d, distance: e.target.value } : d))}
                            className="w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500 focus:bg-white transition-all text-sm"
                            placeholder="Distance (e.g. 50 km)"
                          />
                        </div>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={day.travelTime || ''}
                            onChange={e => updateField('days', formData.days.map(d => d.id === day.id ? { ...d, travelTime: e.target.value } : d))}
                            className="w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500 focus:bg-white transition-all text-sm"
                            placeholder="Travel Duration (e.g. 2 hours)"
                          />
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        value={day.description}
                        onChange={e => updateField('days', formData.days.map(d => d.id === day.id ? { ...d, description: e.target.value } : d))}
                        className="w-full p-6 border-2 border-white rounded-[24px] bg-white/50 text-slate-900 font-medium leading-relaxed outline-none focus:border-rose-500 focus:bg-white shadow-inner transition-all"
                        placeholder="Describe the day's adventure, sightseeings, and highlights..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Select Registered Hotels</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Master Repository</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {masterHotels.map(hotel => {
                const isSelected = formData.selectedHotels.some(h => h.id === hotel.id);
                return (
                  <div key={hotel.id}
                    onClick={() => toggleHotelSelection(hotel)}
                    className={`p-4 border-2 rounded-[40px] cursor-pointer transition-all flex flex-col gap-5 relative overflow-hidden group ${isSelected ? 'border-rose-500 bg-rose-50 shadow-2xl scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-rose-500 text-white p-3 rounded-bl-[20px] z-10 shadow-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}

                    <div className="h-48 rounded-[30px] bg-slate-100 overflow-hidden relative shadow-inner">
                      {hotel.images && hotel.images[0] ? (
                        <img src={hotel.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={hotel.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-slate-200" /></div>
                      )}
                    </div>

                    <div className="px-3 pb-2 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <h4 className="font-black text-slate-900 uppercase text-base leading-tight line-clamp-2 flex-1 group-hover:text-rose-600 transition-colors">
                          {hotel.name}
                        </h4>
                        <div className="flex shrink-0 gap-0.5 pt-1">
                          {[...Array(hotel.stars)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="mt-auto flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{hotel.category}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Total adults</label>
                  <input type="number" min="0" value={formData.pricing.adults} onChange={e => updateField('pricing', { ...formData.pricing, adults: parseInt(e.target.value) || 0 })} className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-white font-black text-3xl outline-none focus:bg-white/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Total child</label>
                  <input type="number" min="0" value={formData.pricing.children} onChange={e => updateField('pricing', { ...formData.pricing, children: parseInt(e.target.value) || 0 })} className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-white font-black text-3xl outline-none focus:bg-white/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Total PAX (Auto)</label>
                  <div className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white/50 font-black text-3xl cursor-not-allowed">
                    {formData.pricing.totalPax}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Per adult price</label>
                  <input type="text" value={formData.pricing.perAdultPrice} onChange={e => updateField('pricing', { ...formData.pricing, perAdultPrice: e.target.value })} className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-white font-black text-3xl outline-none focus:bg-white/20 transition-all" placeholder="e.g. 5,000/-" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Per child price</label>
                  <input type="text" value={formData.pricing.perChildPrice} onChange={e => updateField('pricing', { ...formData.pricing, perChildPrice: e.target.value })} className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-white font-black text-3xl outline-none focus:bg-white/20 transition-all" placeholder="e.g. 2,500/-" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">No. of Rooms</label>
                  <input type="number" min="0" value={formData.pricing.rooms} onChange={e => updateField('pricing', { ...formData.pricing, rooms: parseInt(e.target.value) || 0 })} className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-white font-black text-3xl outline-none focus:bg-white/20 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">No. extra bed</label>
                  <input type="number" min="0" value={formData.pricing.extraBeds} onChange={e => updateField('pricing', { ...formData.pricing, extraBeds: parseInt(e.target.value) || 0 })} className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-white font-black text-3xl outline-none focus:bg-white/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Extra bed Cost</label>
                  <input type="text" value={formData.pricing.extraBedPrice} onChange={e => updateField('pricing', { ...formData.pricing, extraBedPrice: e.target.value })} className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-white font-black text-3xl outline-none focus:bg-white/20 transition-all" placeholder="e.g. 1,500/-" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">No of CNB</label>
                  <input type="number" min="0" value={formData.pricing.cnbCount} onChange={e => updateField('pricing', { ...formData.pricing, cnbCount: parseInt(e.target.value) || 0 })} className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-white font-black text-3xl outline-none focus:bg-white/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">CNB Cost</label>
                  <input type="text" value={formData.pricing.cnbPrice} onChange={e => updateField('pricing', { ...formData.pricing, cnbPrice: e.target.value })} className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-white font-black text-3xl outline-none focus:bg-white/20 transition-all" placeholder="e.g. 1,000/-" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Total price (Calculated)</label>
                  <input type="text" value={formData.pricing.totalCost} onChange={e => updateField('pricing', { ...formData.pricing, totalCost: e.target.value })} className="w-full bg-rose-600/20 border-2 border-rose-500/40 rounded-2xl p-4 text-rose-100 font-black text-3xl outline-none focus:bg-rose-500/30 transition-all" placeholder="e.g. 45,000/-" />
                </div>
              </div>
            </div>
            <div className="bg-white p-10 rounded-[40px] border-2 border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-black text-slate-900 uppercase tracking-[4px] text-xs">Night Breakup Schedule</h4>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => updateField('pricing', { ...formData.pricing, nightBreakup: [...formData.pricing.nightBreakup, { destination: '', nights: 1 }] })}>+ Add Route Point</Button>
              </div>
              <div className="space-y-4">
                {formData.pricing.nightBreakup.map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-center bg-slate-50 p-4 rounded-3xl border-2 border-slate-100">
                    <input type="text" value={item.destination} onChange={e => {
                      const nb = [...formData.pricing.nightBreakup];
                      nb[idx].destination = e.target.value;
                      updateField('pricing', { ...formData.pricing, nightBreakup: nb });
                    }} className="flex-1 bg-white border-2 border-slate-100 p-4 rounded-2xl font-black text-slate-900 outline-none focus:border-rose-500" placeholder="Destination Name" />
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nights</span>
                      <input type="number" value={item.nights} onChange={e => {
                        const nb = [...formData.pricing.nightBreakup];
                        nb[idx].nights = parseInt(e.target.value);
                        updateField('pricing', { ...formData.pricing, nightBreakup: nb });
                      }} className="w-24 bg-white border-2 border-slate-100 p-4 rounded-2xl text-center font-black text-slate-900 outline-none focus:border-rose-500" />
                    </div>
                    <button onClick={() => updateField('pricing', { ...formData.pricing, nightBreakup: formData.pricing.nightBreakup.filter((_, i) => i !== idx) })} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-6 h-6" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4">
            {(['inclusions', 'exclusions', 'supplementCosts'] as const).map(key => (
              <div key={key} className="space-y-6 bg-slate-50 p-8 rounded-[40px] border-2 border-slate-100">
                <h4 className="font-black text-slate-900 uppercase tracking-[4px] text-xs border-b-2 border-slate-200 pb-4 capitalize">{key.replace('Costs', 's')}</h4>
                <div className="flex gap-3">
                  <input type="text" placeholder={`Add ${key}...`} className="flex-1 p-4 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold bg-white outline-none focus:border-rose-500"
                    value={newEntry.type === key ? newEntry.text : ''}
                    onChange={e => setNewEntry({ type: key, text: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && addListEntry(key)}
                  />
                  <Button onClick={() => addListEntry(key)} className="rounded-2xl shrink-0 h-14 px-6"><Plus className="w-5 h-5" /></Button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {formData[key].map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-4 p-4 bg-white rounded-2xl border-2 border-slate-100 group shadow-sm">
                      <span className="text-xs font-bold text-slate-700 leading-relaxed flex-1">{item}</span>
                      <button onClick={() => updateField(key, formData[key].filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 7:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4">
            {(['terms', 'cancellationPolicy'] as const).map(key => (
              <div key={key} className="space-y-6 bg-slate-50 p-8 rounded-[40px] border-2 border-slate-100">
                <h4 className="font-black text-slate-900 uppercase tracking-[4px] text-xs border-b-2 border-slate-200 pb-4 capitalize">{key.replace('cancellation', 'Cancel')}</h4>
                <div className="flex gap-3">
                  <input type="text" placeholder={`Add to ${key}...`} className="flex-1 p-4 border-2 border-slate-100 rounded-2xl text-slate-900 font-bold bg-white outline-none focus:border-rose-500"
                    value={newEntry.type === key ? newEntry.text : ''}
                    onChange={e => setNewEntry({ type: key, text: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && addListEntry(key)}
                  />
                  <Button onClick={() => addListEntry(key)} className="rounded-2xl shrink-0 h-14 px-6"><Plus className="w-5 h-5" /></Button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {formData[key].map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-4 p-4 bg-white rounded-2xl border-2 border-slate-100 group shadow-sm">
                      <span className="text-[10px] font-bold text-slate-600 leading-relaxed flex-1">{item}</span>
                      <button onClick={() => updateField(key, formData[key].filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 no-print pb-32">
      <div className="bg-white rounded-[60px] shadow-2xl overflow-hidden border-2 border-slate-900">
        <div className="bg-slate-900 px-12 py-12 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Itinerary Studio</h2>
            <div className="flex items-center gap-4 mt-3">
              <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{formData.packageName || 'UNNAMED TRIP'}</span>
              <span className="text-white/40 text-[10px] font-black uppercase tracking-[4px]">Step {currentStep} of {steps.length}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel} className="bg-white/5 text-white border-white/10 hover:bg-white/20 px-8 h-14 rounded-2xl">Cancel</Button>
            <Button onClick={() => onSave(formData)} className="gap-3 h-14 px-10 shadow-2xl shadow-rose-900/50 rounded-2xl font-black uppercase tracking-tighter" style={{ backgroundColor: branding.primaryColor }}>
              <Save className="w-5 h-5" /> Commit & Render
            </Button>
          </div>
        </div>

        <div className="border-b-4 border-slate-900 bg-slate-50 px-12 py-8 flex items-center justify-between overflow-x-auto gap-8 no-scrollbar">
          {steps.map(step => (
            <div key={step.id} className="flex items-center gap-4 shrink-0">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-500 ${currentStep === step.id ? 'bg-slate-900 text-white shadow-2xl scale-110' : currentStep > step.id ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {currentStep > step.id ? <CheckCircle2 className="w-7 h-7" /> : step.id}
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === step.id ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</span>
                <span className={`text-[8px] font-bold uppercase opacity-40 ${currentStep === step.id ? 'block' : 'hidden'}`}>Configuring...</span>
              </div>
              {step.id < steps.length && <ChevronRight className="w-5 h-5 text-slate-200" />}
            </div>
          ))}
        </div>

        <div className="p-12 min-h-[550px] bg-white">
          {renderStep()}
        </div>

        <div className="p-12 bg-slate-50 border-t-4 border-slate-900 flex justify-between items-center">
          <Button variant="outline" disabled={currentStep === 1} onClick={() => setCurrentStep(prev => prev - 1)} className="gap-3 h-16 px-10 border-2 border-slate-200 text-slate-900 hover:bg-white rounded-3xl font-black uppercase tracking-widest">
            <ChevronLeft className="w-5 h-5" /> Back
          </Button>

          <div className="hidden lg:flex flex-col items-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[6px]">System Ready</div>
            <div className="w-64 h-3 bg-slate-200 rounded-full mt-4 overflow-hidden border-2 border-white shadow-inner">
              <div className="h-full bg-slate-900 transition-all duration-1000 ease-in-out shadow-lg" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
            </div>
          </div>

          {currentStep < steps.length ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)} className="gap-3 h-16 px-14 rounded-3xl shadow-xl font-black uppercase tracking-widest text-white" style={{ backgroundColor: branding.primaryColor }}>
              Continue <ChevronRight className="w-6 h-6" />
            </Button>
          ) : (
            <Button onClick={() => onSave(formData)} className="gap-3 h-16 px-14 shadow-2xl rounded-3xl font-black uppercase tracking-tighter text-white" style={{ backgroundColor: branding.primaryColor }}>
              Finalize <CheckCircle2 className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
