import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { compressImage } from './utils';
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
import { Layout, Palette, FileText, Printer, X, Save, Database, Upload, Plus, Trash2, MapPin, Tag, LayoutTemplate, Navigation2, Clock, CheckCircle2, ShieldAlert, LogOut, Key, Image as ImageIcon, ImagePlus } from 'lucide-react';

const API_BASE = 'https://travel-app-production-24d5.up.railway.app/api';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('itinerary_token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('itinerary_user') || 'null'));
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 850) {
        // 210mm is ~794px. We add some margin.
        const newScale = (width - 32) / 820;
        setScale(Math.min(newScale, 1));
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [view, setView] = useState<'dashboard' | 'builder' | 'preview' | 'settings' | 'hotels' | 'admin'>('dashboard');
  const [itineraries, setItineraries] = useState<ItineraryData[]>([]);
  const [masterHotels, setMasterHotels] = useState<Hotel[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<ItineraryData | null>(null);
  const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);
  const [logoPreview, setLogoPreview] = useState<string>(branding.logoUrl);
  const [newItem, setNewItem] = useState({ location: '', category: '', term: '', policy: '', overview: '' });
  const [newDayTemplate, setNewDayTemplate] = useState({ title: '', description: '', distance: '', travelTime: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultCoverInputRef = useRef<HTMLInputElement>(null);

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

  const handleDownloadPDF = async () => {
    const element = document.getElementById('itinerary-pdf');
    if (!element) return;

    setIsDownloadingPDF(true);

    // Use the LIVE element to ensure images are loaded
    // We temporarily reset styles to ensure full capture
    const parent = element.parentElement;
    const originalTransform = parent ? parent.style.transform : '';
    const bodyOverflow = document.body.style.overflow;

    if (parent) parent.style.transform = 'none'; // Un-scale
    document.body.style.overflow = 'visible';    // Prevent clipping

    // 1px = 0.264583 mm approximately
    const heightMM = (element.scrollHeight * 0.264583) + 20;

    const opt = {
      margin: 0,
      filename: `Itinerary_${currentItinerary?.clientName || 'Export'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: 0,
        windowWidth: 1920,
        width: 794,
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: [210, heightMM], orientation: 'portrait' },
      pagebreak: { mode: [] }
    } as any;

    try {
      await html2pdf().set(opt).from(element).save();
    } finally {
      // Restore styles immediately
      if (parent) parent.style.transform = originalTransform;
      document.body.style.overflow = bodyOverflow;
      setIsDownloadingPDF(false);
    }
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
      duration: '',
      packageType: branding.packageCategories[0] || 'Standard Package',
      overview: '',
      coverImages: branding.masterCoverImages?.slice(0, 4) || [],
      days: [{ id: `day_1_${Date.now()}`, title: 'Arrival', description: '', distance: '', travelTime: '', date: '' }],
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
        roomType: branding.roomTypes?.[0] || 'Standard Room',
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

  const handleSave = (data: ItineraryData) => {
    // 1. Update UI state instantly
    setItineraries(prev => {
      const exists = prev.find(i => i.id === data.id);
      if (exists) return prev.map(i => i.id === data.id ? data : i);
      return [data, ...prev];
    });
    setCurrentItinerary(data);

    // 2. Switch to preview instantly (Optimistic UI)
    setView('preview');

    // 3. Save to server in backgrounds (Non-blocking)
    saveItineraryToServer(data).catch(err => {
      console.error('Background save failed:', err);
    });
  };

  const handleUpdateHotels = (updated: Hotel[]) => {
    setMasterHotels(updated);
    saveHotelsToServer(updated).catch(err => console.error('Hotel sync failed:', err));
  };

  const handleUpdateBranding = (updated: Branding) => {
    setBranding(updated);
    saveBrandingToServer(updated).catch(err => console.error('Branding sync failed:', err));
  };

  const handleMasterGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const compressed = await compressImage(base64String);
        handleUpdateBranding({
          ...branding,
          masterCoverImages: [...(branding.masterCoverImages || []), compressed],
          defaultCoverImage: branding.defaultCoverImage || compressed
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Logo usually needs better quality and smaller dimensions
        const compressed = await compressImage(base64String, 500, 500, 50000);
        setLogoPreview(compressed);
        handleUpdateBranding({ ...branding, logoUrl: compressed });
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

  const addRoomType = () => {
    if (!(newItem as any).roomType?.trim()) return;
    handleUpdateBranding({ ...branding, roomTypes: [...(branding.roomTypes || []), (newItem as any).roomType.trim()] });
    setNewItem({ ...newItem, roomType: '' } as any);
  };

  const addMasterInclusion = () => {
    if (!(newItem as any).inclusion?.trim()) return;
    handleUpdateBranding({ ...branding, defaultInclusions: [...(branding.defaultInclusions || []), (newItem as any).inclusion.trim()] });
    setNewItem({ ...newItem, inclusion: '' } as any);
  };

  const addMasterExclusion = () => {
    if (!(newItem as any).exclusion?.trim()) return;
    handleUpdateBranding({ ...branding, defaultExclusions: [...(branding.defaultExclusions || []), (newItem as any).exclusion.trim()] });
    setNewItem({ ...newItem, exclusion: '' } as any);
  };

  const addMasterSupplement = () => {
    if (!(newItem as any).supplement?.trim()) return;
    handleUpdateBranding({ ...branding, defaultSupplementCosts: [...(branding.defaultSupplementCosts || []), (newItem as any).supplement.trim()] });
    setNewItem({ ...newItem, supplement: '' } as any);
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
        <aside className="no-print fixed top-0 left-0 right-0 md:bottom-0 h-16 md:h-full w-full md:w-64 bg-slate-900 text-slate-400 flex flex-row md:flex-col z-50 shadow-xl md:shadow-none border-b md:border-b-0 border-white/5">
          <div className="px-4 md:p-8 flex items-center gap-3 text-white border-b-0 md:border-b border-r md:border-r-0 border-white/5 shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shrink-0" style={{ backgroundColor: branding.primaryColor }}>
              <Layout className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-black text-lg md:text-2xl tracking-tighter hidden sm:inline">Itinerary<span style={{ color: branding.primaryColor }}>Pro</span></span>
          </div>

          <nav className="flex-1 flex flex-row md:flex-col items-center md:items-stretch px-2 md:px-4 space-x-1 md:space-x-0 md:space-y-3 overflow-x-auto no-scrollbar py-0 md:py-8">
            {user?.role === 'admin' ? (
              <button onClick={() => setView('admin')} className={`flex md:w-full items-center gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all font-black uppercase text-[10px] tracking-[1px] md:tracking-[2px] whitespace-nowrap ${view === 'admin' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span className="hidden md:inline">User Manager</span>
              </button>
            ) : (
              <>
                <button onClick={() => setView('dashboard')} className={`flex md:w-full items-center gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all font-black uppercase text-[10px] tracking-[1px] md:tracking-[2px] whitespace-nowrap ${view === 'dashboard' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
                  <Layout className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
                <button onClick={() => setView('hotels')} className={`flex md:w-full items-center gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all font-black uppercase text-[10px] tracking-[1px] md:tracking-[2px] whitespace-nowrap ${view === 'hotels' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
                  <Database className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline">Hotels</span>
                </button>
                <button onClick={handleCreateNew} className={`flex md:w-full items-center gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all font-black uppercase text-[10px] tracking-[1px] md:tracking-[2px] whitespace-nowrap ${view === 'builder' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
                  <FileText className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline">Create</span>
                </button>
                <button onClick={() => setView('settings')} className={`flex md:w-full items-center gap-4 px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all font-black uppercase text-[10px] tracking-[1px] md:tracking-[2px] whitespace-nowrap ${view === 'settings' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}>
                  <Palette className="w-5 h-5 shrink-0" />
                  <span className="hidden md:inline">Settings</span>
                </button>
              </>
            )}
          </nav>

          <div className="px-2 md:p-4 border-t-0 md:border-t border-l md:border-l-0 border-white/5 flex flex-row md:flex-col gap-1 md:gap-2 shrink-0">
            {user?.role !== 'admin' && (
              <button onClick={() => setShowPasswordModal(true)} className="flex md:w-full items-center gap-3 md:gap-4 px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl hover:bg-white/5 transition-all font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-white whitespace-nowrap">
                <Key className="w-4 h-4" />
                <span className="hidden md:inline">Security</span>
              </button>
            )}
            <button onClick={handleLogout} className="flex md:w-full items-center gap-3 md:gap-4 px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl hover:bg-rose-500/10 transition-all font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:text-rose-500 whitespace-nowrap">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </aside>
      )}

      <main className={`flex-1 overflow-x-hidden ${view !== 'preview' ? 'pt-16 md:pt-0 md:ml-64' : ''}`}>
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
          <div className="min-h-screen bg-slate-800 py-12 px-4 flex flex-col items-center gap-8 print:bg-white print:p-0 print:m-0 print:block w-full overflow-x-hidden">

            {/* Loading Overlay */}
            {isDownloadingPDF && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
                <div className="bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-6 max-w-sm mx-4">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent rounded-full animate-spin" style={{
                      borderTopColor: branding.primaryColor,
                      borderRightColor: branding.primaryColor
                    }}></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Generating PDF...</h3>
                    <p className="text-sm text-slate-500 font-medium">Please wait while we prepare your itinerary</p>
                  </div>
                </div>
              </div>
            )}

            <div className="no-print flex flex-col sm:flex-row gap-4 w-full max-w-[210mm] items-center justify-center">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={() => setView('builder')} variant="outline" className="bg-white/70 text-white border-white/20 hover:bg-white/20 gap-2 rounded-xl h-12 md:h-14 px-4 md:px-8 flex-1 sm:flex-none text-xs md:text-base font-bold">
                  <FileText className="w-4 h-4 md:w-5 h-5" /> Back to Editor
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF}
                  className="gap-2 h-12 md:h-14 px-6 md:px-10 shadow-2xl rounded-xl font-black uppercase tracking-widest flex-1 sm:flex-none text-xs md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <Printer className="w-4 h-4 md:w-5 h-5" /> {isDownloadingPDF ? 'Generating...' : 'Download PDF'}
                </Button>
              </div>
              <Button onClick={() => setView('dashboard')} variant="outline" className="bg-white/70 text-black border-white/20  rounded-xl h-12 w-12 md:h-14 md:w-14 p-0 shrink-0 self-center">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </div>

            <div className="w-full flex justify-center overflow-visible print:!h-auto" style={{ height: scale < 1 ? `calc(297mm * ${scale} + 100px)` : 'auto' }}>
              <div className="print-reset-scale" style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out'
              }}>
                <ItineraryPreview data={currentItinerary} branding={branding} />
              </div>
            </div>
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Master Cover Gallery</label>
                    <button
                      onClick={() => defaultCoverInputRef.current?.click()}
                      className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Photo
                    </button>
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic mb-4">Manage official agency photos. The first image will be the system default.</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {branding.masterCoverImages?.map((img, idx) => (
                      <div key={idx} className="group relative aspect-video rounded-2xl overflow-hidden border-2 border-slate-100 bg-white shadow-sm hover:border-rose-500 transition-all">
                        <img src={img} className="w-full h-full object-cover" alt={`Master ${idx + 1}`} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                          <button
                            onClick={() => {
                              const newImgs = branding.masterCoverImages.filter((_, i) => i !== idx);
                              handleUpdateBranding({
                                ...branding,
                                masterCoverImages: newImgs,
                                defaultCoverImage: idx === 0 ? (newImgs[0] || '') : branding.defaultCoverImage
                              });
                            }}
                            className="bg-white/20 hover:bg-rose-500 backdrop-blur-md p-2 rounded-xl text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 bg-rose-500 text-white text-[7px] font-black uppercase px-2 py-1 rounded-lg">Default</span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div
                      onClick={() => defaultCoverInputRef.current?.click()}
                      className="aspect-video border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-all group text-slate-300"
                    >
                      <ImagePlus className="w-8 h-8 group-hover:text-rose-500 mb-1" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Add New</span>
                    </div>
                  </div>
                  <input type="file" ref={defaultCoverInputRef} onChange={handleMasterGalleryUpload} accept="image/*" className="hidden" />
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
                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="w-5 h-5 text-rose-500" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-[3px]">Master Room Types</label>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={(newItem as any).roomType || ''} onChange={e => setNewItem({ ...newItem, roomType: e.target.value } as any)} className="flex-1 p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500" placeholder="e.g. Deluxe Room, Suite..." />
                    <Button onClick={addRoomType} className="rounded-2xl shrink-0 h-14 w-14 p-0 shadow-lg shadow-rose-500/20"><Plus className="w-5 h-5" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {branding.roomTypes?.map(type => (
                      <div key={type} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-rose-600 transition-colors">
                        <Tag className="w-3 h-3" />
                        {type}
                        <button onClick={() => handleUpdateBranding({ ...branding, roomTypes: branding.roomTypes.filter(t => t !== type) })} className="text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-rose-500" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-[3px]">Default Inclusions</label>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={(newItem as any).inclusion || ''} onChange={e => setNewItem({ ...newItem, inclusion: e.target.value } as any)} className="flex-1 p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500" placeholder="e.g. Daily Breakfast..." />
                    <Button onClick={addMasterInclusion} className="rounded-2xl shrink-0 h-14 w-14 p-0 shadow-lg shadow-rose-500/20"><Plus className="w-5 h-5" /></Button>
                  </div>
                  <div className="space-y-1">
                    {branding.defaultInclusions?.map((inc, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group">
                        <span className="text-[10px] font-bold text-slate-600">{inc}</span>
                        <button onClick={() => handleUpdateBranding({ ...branding, defaultInclusions: branding.defaultInclusions.filter((_, idx) => idx !== i) })} className="opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-[3px]">Default Exclusions</label>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={(newItem as any).exclusion || ''} onChange={e => setNewItem({ ...newItem, exclusion: e.target.value } as any)} className="flex-1 p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500" placeholder="e.g. Airfare..." />
                    <Button onClick={addMasterExclusion} className="rounded-2xl shrink-0 h-14 w-14 p-0 shadow-lg shadow-rose-500/20"><Plus className="w-5 h-5" /></Button>
                  </div>
                  <div className="space-y-1">
                    {branding.defaultExclusions?.map((exc, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group">
                        <span className="text-[10px] font-bold text-slate-600">{exc}</span>
                        <button onClick={() => handleUpdateBranding({ ...branding, defaultExclusions: branding.defaultExclusions.filter((_, idx) => idx !== i) })} className="opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-rose-500" />
                    <label className="text-xs font-black text-slate-900 uppercase tracking-[3px]">Default Supplement Costs</label>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={(newItem as any).supplement || ''} onChange={e => setNewItem({ ...newItem, supplement: e.target.value } as any)} className="flex-1 p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500" placeholder="e.g. Innova Upgrade..." />
                    <Button onClick={addMasterSupplement} className="rounded-2xl shrink-0 h-14 w-14 p-0 shadow-lg shadow-rose-500/20"><Plus className="w-5 h-5" /></Button>
                  </div>
                  <div className="space-y-1">
                    {branding.defaultSupplementCosts?.map((sup, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group">
                        <span className="text-[10px] font-bold text-slate-600">{sup}</span>
                        <button onClick={() => handleUpdateBranding({ ...branding, defaultSupplementCosts: branding.defaultSupplementCosts.filter((_, idx) => idx !== i) })} className="opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 className="w-4 h-4" /></button>
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
