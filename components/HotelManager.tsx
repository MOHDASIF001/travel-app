
import React, { useState, useRef } from 'react';
import { Plus, Trash2, Hotel as HotelIcon, Star, Save, Image as ImageIcon, X, MapPin, Upload, Pencil, Check, Heart } from 'lucide-react';
import { Button } from './Button';
import { Hotel, Branding } from '../types';
import { compressImage } from '../utils';

interface HotelManagerProps {
  hotels: Hotel[];
  branding: Branding;
  onUpdate: (hotels: Hotel[]) => void;
}

const COMMON_AMENITIES = [
  "Welcome Drink",
  "Daily Breakfast",
  "Daily Dinner",
  "Free Wi-Fi",
  "24/7 Room Service",
  "Electric Blanket",
  "Mineral Water",
  "Housekeeping",
  "Tea/Coffee Maker",
  "Bonfire Facility"
];

export const HotelManager: React.FC<HotelManagerProps> = ({ hotels, branding, onUpdate }) => {
  const [editingHotel, setEditingHotel] = useState<Partial<Hotel> | null>(null);
  const [newAmenity, setNewAmenity] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startNew = () => {
    setEditingHotel({
      id: Date.now().toString(),
      name: '',
      location: '',
      stars: 3,
      category: branding.locations[0] || '',
      amenities: [],
      images: []
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingHotel) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64);
        setEditingHotel(prev => ({
          ...prev!,
          images: [...(prev!.images || []), compressed]
        }));
      };
      reader.readAsDataURL(file as any);
    });
  };

  const saveHotel = () => {
    if (!editingHotel?.name || !editingHotel?.category) {
      alert('Hotel Name and Region/Category are mandatory.');
      return;
    }
    const hotelToSave = editingHotel as Hotel;
    const exists = hotels.find(h => h.id === hotelToSave.id);
    if (exists) {
      onUpdate(hotels.map(h => h.id === hotelToSave.id ? hotelToSave : h));
    } else {
      onUpdate([...hotels, hotelToSave]);
    }
    setEditingHotel(null);
    setNewAmenity('');
  };

  const deleteHotel = (id: string) => {
    if (confirm('Are you sure you want to delete this hotel from the master database?')) {
      onUpdate(hotels.filter(h => h.id !== id));
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (!editingHotel) return;
    const current = editingHotel.amenities || [];
    if (current.includes(amenity)) {
      setEditingHotel({
        ...editingHotel,
        amenities: current.filter(a => a !== amenity)
      });
    } else {
      setEditingHotel({
        ...editingHotel,
        amenities: [...current, amenity]
      });
    }
  };

  const addManualAmenity = () => {
    if (!newAmenity.trim() || !editingHotel) return;
    if (!(editingHotel.amenities || []).includes(newAmenity.trim())) {
      setEditingHotel({
        ...editingHotel,
        amenities: [...(editingHotel.amenities || []), newAmenity.trim()]
      });
    }
    setNewAmenity('');
  };

  const removeAmenity = (index: number) => {
    if (!editingHotel) return;
    setEditingHotel({
      ...editingHotel,
      amenities: (editingHotel.amenities || []).filter((_, i) => i !== index)
    });
  };

  const removeImage = (index: number) => {
    if (!editingHotel) return;
    setEditingHotel({
      ...editingHotel,
      images: (editingHotel.images || []).filter((_, i) => i !== index)
    });
  };

  const setAsCover = (index: number) => {
    if (!editingHotel || !editingHotel.images) return;
    const newImages = [...editingHotel.images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    setEditingHotel({
      ...editingHotel,
      images: newImages
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Hotels Repository</h1>
          <p className="text-slate-500 font-medium mt-1 tracking-tight">Full control over your property database. Customize everything.</p>
        </div>
        <Button onClick={startNew} className="gap-2 h-14 px-8 text-lg shadow-xl shadow-rose-500/20">
          <Plus className="w-6 h-6" /> Add New Hotel
        </Button>
      </div>

      {editingHotel ? (
        <div className="bg-white rounded-[40px] border-4 border-slate-900 p-10 mb-12 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-10 pb-6 border-b-2 border-slate-100">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white">
                <HotelIcon className="w-6 h-6" />
              </div>
              {editingHotel.name ? `Editing: ${editingHotel.name}` : 'New Property Registration'}
            </h2>
            <button onClick={() => setEditingHotel(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors border-2 border-slate-100">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              {/* Detailed Config */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Hotel Display Name</label>
                  <input
                    type="text"
                    value={editingHotel.name}
                    onChange={e => setEditingHotel({ ...editingHotel, name: e.target.value })}
                    className="w-full p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-black focus:border-rose-500 outline-none transition-all uppercase"
                    placeholder="e.g. Radisson Blu"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Region / Destination</label>
                  <select
                    value={editingHotel.category}
                    onChange={e => setEditingHotel({ ...editingHotel, category: e.target.value })}
                    className="w-full p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-black focus:border-rose-500 outline-none transition-all uppercase bg-slate-50"
                  >
                    <option value="">Select Region</option>
                    {branding.locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Full Address / Landmark</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={editingHotel.location}
                      onChange={e => setEditingHotel({ ...editingHotel, location: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:border-rose-500 outline-none transition-all"
                      placeholder="e.g. Near Dal Lake, Gate No. 1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Star Category</label>
                  <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        onClick={() => setEditingHotel({ ...editingHotel, stars: s })}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${editingHotel.stars === s ? 'bg-rose-600 text-white shadow-lg' : 'hover:bg-white text-slate-400'}`}
                      >
                        {s}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Quick Select Amenities</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COMMON_AMENITIES.map(amenity => {
                      const isActive = editingHotel.amenities?.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center gap-2 p-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${isActive
                            ? 'bg-rose-600 border-rose-600 text-white shadow-lg'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                            }`}
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${isActive ? 'bg-white text-rose-600 border-white' : 'border-slate-200'}`}>
                            {isActive && <Check className="w-3 h-3" />}
                          </div>
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Custom Amenities</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={e => setNewAmenity(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addManualAmenity())}
                      className="flex-1 p-4 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500"
                      placeholder="Type unique amenity..."
                    />
                    <Button onClick={addManualAmenity} type="button" className="px-6 rounded-2xl"><Plus className="w-5 h-5" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200">
                    {editingHotel.amenities?.length === 0 && <span className="text-[10px] font-bold text-slate-300 uppercase italic">No amenities selected yet</span>}
                    {editingHotel.amenities?.map((am, i) => (
                      <div key={i} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group hover:bg-rose-600 transition-all shadow-sm">
                        {am}
                        <button onClick={() => removeAmenity(i)} className="text-white/40 group-hover:text-white"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Image Upload Area */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Property Photographs</label>
                  <span className="text-[9px] font-bold text-slate-300 uppercase italic">The first image is your cover photo</span>
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-12 border-4 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-all group"
                >
                  <Upload className="w-12 h-12 text-slate-300 group-hover:text-rose-500 mb-4 transition-colors" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-rose-600">Click to Upload Images</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                  {editingHotel.images?.map((img, i) => (
                    <div key={i} className={`relative aspect-video rounded-3xl overflow-hidden group border-4 transition-all duration-300 ${i === 0 ? 'border-rose-500 ring-4 ring-rose-500/20' : 'border-white hover:border-slate-200'}`}>
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />

                      {i === 0 && (
                        <div className="absolute top-3 left-3 bg-rose-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                          <Heart className="w-3 h-3 fill-current" /> Cover Photo
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                        {i !== 0 && (
                          <button
                            onClick={() => setAsCover(i)}
                            className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl flex items-center gap-2"
                          >
                            <Star className="w-4 h-4" /> Set as Cover
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(i)}
                          className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end mt-12 pt-10 border-t-2 border-slate-100">
            <Button variant="outline" onClick={() => setEditingHotel(null)} className="px-10 h-14 rounded-2xl border-2 border-slate-200 font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
              Discard
            </Button>
            <Button onClick={saveHotel} className="gap-3 h-14 px-12 shadow-2xl shadow-rose-500/30 rounded-2xl font-black uppercase tracking-tighter">
              <Save className="w-6 h-6" /> Commit to Database
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {hotels.length === 0 && !editingHotel && (
          <div className="col-span-full py-40 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-200">
            <HotelIcon className="w-20 h-20 mx-auto text-slate-100 mb-8" />
            <h3 className="text-3xl font-black text-slate-300 uppercase tracking-tighter">No Properties Registered</h3>
            <Button onClick={startNew} className="mt-8 px-12 h-16 shadow-xl rounded-2xl text-lg">Start Building Database</Button>
          </div>
        )}
        {hotels.map(hotel => (
          <div key={hotel.id} className="bg-white rounded-[32px] border-2 border-slate-100 overflow-hidden hover:border-slate-900 transition-all duration-500 group flex flex-col">
            <div className="h-56 bg-slate-50 relative overflow-hidden">
              {hotel.images && hotel.images[0] ? (
                <img src={hotel.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={hotel.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon className="w-16 h-16 opacity-10" /></div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <button onClick={() => setEditingHotel(hotel)} className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-xl">
                  <Pencil className="w-5 h-5" />
                </button>
                <button onClick={() => deleteHotel(hotel.id)} className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-red-700 transition-all shadow-xl">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-slate-900 uppercase leading-none text-xl group-hover:text-rose-600 transition-colors">{hotel.name}</h3>
                <div className="flex shrink-0 gap-0.5 mt-1">
                  {[...Array(hotel.stars)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mb-8">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span className="truncate">{hotel.category}</span>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Images</span>
                  <span className="text-xl font-black text-slate-900">{hotel.images?.length || 0}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Features</span>
                  <span className="text-xl font-black text-slate-900">{hotel.amenities?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
