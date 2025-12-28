
import React, { useState, useEffect, useRef } from 'react';
import { Branding, ItineraryData, Hotel } from './types';
import { DEFAULT_BRANDING, MOCK_ITINERARY, MASTER_HOTELS } from './constants';
import { Dashboard } from './components/Dashboard';
import { ItineraryForm } from './components/ItineraryForm';
import { ItineraryPreview } from './components/ItineraryPreview';
import { HotelManager } from './components/HotelManager';
import { Button } from './components/Button';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { ChangePassword } from './components/ChangePassword';
import { Layout, Palette, FileText, Printer, X, Save, Database, Upload, Plus, Trash2, MapPin, Tag, LayoutTemplate, Navigation2, Clock, CheckCircle2, ShieldAlert, LogOut, Key } from 'lucide-react';

const API_BASE = 'https://travel-app-production-24d5.up.railway.app/api';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('itinerary_token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('itinerary_user') || 'null'));

  const [view, setView] = useState<'dashboard' | 'builder' | 'preview' | 'settings' | 'hotels' | 'admin'>('dashboard');
  const [itineraries, setItineraries] = useState<ItineraryData[]>([]);
  const [masterHotels, setMasterHotels] = useState<Hotel[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryData | null>(null);
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [logoPreview, setLogoPreview] = useState<string>(branding.logoUrl);
  const [newItem, setNewItem] = useState({ location: '', category: '', term: '', policy: '', overview: '' });
  const [newDayTemplate, setNewDayTemplate] = useState({ title: '', description: '', distance: '', travelTime: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth Handling
  const handleLogin = (token: string, user: any) => {
    localStorage.setItem('itinerary_token', token);
    localStorage.setItem('itinerary_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    if (user.role === 'admin') {
      setView('admin');
    } else {
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('itinerary_token');
    localStorage.removeItem('itinerary_user');
    setToken(null);
    setUser(null);
    setView('dashboard');
  };

  // Set initial view based on user role
  useEffect(() => {
    if (user?.role === 'admin') {
      setView('admin');
    } else {
      setView('dashboard');
    }
  }, [user]);

  // Fetch Data from Server
  useEffect(() => {
    if (!token || user?.role === 'admin') return;

    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch Itineraries
        const itRes = await fetch(`${API_BASE}/itineraries`, { headers });
        if (itRes.ok) {
          const its = await itRes.json();
          setItineraries(its);
        }

        // Fetch Hotels
        const hotRes = await fetch(`${API_BASE}/hotels`, { headers });
        if (hotRes.ok) {
          const hots = await hotRes.json();
          setMasterHotels(hots);
        }

        // Fetch Branding
        const brandRes = await fetch(`${API_BASE}/branding`, { headers });
        if (brandRes.ok) {
          const brand = await brandRes.json();
          setBranding(brand);
          setLogoPreview(brand.logoUrl);
          document.documentElement.style.setProperty('--primary-color', brand.primaryColor);
        }
      } catch (err) {
        console.error('Error fetching data from server');
      }
    };

    fetchData();
  }, [token, user]);

  // Sync Branding to CSS
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', branding.primaryColor);
  }, [branding]);

  // Persist Data to Server
  const saveItineraryToServer = async (it: ItineraryData) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/itineraries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(it)
      });
    } catch (err) {
      console.error('Error saving itinerary to server');
    }
  };

  const saveHotelsToServer = async (hotels: Hotel[]) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/hotels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hotels)
      });
    } catch (err) {
      console.error('Error saving hotels to server');
    }
  };

  const saveBrandingToServer = async (newBrand: Branding) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/branding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBrand)
      });
    } catch (err) {
      console.error('Error saving branding to server');
    }
  };

  const handleCreateNew = () => {
    const fresh: ItineraryData = {
      id: `itinerary_${Date.now()}`,
      clientName: '',
      packageName: '',
      destinations: '',
      duration: '',
      packageType: branding.packageCategories[0] || 'Standard Package',
      travelDates: '',
      overview: '',
      coverImages: ['', '', '', ''],
      days: [{ id: `day_1_${Date.now()}`, title: 'Arrival', description: '', distance: '', travelTime: '' }],
      selectedHotels: [],
      pricing: {
        totalPax: 0,
        adults: 0,
        children: 0,
        rooms: 0,
        extraBeds: 0,
        extraBedPrice: '',
        cnbCount: 0,
        cnbPrice: '',
        perAdultPrice: '',
        perChildPrice: '',
        totalCost: 'Price on Request',
        nightBreakup: []
      },
      inclusions: [],
      exclusions: [],
      supplementCosts: [],
      terms: branding.terms || [],
      cancellationPolicy: branding.cancellationPolicy || []
    };
    setCurrentItinerary(fresh);
    setView('builder');
  };

  const handleEdit = (id: string) => {
    const it = itineraries.find(i => i.id === id);
    if (it) {
      setCurrentItinerary({ ...it });
      setView('builder');
    }
  };

  const handleSave = async (data: ItineraryData) => {
    await saveItineraryToServer(data);
    setItineraries(prev => {
      const exists = prev.find(i => i.id === data.id);
      if (exists) return prev.map(i => i.id === data.id ? data : i);
      return [data, ...prev];
    });
    setCurrentItinerary(data);
    setView('preview');
  };

  const handleUpdateHotels = async (updated: Hotel[]) => {
    setMasterHotels(updated);
    await saveHotelsToServer(updated);
  };

  const handleUpdateBranding = async (updated: Branding) => {
    setBranding(updated);
    await saveBrandingToServer(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        handleUpdateBranding({ ...branding, logoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const addCategory = () => {
    if (!newItem.category.trim()) return;
    handleUpdateBranding({ ...branding, packageCategories: [...branding.packageCategories, newItem.category.trim()] });
    setNewItem({ ...newItem, category: '' });
  };

  const addLocation = () => {
    if (!newItem.location.trim()) return;
    handleUpdateBranding({ ...branding, locations: [...branding.locations, newItem.location.trim()] });
    setNewItem({ ...newItem, location: '' });
  };

  const addMasterTerm = () => {
    if (!newItem.term.trim()) return;
    handleUpdateBranding({ ...branding, terms: [...(branding.terms || []), newItem.term.trim()] });
    setNewItem({ ...newItem, term: '' });
  };


  const addOfficeLocation = () => {
    if (!(newItem as any).officeLocation?.trim()) return;
    handleUpdateBranding({ ...branding, officeLocations: [...(branding.officeLocations || []), (newItem as any).officeLocation.trim()] });
    setNewItem({ ...newItem, officeLocation: '' } as any);
  };

  const addMasterPolicy = () => {
    if (!newItem.policy.trim()) return;
    handleUpdateBranding({ ...branding, cancellationPolicy: [...(branding.cancellationPolicy || []), newItem.policy.trim()] });
    setNewItem({ ...newItem, policy: '' });
  };

  const addDayTemplate = () => {
    if (!newDayTemplate.title.trim()) return;
    handleUpdateBranding({
      ...branding,
      savedDayTemplates: [...(branding.savedDayTemplates || []), { id: Date.now().toString(), ...newDayTemplate }]
    });
    setNewDayTemplate({ title: '', description: '', distance: '', travelTime: '' });
  };

  const removeDayTemplate = (id: string) => {
    handleUpdateBranding({
      ...branding,
      savedDayTemplates: branding.savedDayTemplates.filter(t => t.id !== id)
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this itinerary?')) {
      try {
        await fetch(`${API_BASE}/itineraries/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setItineraries(itineraries.filter(i => i.id !== id));
      } catch (err) {
        console.error('Error deleting itinerary');
      }
    }
  };

  // Side Navigation Logic
  const showSidebar = token && view !== 'preview';

  if (!token) {
    return <Login onLogin={handleLogin} primaryColor={branding.primaryColor} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {showSidebar && (
        <aside className="no-print fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-slate-900 text-slate-400 flex flex-col z-50">
          <div className="p-8 flex items-center gap-3 text-white border-b border-white/5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: branding.primaryColor }}>
              <Layout className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter hidden md:inline">Itinerary<span style={{ color: branding.primaryColor }}>Pro</span></span>
          </div>

          <nav className="flex-1 py-8 px-4 space-y-3">
            {user?.role === 'admin' ? (
              <button onClick={() => setView('admin')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-[2px] ${view === 'admin' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span className="hidden md:inline">User Manager</span>
              </button>
            ) : (
              <>
                <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-[2px] ${view === 'dashboard' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
                  <Layout className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
                <button onClick={() => setView('hotels')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-[2px] ${view === 'hotels' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
                  <Database className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline">Hotels Master</span>
                </button>
                <button onClick={handleCreateNew} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-[2px] ${view === 'builder' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
                  <FileText className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline">Create Trip</span>
                </button>
                <button onClick={() => setView('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-[2px] ${view === 'settings' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
                  <Palette className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline">Settings</span>
                </button>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-2">
            {user?.role !== 'admin' && (
              <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-4 px-5 py-3 rounded-xl hover:bg-white/5 transition-all font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-white">
                <Key className="w-4 h-4" />
                <span className="hidden md:inline">Security</span>
              </button>
            )}
            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-3 rounded-xl hover:bg-rose-500/10 transition-all font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-rose-500">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </aside>
      )}

      <main className={`flex-1 ${view !== 'preview' ? 'ml-20 md:ml-64' : ''}`}>
        {view === 'admin' && user?.role === 'admin' && (
          <AdminPanel token={token!} primaryColor={branding.primaryColor} />
        )}

        {view === 'dashboard' && (
          <Dashboard
            itineraries={itineraries}
            onNew={handleCreateNew}
            onEdit={handleEdit}
            onPreview={(id) => { setCurrentItinerary(itineraries.find(i => i.id === id)!); setView('preview'); }}
            onDelete={handleDelete}
          />
        )}

        {view === 'hotels' && (
          <HotelManager hotels={masterHotels} branding={branding} onUpdate={handleUpdateHotels} />
        )}

        {view === 'builder' && currentItinerary && (
          <ItineraryForm
            initialData={currentItinerary}
            masterHotels={masterHotels}
            branding={branding}
            onSave={handleSave}
            onCancel={() => setView('dashboard')}
          />
        )}

        {view === 'preview' && currentItinerary && (
          <div className="min-h-screen bg-slate-800 py-12 px-4 flex flex-col items-center gap-8 print:bg-white print:p-0 print:m-0 print:block overflow-x-auto w-full">
            <div className="no-print flex gap-4">
              <Button onClick={() => setView('builder')} variant="outline" className="bg-white/70 text-white border-white/20  gap-2 rounded-2xl h-14 px-8">
                <FileText className="w-5 h-5" /> Back to Editor
              </Button>
              <Button onClick={() => window.print()} className="gap-2 h-14 px-10 shadow-2xl rounded-2xl font-black uppercase tracking-widest" style={{ backgroundColor: branding.primaryColor }}>
                <Printer className="w-5 h-5" /> Export PDF
              </Button>
              <Button onClick={() => setView('dashboard')} variant="outline" className="bg-white/70 text-black border-white/20 hover:bg-white/20 rounded-2xl h-14 w-14 p-0">
                <X className="w-6 h-6" />
              </Button>
            </div>
            <ItineraryPreview data={currentItinerary} branding={branding} />
          </div>
        )}

        {view === 'settings' && (
          <div className="p-8 max-w-6xl mx-auto space-y-12 pb-32">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Agency Branding</h1>
              <p className="text-slate-500 font-medium mt-1">Configure your corporate identity and templates</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Company Logo</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-4 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-all group overflow-hidden bg-white"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} className="w-full h-full object-contain p-8" alt="Logo" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-slate-300 group-hover:text-rose-500 mb-2" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Logo</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">PDF Group Colors</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest">1. Global Typography Colors</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black text-white/60 uppercase">Main Headings</span>
                          <input type="color" value={branding.headingColor || branding.primaryColor} onChange={e => handleUpdateBranding({ ...branding, headingColor: e.target.value })} className="w-full h-10 rounded-lg border-2 border-white/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black text-white/60 uppercase">Sub Headings</span>
                          <input type="color" value={branding.subHeadingColor || branding.secondaryColor} onChange={e => handleUpdateBranding({ ...branding, subHeadingColor: e.target.value })} className="w-full h-10 rounded-lg border-2 border-white/20" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black text-white/60 uppercase">Body Text</span>
                          <input type="color" value={branding.textColor || '#334155'} onChange={e => handleUpdateBranding({ ...branding, textColor: e.target.value })} className="w-full h-10 rounded-lg border-2 border-white/20" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl space-y-3 text-slate-900">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">2. Cover & Section Styling</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase">Explore Text</span>
                          <input type="color" value={branding.exploreTextColor} onChange={e => handleUpdateBranding({ ...branding, exploreTextColor: e.target.value })} className="w-full h-10 rounded-lg border-2 border-slate-200" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase">Destination Name</span>
                          <input type="color" value={branding.destinationTextColor} onChange={e => handleUpdateBranding({ ...branding, destinationTextColor: e.target.value })} className="w-full h-10 rounded-lg border-2 border-slate-200" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl space-y-3 text-slate-900">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">3. Base Branding (Gradients & Icons)</span>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="color" value={branding.primaryColor} onChange={e => handleUpdateBranding({ ...branding, primaryColor: e.target.value })} className="w-full h-10 rounded-lg" title="Primary" />
                        <input type="color" value={branding.secondaryColor} onChange={e => handleUpdateBranding({ ...branding, secondaryColor: e.target.value })} className="w-full h-10 rounded-lg" title="Secondary" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Agency Contact Info</label>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Agency Name</span>
                      <input type="text" value={branding.companyName} onChange={e => handleUpdateBranding({ ...branding, companyName: e.target.value })} className="w-full p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:border-rose-500 outline-none" placeholder="Company Name" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Contact Phone</span>
                      <input type="text" value={branding.phone} onChange={e => handleUpdateBranding({ ...branding, phone: e.target.value })} className="w-full p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:border-rose-500 outline-none" placeholder="Phone Number" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Website URL</span>
                      <input type="text" value={branding.website} onChange={e => handleUpdateBranding({ ...branding, website: e.target.value })} className="w-full p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:border-rose-500 outline-none" placeholder="Website" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-rose-500" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-[3px]">Master Terms & Conditions</label>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newItem.term} onChange={e => setNewItem({ ...newItem, term: e.target.value })} className="flex-1 p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500" placeholder="e.g. 50% advance for booking..." />
                    <Button onClick={addMasterTerm} className="rounded-2xl shrink-0 h-14 w-14 p-0 shadow-lg shadow-rose-500/20"><Plus className="w-5 h-5" /></Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar pt-2">
                    {branding.terms?.map((term, i) => (
                      <div key={i} className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl flex justify-between items-start group shadow-sm">
                        <span className="text-[10px] font-bold text-slate-600 leading-relaxed flex-1">{term}</span>
                        <button onClick={() => handleUpdateBranding({ ...branding, terms: branding.terms.filter((_, idx) => idx !== i) })} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all ml-2"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl overflow-hidden relative">
                  <div className="flex items-center gap-3 mb-6">
                    <LayoutTemplate className="w-6 h-6 text-rose-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Day Plan Templates</h3>
                  </div>
                  <p className="text-[10px] font-bold text-white/40 uppercase mb-8 italic">Save common day descriptions and travel metrics here.</p>

                  <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-[24px] border border-white/10 space-y-4">
                      <input
                        type="text"
                        value={newDayTemplate.title}
                        onChange={e => setNewDayTemplate({ ...newDayTemplate, title: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 p-2 font-black text-white outline-none focus:border-rose-500 uppercase tracking-tight"
                        placeholder="Template Title (e.g. Day 1: Arrival)"
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Navigation2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                          <input
                            type="text"
                            value={newDayTemplate.distance}
                            onChange={e => setNewDayTemplate({ ...newDayTemplate, distance: e.target.value })}
                            className="w-full bg-white/10 rounded-xl p-3 pl-10 text-white/80 font-bold text-xs outline-none focus:bg-white/20"
                            placeholder="Distance (km)"
                          />
                        </div>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                          <input
                            type="text"
                            value={newDayTemplate.travelTime}
                            onChange={e => setNewDayTemplate({ ...newDayTemplate, travelTime: e.target.value })}
                            className="w-full bg-white/10 rounded-xl p-3 pl-10 text-white/80 font-bold text-xs outline-none focus:bg-white/20"
                            placeholder="Time (Duration)"
                          />
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        value={newDayTemplate.description}
                        onChange={e => setNewDayTemplate({ ...newDayTemplate, description: e.target.value })}
                        className="w-full bg-white/10 rounded-xl p-4 text-white/80 font-medium text-sm outline-none focus:bg-white/20 resize-none"
                        placeholder="Day Description..."
                      />
                      <Button onClick={addDayTemplate} className="w-full h-12 rounded-xl gap-2 font-black uppercase tracking-widest" variant="primary">
                        <Plus className="w-4 h-4" /> Save to Master
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {branding.savedDayTemplates?.map(template => (
                        <div key={template.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl group flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">{template.title}</div>
                            {(template.distance || template.travelTime) && (
                              <div className="flex items-center gap-3 mb-2 opacity-60">
                                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter"><Navigation2 className="w-2.5 h-2.5" /> {template.distance || '-'}</div>
                                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter"><Clock className="w-2.5 h-2.5" /> {template.travelTime || '-'}</div>
                              </div>
                            )}
                            <div className="text-[11px] text-white/60 line-clamp-2">{template.description}</div>
                          </div>
                          <button onClick={() => removeDayTemplate(template.id)} className="text-white/20 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-rose-500" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-[3px]">Saved Package Overviews</label>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={(newItem as any).overviewTitle || ''}
                      onChange={e => setNewItem({ ...newItem, overviewTitle: e.target.value } as any)}
                      className="w-full p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500"
                      placeholder="Template Title (e.g. Standard Honeymoon)"
                    />
                    <textarea
                      rows={3}
                      value={(newItem as any).overview || ''}
                      onChange={e => setNewItem({ ...newItem, overview: e.target.value } as any)}
                      className="w-full p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-medium text-sm outline-none focus:border-rose-500 resize-none"
                      placeholder="Write a standard package overview..."
                    />
                    <Button onClick={() => {
                      const title = (newItem as any).overviewTitle?.trim();
                      const content = (newItem as any).overview?.trim();
                      if (!title || !content) return;

                      // Filter out any simple strings if migration is needed, or just append new object
                      // Assuming fresh start or migration handled manually, but let's be safe w/ types
                      const currentOverviews = (branding.savedOverviews || []).filter(o => typeof o === 'object');

                      handleUpdateBranding({ ...branding, savedOverviews: [...currentOverviews, { title, content }] });
                      setNewItem({ ...newItem, overview: '', overviewTitle: '' } as any);
                    }} className="w-full h-12 rounded-xl gap-2 font-black uppercase tracking-widest" variant="primary">
                      <Plus className="w-4 h-4" /> Save Overview Template
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar pt-2">
                    {branding.savedOverviews?.map((ov: any, i) => (
                      <div key={i} className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl flex justify-between items-start group shadow-sm">
                        <div className="flex-1">
                          <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">{typeof ov === 'string' ? 'Untitled' : ov.title}</div>
                          <div className="text-[11px] font-medium text-slate-600 leading-relaxed line-clamp-2">{typeof ov === 'string' ? ov : ov.content}</div>
                        </div>
                        <button onClick={() => handleUpdateBranding({ ...branding, savedOverviews: branding.savedOverviews.filter((_, idx) => idx !== i) })} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all ml-2"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-[3px]">Office Locations</label>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={(newItem as any).officeLocation || ''} onChange={e => setNewItem({ ...newItem, officeLocation: e.target.value } as any)} className="flex-1 p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500" placeholder="e.g. New Delhi, Mumbai Base..." />
                    <Button onClick={addOfficeLocation} className="rounded-2xl shrink-0 h-14 w-14 p-0 shadow-lg shadow-rose-500/20"><Plus className="w-5 h-5" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {branding.officeLocations?.map(loc => (
                      <div key={loc} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-rose-600 transition-colors">
                        <MapPin className="w-3 h-3" />
                        {loc}
                        <button onClick={() => handleUpdateBranding({ ...branding, officeLocations: branding.officeLocations.filter(l => l !== loc) })} className="text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>


                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-[3px]">Master Cancellation Policy</label>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newItem.policy} onChange={e => setNewItem({ ...newItem, policy: e.target.value })} className="flex-1 p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500" placeholder="e.g. 100% refund before 30 days..." />
                    <Button onClick={addMasterPolicy} className="rounded-2xl shrink-0 h-14 w-14 p-0 shadow-lg shadow-rose-500/20"><Plus className="w-5 h-5" /></Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar pt-2">
                    {branding.cancellationPolicy?.map((policy, i) => (
                      <div key={i} className="bg-slate-50 border-2 border-slate-100 p-4 rounded-xl flex justify-between items-start group shadow-sm">
                        <span className="text-[10px] font-bold text-slate-600 leading-relaxed flex-1">{policy}</span>
                        <button onClick={() => handleUpdateBranding({ ...branding, cancellationPolicy: branding.cancellationPolicy.filter((_, idx) => idx !== i) })} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all ml-2"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Tag className="w-5 h-5 text-rose-500" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-[3px]">Package Tiers (Categories)</label>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} className="flex-1 p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500" placeholder="e.g. Gold, Silver, Platinum" />
                    <Button onClick={addCategory} className="rounded-2xl shrink-0 h-14 w-14 p-0 shadow-lg shadow-rose-500/20"><Plus className="w-5 h-5" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {branding.packageCategories.map(cat => (
                      <div key={cat} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-rose-600 transition-colors">
                        <Tag className="w-3 h-3" />
                        {cat}
                        <button onClick={() => handleUpdateBranding({ ...branding, packageCategories: branding.packageCategories.filter(c => c !== cat) })} className="text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-[3px]">Service Regions</label>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newItem.location} onChange={e => setNewItem({ ...newItem, location: e.target.value })} className="flex-1 p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500" placeholder="e.g. Srinagar, Gulmarg" />
                    <Button onClick={addLocation} className="rounded-2xl shrink-0 h-14 w-14 p-0 shadow-lg shadow-rose-500/20"><Plus className="w-5 h-5" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {branding.locations.map(loc => (
                      <div key={loc} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-rose-600 transition-colors">
                        <MapPin className="w-3 h-3" />
                        {loc}
                        <button onClick={() => handleUpdateBranding({ ...branding, locations: branding.locations.filter(l => l !== loc) })} className="text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-12">
              <Button onClick={() => setView('dashboard')} className="gap-3 h-16 px-14 shadow-2xl rounded-[24px] font-black uppercase tracking-tighter" style={{ backgroundColor: branding.primaryColor }}>
                <Save className="w-6 h-6" /> Save All Settings
              </Button>
            </div>
          </div>
        )}
      </main>

      {showPasswordModal && (
        <ChangePassword token={token!} primaryColor={branding.primaryColor} onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

export default App;
