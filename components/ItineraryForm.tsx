
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
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  // Modal for Picking Master Images
  const [showMasterImgPicker, setShowMasterImgPicker] = useState<{ slot: number; open: boolean }>({ slot: 0, open: false });

  const today = new Date().toISOString().split('T')[0];


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

  const getDayDateLabel = (index: number, manualDate: string) => {
    if (!manualDate) return `Day ${String(index + 1).padStart(2, '0')}`;
    const date = new Date(manualDate);
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
          <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Name</label>
                <input type="text" value={formData.clientName} onChange={e => updateField('clientName', e.target.value)} className="w-full p-3 md:p-4 border-2 border-slate-100 rounded-xl md:rounded-2xl text-slate-900 font-black outline-none focus:border-rose-500" placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Package Name</label>
                <input type="text" value={formData.packageName} onChange={e => updateField('packageName', e.target.value)} className="w-full p-3 md:p-4 border-2 border-slate-100 rounded-xl md:rounded-2xl text-slate-900 font-black outline-none focus:border-rose-500 uppercase" placeholder="e.g. MAGNIFICENT KASHMIR" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-3 h-3" /> Package Category
                </label>
                <select
                  value={formData.packageType}
                  onChange={e => updateField('packageType', e.target.value)}
                  className="w-full p-3 md:p-4 border-2 border-slate-100 rounded-xl md:rounded-2xl text-slate-900 font-black outline-none focus:border-rose-500 bg-slate-50 uppercase"
                >
                  <option value="">Select Category</option>
                  {branding.packageCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration (Nights / Days)</label>
                <input type="text" value={formData.duration} onChange={e => updateField('duration', e.target.value)} className="w-full p-3 md:p-4 border-2 border-slate-100 rounded-xl md:rounded-2xl text-slate-900 font-black outline-none focus:border-rose-500" placeholder="e.g. 4N / 5D" />
              </div>

            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[4px]">Trip Cover Montage (4 Images)</label>
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-bold text-slate-300 uppercase italic">Click cards to select from Agency Master Gallery</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
                {[0, 1, 2, 3].map((slot) => (
                  <div key={slot} className="space-y-4">
                    <div
                      onClick={() => setShowMasterImgPicker({ slot, open: true })}
                      className={`relative aspect-video rounded-2xl md:rounded-[32px] overflow-hidden border-4 cursor-pointer group transition-all duration-500 ${formData.coverImages[slot] ? 'border-white shadow-xl' : 'border-dashed border-slate-200 bg-slate-50 hover:bg-rose-50'}`}
                    >
                      {formData.coverImages[slot] ? (
                        <>
                          <img src={formData.coverImages[slot]} alt={`Cover ${slot + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                            <span className="bg-white/20 hover:bg-white/40 backdrop-blur-md px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white border border-white/20 shadow-xl text-center">Change Photo</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 md:gap-3">
                          <Plus className="w-6 h-6 md:w-8 md:h-8 opacity-50 group-hover:text-rose-500 group-hover:scale-110 transition-all" />
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest group-hover:text-rose-500 transition-colors">Select From Master</span>
                          </div>
                        </div>
                      )}
                      {slot === 0 && (
                        <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-rose-500 text-white text-[6px] md:text-[7px] font-black uppercase px-2 py-1 rounded shadow-lg">Primary Image</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Master Image Picker Modal */}
            {showMasterImgPicker.open && (
              <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-8">
                <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border-4 border-slate-800">
                  <div className="p-8 border-b-2 border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Master Image Gallery</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px]">Select an official agency cover photo</p>
                    </div>
                    <button onClick={() => setShowMasterImgPicker({ ...showMasterImgPicker, open: false })} className="w-12 h-12 rounded-2xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-8 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-6 custom-scrollbar">
                    {branding.masterCoverImages?.length > 0 ? branding.masterCoverImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          const newImgs = [...formData.coverImages];
                          newImgs[showMasterImgPicker.slot] = img;
                          updateField('coverImages', newImgs);
                          setShowMasterImgPicker({ ...showMasterImgPicker, open: false });
                        }}
                        className="aspect-video rounded-2xl overflow-hidden cursor-pointer border-4 border-transparent hover:border-rose-500 transition-all group relative"
                      >
                        <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Master" />
                        <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100" />
                      </div>
                    )) : (
                      <div className="col-span-full py-20 text-center">
                        <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-sm uppercase">No Master Images Found. Add them in Settings.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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

            <div className="space-y-6 md:space-y-10">
              {formData.days.map((day, idx) => (
                <div key={day.id} className="group relative flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                  <div className="flex flex-row md:flex-col items-center shrink-0 w-full md:w-24 gap-4 md:gap-0">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-[24px] bg-slate-900 flex flex-col items-center justify-center overflow-hidden shadow-2xl border-4 border-white transition-transform group-hover:scale-110 shrink-0">
                      <div className="absolute top-0 left-0 right-0 h-4 md:h-6 bg-rose-600 flex items-center justify-center">
                        <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                      </div>
                      <div className="mt-3 md:mt-4 flex flex-col items-center">
                        <span className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          {getDayDateLabel(idx, day.date).includes('Day') ? 'Day' : 'OCT'}
                        </span>
                        <span className="text-xl md:text-2xl font-black text-white leading-none">
                          {getDayDateLabel(idx, day.date).split(' ')[0]}
                        </span>
                        {!getDayDateLabel(idx, day.date).includes('Day') && (
                          <span className="text-[6px] md:text-[8px] font-black text-rose-400 uppercase tracking-widest leading-none mt-1">
                            {getDayDateLabel(idx, day.date).split(' ')[1]}
                          </span>
                        )}
                      </div>
                    </div>
                    {idx < formData.days.length - 1 && (
                      <>
                        <div className="hidden md:block w-1 bg-slate-200 h-24 my-2 rounded-full"></div>
                        <div className="md:hidden flex-1 h-1 bg-slate-100 rounded-full"></div>
                      </>
                    )}
                  </div>

                  <div className="w-full flex-1 p-6 md:p-8 bg-slate-50 border-2 border-slate-100 rounded-[32px] md:rounded-[40px] relative transition-all group-hover:border-rose-200 group-hover:bg-white group-hover:shadow-xl">
                    <button onClick={(e) => { e.stopPropagation(); updateField('days', formData.days.filter(d => d.id !== day.id)); }} className="absolute top-4 md:top-6 right-4 md:right-8 text-slate-300 hover:text-red-500 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 z-30 p-2"><Trash2 className="w-5 h-5" /></button>

                    <div className="space-y-5">
                      <div className="w-full relative group/search">
                        <div className="flex items-center gap-2 text-rose-500 mb-2">
                          <LayoutTemplate className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Search Templates:</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Type to search templates..."
                            className="w-full p-2 pl-8 border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-rose-500 bg-white shadow-sm"
                            onChange={(e) => setTemplateSearchTerm(e.target.value.toLowerCase())}
                          />
                          <List className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                        </div>
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-900 rounded-2xl shadow-2xl z-[50] max-h-48 overflow-y-auto hidden group-focus-within/search:block no-scrollbar border-t-0 p-2 space-y-1">
                          {branding.savedDayTemplates.filter(t => t.title.toLowerCase().includes(templateSearchTerm)).length > 0 ? (
                            branding.savedDayTemplates.filter(t => t.title.toLowerCase().includes(templateSearchTerm)).map(t => (
                              <div
                                key={t.id}
                                onMouseDown={() => loadTemplateToDay(day.id, t.id)}
                                className="p-3 hover:bg-rose-50 rounded-xl cursor-pointer border-b border-slate-50 last:border-0"
                              >
                                <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{t.title}</div>
                                <div className="text-[8px] text-slate-400 line-clamp-1">{t.description}</div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-[10px] font-bold text-slate-400 text-center">No template found</div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                        <div className="flex-1 w-full">
                          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Activity Title</span>
                          <input
                            type="text"
                            value={day.title}
                            onChange={e => updateField('days', formData.days.map(d => d.id === day.id ? { ...d, title: e.target.value } : d))}
                            className="w-full bg-transparent border-b-2 border-slate-100 py-1 md:py-2 font-black text-lg md:text-xl text-slate-900 outline-none focus:border-rose-500 transition-all uppercase tracking-tighter"
                            placeholder="e.g. Arrival at Srinagar & Local Sightseeing"
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Schedule Date</label>
                          <input
                            type="date"
                            min={today}
                            value={day.date}
                            onChange={e => {
                              const newDate = e.target.value;
                              updateField('days', formData.days.map(d => d.id === day.id ? { ...d, date: newDate } : d));
                            }}
                            className="bg-transparent text-xs font-black text-slate-900 outline-none cursor-pointer uppercase w-full"
                            style={{ colorScheme: 'light' }}
                          />
                        </div>
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
                        className="w-full p-4 md:p-6 border-2 border-white rounded-2xl md:rounded-[24px] bg-white/50 text-slate-900 text-sm md:text-base font-medium leading-relaxed outline-none focus:border-rose-500 focus:bg-white shadow-inner transition-all"
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Select Registered Hotels</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">From Master Repository</p>
            </div>

            {/* Selected Hotels Summary - FIX FOR PHANTOM HOTELS */}
            {formData.selectedHotels.length > 0 && (
              <div className="bg-slate-900 p-6 md:p-8 rounded-[40px] shadow-2xl border-4 border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <HotelIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-white uppercase text-xs tracking-widest leading-none">Selected for this Trip</h4>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Total {formData.selectedHotels.length} Properties Bound</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {formData.selectedHotels.map(h => (
                    <div key={h.id} className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white/10 overflow-hidden shrink-0">
                        {h.images?.[0] ? <img src={h.images[0]} className="w-full h-full object-cover" alt="" /> : <HotelIcon className="w-full h-full p-2.5 text-white/20" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate max-w-[120px]">{h.name}</span>
                        <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">{h.category}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleHotelSelection(h); }}
                        className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
            <div className="bg-slate-900 p-6 md:p-10 rounded-[32px] md:rounded-[40px] text-white shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Total adults</label>
                  <input type="number" min="0" value={formData.pricing.adults} onChange={e => updateField('pricing', { ...formData.pricing, adults: parseInt(e.target.value) || 0 })} className="w-full bg-white/10 border-2 border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-white font-black text-xl md:text-3xl outline-none focus:bg-white/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Total child</label>
                  <input type="number" min="0" value={formData.pricing.children} onChange={e => updateField('pricing', { ...formData.pricing, children: parseInt(e.target.value) || 0 })} className="w-full bg-white/10 border-2 border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-white font-black text-xl md:text-3xl outline-none focus:bg-white/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Total PAX (Auto)</label>
                  <div className="w-full bg-white/5 border-2 border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-white/50 font-black text-xl md:text-3xl cursor-not-allowed">
                    {formData.pricing.totalPax}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Per adult price</label>
                  <input type="text" value={formData.pricing.perAdultPrice} onChange={e => updateField('pricing', { ...formData.pricing, perAdultPrice: e.target.value })} className="w-full bg-white/10 border-2 border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-white font-black text-xl md:text-3xl outline-none focus:bg-white/20 transition-all" placeholder="e.g. 5,000/-" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Per child price</label>
                  <input type="text" value={formData.pricing.perChildPrice} onChange={e => updateField('pricing', { ...formData.pricing, perChildPrice: e.target.value })} className="w-full bg-white/10 border-2 border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-white font-black text-xl md:text-3xl outline-none focus:bg-white/20 transition-all" placeholder="e.g. 2,500/-" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">No. of Rooms</label>
                  <input type="number" min="0" value={formData.pricing.rooms} onChange={e => updateField('pricing', { ...formData.pricing, rooms: parseInt(e.target.value) || 0 })} className="w-full bg-white/10 border-2 border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-white font-black text-xl md:text-3xl outline-none focus:bg-white/20 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">No. extra bed</label>
                  <input type="number" min="0" value={formData.pricing.extraBeds} onChange={e => updateField('pricing', { ...formData.pricing, extraBeds: parseInt(e.target.value) || 0 })} className="w-full bg-white/10 border-2 border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-white font-black text-xl md:text-3xl outline-none focus:bg-white/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Extra bed Cost</label>
                  <input type="text" value={formData.pricing.extraBedPrice} onChange={e => updateField('pricing', { ...formData.pricing, extraBedPrice: e.target.value })} className="w-full bg-white/10 border-2 border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-white font-black text-xl md:text-3xl outline-none focus:bg-white/20 transition-all" placeholder="e.g. 1,500/-" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">No of CNB</label>
                  <input type="number" min="0" value={formData.pricing.cnbCount} onChange={e => updateField('pricing', { ...formData.pricing, cnbCount: parseInt(e.target.value) || 0 })} className="w-full bg-white/10 border-2 border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-white font-black text-xl md:text-3xl outline-none focus:bg-white/20 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">CNB Cost</label>
                  <input type="text" value={formData.pricing.cnbPrice} onChange={e => updateField('pricing', { ...formData.pricing, cnbPrice: e.target.value })} className="w-full bg-white/10 border-2 border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-white font-black text-xl md:text-3xl outline-none focus:bg-white/20 transition-all" placeholder="e.g. 1,000/-" />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Room Type Selection</label>
                  <select
                    value={formData.pricing.roomType}
                    onChange={e => updateField('pricing', { ...formData.pricing, roomType: e.target.value })}
                    className="w-full bg-slate-800 border-2 border-white/20 rounded-xl md:rounded-2xl p-3 md:p-4 text-white font-black text-xl md:text-3xl outline-none focus:border-rose-500 transition-all uppercase"
                  >
                    <option value="">-- Select Master Room Type --</option>
                    {branding.roomTypes?.map(type => (
                      <option key={type} value={type} className="text-slate-900 bg-white">{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2 md:col-span-3">
                  <label className="text-[10px] font-black uppercase opacity-60 tracking-widest">Total price (Calculated)</label>
                  <input type="text" value={formData.pricing.totalCost} onChange={e => updateField('pricing', { ...formData.pricing, totalCost: e.target.value })} className="w-full bg-rose-600/20 border-2 border-rose-500/40 rounded-xl md:rounded-2xl p-3 md:p-4 text-rose-100 font-black text-xl md:text-3xl outline-none focus:bg-rose-500/30 transition-all" placeholder="e.g. 45,000/-" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border-2 border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h4 className="font-black text-slate-900 uppercase tracking-[2px] md:tracking-[4px] text-[10px] md:text-xs">Night Breakup Schedule</h4>
                <Button size="sm" variant="outline" className="rounded-xl w-full sm:w-auto" onClick={() => updateField('pricing', { ...formData.pricing, nightBreakup: [...formData.pricing.nightBreakup, { destination: '', nights: 1 }] })}>+ Add Route Point</Button>
              </div>
              <div className="space-y-4">
                {formData.pricing.nightBreakup.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center bg-slate-50 p-4 rounded-2xl md:rounded-3xl border-2 border-slate-100">
                    <input type="text" value={item.destination} onChange={e => {
                      const nb = [...formData.pricing.nightBreakup];
                      nb[idx].destination = e.target.value;
                      updateField('pricing', { ...formData.pricing, nightBreakup: nb });
                    }} className="flex-1 bg-white border-2 border-slate-100 p-3 md:p-4 rounded-xl md:rounded-2xl font-black text-slate-900 outline-none focus:border-rose-500 text-sm md:text-base" placeholder="Destination Name" />
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nights</span>
                      <input type="number" value={item.nights} onChange={e => {
                        const nb = [...formData.pricing.nightBreakup];
                        nb[idx].nights = parseInt(e.target.value);
                        updateField('pricing', { ...formData.pricing, nightBreakup: nb });
                      }} className="w-20 md:w-24 bg-white border-2 border-slate-100 p-3 md:p-4 rounded-xl md:rounded-2xl text-center font-black text-slate-900 outline-none focus:border-rose-500" />
                      <button onClick={() => updateField('pricing', { ...formData.pricing, nightBreakup: formData.pricing.nightBreakup.filter((_, i) => i !== idx) })} className="sm:hidden text-red-500 p-2"><Trash2 className="w-5 h-5" /></button>
                    </div>
                    <button onClick={() => updateField('pricing', { ...formData.pricing, nightBreakup: formData.pricing.nightBreakup.filter((_, i) => i !== idx) })} className="hidden sm:block text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-6 h-6" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 animate-in fade-in slide-in-from-right-4">
            {(['inclusions', 'exclusions', 'supplementCosts'] as const).map(key => (
              <div key={key} className="space-y-6 bg-slate-50 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-2 border-slate-100">
                <h4 className="font-black text-slate-900 uppercase tracking-[2px] md:tracking-[4px] text-[10px] md:text-xs border-b-2 border-slate-200 pb-4 capitalize flex items-center justify-between">
                  {key.replace('Costs', 's')}
                  <button
                    onClick={() => {
                      const defaults = key === 'inclusions' ? branding.defaultInclusions : key === 'exclusions' ? branding.defaultExclusions : branding.defaultSupplementCosts;
                      if (defaults) updateField(key, [...formData[key], ...defaults]);
                    }}
                    className="text-[7px] md:text-[8px] bg-rose-500 text-white px-2 md:px-3 py-1 rounded-full hover:bg-rose-600 transition-colors"
                  >
                    + Load Defaults
                  </button>
                </h4>
                <div className="flex gap-2 md:gap-3">
                  <input type="text" placeholder={`Add ${key}...`} className="flex-1 p-3 md:p-4 border-2 border-slate-100 rounded-xl md:rounded-2xl text-slate-900 font-bold bg-white outline-none focus:border-rose-500 text-xs md:text-base"
                    value={newEntry.type === key ? newEntry.text : ''}
                    onChange={e => setNewEntry({ type: key, text: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && addListEntry(key)}
                  />
                  <Button onClick={() => addListEntry(key)} className="rounded-xl md:rounded-2xl shrink-0 h-12 md:h-14 px-4 md:px-6"><Plus className="w-5 h-5" /></Button>
                </div>
                <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {formData[key].map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-4 p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border-2 border-slate-100 group shadow-sm">
                      <span className="text-[10px] md:text-xs font-bold text-slate-700 leading-relaxed flex-1">{item}</span>
                      <button onClick={() => updateField(key, formData[key].filter((_, idx) => idx !== i))} className="opacity-100 md:opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      case 7:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 animate-in fade-in slide-in-from-right-4">
            {(['terms', 'cancellationPolicy'] as const).map(key => (
              <div key={key} className="space-y-6 bg-slate-50 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-2 border-slate-100">
                <h4 className="font-black text-slate-900 uppercase tracking-[2px] md:tracking-[4px] text-[10px] md:text-xs border-b-2 border-slate-200 pb-4 capitalize">{key.replace('cancellation', 'Cancel')}</h4>
                <div className="flex gap-2 md:gap-3">
                  <input type="text" placeholder={`Add to ${key}...`} className="flex-1 p-3 md:p-4 border-2 border-slate-100 rounded-xl md:rounded-2xl text-slate-900 font-bold bg-white outline-none focus:border-rose-500 text-xs md:text-base"
                    value={newEntry.type === key ? newEntry.text : ''}
                    onChange={e => setNewEntry({ type: key, text: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && addListEntry(key)}
                  />
                  <Button onClick={() => addListEntry(key)} className="rounded-xl md:rounded-2xl shrink-0 h-12 md:h-14 px-4 md:px-6"><Plus className="w-5 h-5" /></Button>
                </div>
                <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {formData[key].map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-4 p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border-2 border-slate-100 group shadow-sm">
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-600 leading-relaxed flex-1">{item}</span>
                      <button onClick={() => updateField(key, formData[key].filter((_, idx) => idx !== i))} className="opacity-100 md:opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
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
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 no-print pb-32">
      <div className="bg-white rounded-[32px] md:rounded-[60px] shadow-2xl overflow-hidden border-2 border-slate-900 w-full mx-auto">
        <div className="bg-slate-900 px-6 md:px-8 lg:px-12 py-8 md:py-10 lg:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl lg:text-4xl font-black text-white uppercase tracking-tighter">Itinerary Studio</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
              <span className="bg-rose-600 text-white text-[8px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{formData.packageName || 'UNNAMED TRIP'}</span>
              <span className="text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-[4px]">Step {currentStep} of {steps.length}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto shrink-0">
            <Button variant="outline" onClick={onCancel} className="bg-white/5 text-white border-white/10 hover:bg-white/20 px-4 md:px-6 h-10 md:h-12 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest w-full sm:w-auto">Cancel</Button>
            <Button onClick={() => onSave(formData)} className="gap-2 h-10 md:h-12 px-6 md:px-8 shadow-2xl shadow-rose-900/50 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-tighter w-full sm:w-auto whitespace-nowrap" style={{ backgroundColor: branding.primaryColor }}>
              <Save className="w-4 h-4 md:w-5 h-5" /> Commit & Render
            </Button>
          </div>
        </div>

        <div className="border-b-4 border-slate-900 bg-slate-50 px-4 md:px-6 lg:px-12 py-4 md:py-6 lg:py-8 flex items-center justify-start md:justify-center lg:justify-between overflow-x-auto gap-4 md:gap-6 lg:gap-8 no-scrollbar">
          {steps.map(step => (
            <div key={step.id} className="flex items-center gap-3 md:gap-4 shrink-0">
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-sm md:text-lg transition-all duration-500 ${currentStep === step.id ? 'bg-slate-900 text-white shadow-2xl scale-110' : currentStep > step.id ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {currentStep > step.id ? <CheckCircle2 className="w-5 h-5 md:w-7 md:h-7" /> : step.id}
              </div>
              <div className="flex flex-col">
                <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${currentStep === step.id ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</span>
                <span className={`text-[7px] md:text-[8px] font-bold uppercase opacity-40 ${currentStep === step.id ? 'block' : 'hidden'}`}>Configuring...</span>
              </div>
              {step.id < steps.length && <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-200" />}
            </div>
          ))}
        </div>

        <div className="p-6 md:p-12 min-h-[400px] md:min-h-[550px] bg-white">
          {renderStep()}
        </div>

        <div className="p-6 md:p-12 bg-slate-50 border-t-4 border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6">
          <Button variant="outline" disabled={currentStep === 1} onClick={() => setCurrentStep(prev => prev - 1)} className="gap-3 h-14 md:h-16 px-8 md:px-10 border-2 border-slate-200 text-slate-900 hover:bg-white rounded-2xl md:rounded-3xl font-black uppercase tracking-widest w-full sm:w-auto order-2 sm:order-1">
            <ChevronLeft className="w-5 h-5" /> Back
          </Button>

          <div className="hidden lg:flex flex-col items-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[6px]">System Ready</div>
            <div className="w-64 h-3 bg-slate-200 rounded-full mt-4 overflow-hidden border-2 border-white shadow-inner">
              <div className="h-full bg-slate-900 transition-all duration-1000 ease-in-out shadow-lg" style={{ width: `${(currentStep / steps.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="w-full sm:w-auto order-1 sm:order-3">
            {currentStep < steps.length ? (
              <Button onClick={() => setCurrentStep(prev => prev + 1)} className="gap-3 h-14 md:h-16 px-10 md:px-14 rounded-2xl md:rounded-3xl shadow-xl font-black uppercase tracking-widest text-white w-full sm:w-auto" style={{ backgroundColor: branding.primaryColor }}>
                Continue <ChevronRight className="w-6 h-6" />
              </Button>
            ) : (
              <Button onClick={() => onSave(formData)} className="gap-3 h-14 md:h-16 px-10 md:px-14 shadow-2xl rounded-2xl md:rounded-3xl font-black uppercase tracking-tighter text-white w-full sm:w-auto" style={{ backgroundColor: branding.primaryColor }}>
                Finalize <CheckCircle2 className="w-6 h-6" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
