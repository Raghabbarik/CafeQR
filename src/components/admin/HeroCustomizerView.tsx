import React, { useState, useEffect } from 'react';
import type { CafeInfo } from '../../types';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  Save, 
  CheckCircle, 
  Smartphone, 
  ArrowRight,
  Upload,
  Trash2
} from 'lucide-react';

interface HeroCustomizerViewProps {
  cafe: CafeInfo;
  onSave: (updates: Partial<CafeInfo>) => Promise<void>;
}

// Client-side canvas image compression to ensure instant uploads & prevent quota errors
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let { width, height } = img;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
        resolve(compressedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const HeroCustomizerView: React.FC<HeroCustomizerViewProps> = ({
  cafe,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    coverImage: cafe.coverImage || cafe.hero?.coverImage || '',
    logo: cafe.logo || '',
    name: cafe.name || 'The Roasted Bean Cafe',
    heroBadge: cafe.hero?.badge || 'NEW',
    heroTitle: cafe.hero?.title || 'ICED\nMATCHA\nLATTE',
    heroCardTitle: cafe.hero?.cardTitle || 'Welcome Back',
    heroCardSubtitle: cafe.hero?.cardSubtitle || 'Explore our Fall menu',
    heroButtonText: cafe.hero?.buttonText || 'Order Now',
  });

  // Sync with incoming cafe data from cloud (always prioritizing admin's uploaded image)
  useEffect(() => {
    if (cafe) {
      setFormData({
        coverImage: cafe.coverImage || cafe.hero?.coverImage || '',
        logo: cafe.logo || '',
        name: cafe.name || 'The Roasted Bean Cafe',
        heroBadge: cafe.hero?.badge || 'NEW',
        heroTitle: cafe.hero?.title || 'ICED\nMATCHA\nLATTE',
        heroCardTitle: cafe.hero?.cardTitle || 'Welcome Back',
        heroCardSubtitle: cafe.hero?.cardSubtitle || 'Explore our Fall menu',
        heroButtonText: cafe.hero?.buttonText || 'Order Now',
      });
    }
  }, [cafe]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Suggested curated cafe hero background presets (pure coffee / cafe themes)
  const presets = [
    {
      label: 'Artisanal Espresso Bar',
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1400&auto=format&fit=crop&q=85',
    },
    {
      label: 'Cozy Cafe Interior',
      url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1400&auto=format&fit=crop&q=85',
    },
    {
      label: 'Iced Cold Brew & Cream',
      url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=1400&auto=format&fit=crop&q=85',
    },
    {
      label: 'Bakery & Fresh Croissants',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&auto=format&fit=crop&q=85',
    },
  ];

  const handlePresetSelect = (url: string) => {
    // Replaces previous image with newly chosen preset
    setFormData((prev) => ({ ...prev, coverImage: url }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImageFile(file);
        // Completely replaces previous image with new uploaded photo
        setFormData((prev) => ({ ...prev, coverImage: compressedBase64 }));
      } catch (err) {
        console.error('Failed to process image:', err);
        alert('Could not read the selected image file. Please try another image.');
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, coverImage: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates = {
        name: formData.name,
        logo: formData.logo,
        coverImage: formData.coverImage,
        hero: {
          badge: formData.heroBadge,
          title: formData.heroTitle,
          cardTitle: formData.heroCardTitle,
          cardSubtitle: formData.heroCardSubtitle,
          buttonText: formData.heroButtonText,
          coverImage: formData.coverImage,
        },
      };

      try {
        if (formData.coverImage) {
          localStorage.setItem('cafeqr_admin_cover_image', formData.coverImage);
          localStorage.setItem('cafeqr_hero_cover', formData.coverImage);
        } else {
          localStorage.removeItem('cafeqr_admin_cover_image');
          localStorage.removeItem('cafeqr_hero_cover');
        }
      } catch {}

      await onSave(updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update hero settings:', err);
      alert('Failed to save hero settings. Please check console.');
    } finally {
      setIsSaving(false);
    }
  };

  const previewTitleLines = formData.heroTitle.split('\n');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-sm border border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Hero / Welcome Page Customizer</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                Live Supabase Synced
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              Customize everything your customers see when they scan the QR code before opening the menu.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span>Saved to Supabase!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Hero Changes'}</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Editor Form on Left + Live Mobile Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form Controls (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
          
          {/* Section 1: Hero Background Image */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <ImageIcon className="w-4 h-4 text-amber-700" />
              <h3 className="font-extrabold text-stone-900 text-sm">Hero Background Cover Image</h3>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Background Image URL (Full-Bleed Cover)
                </label>
                <div className="flex items-center gap-2">
                  {formData.coverImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors shadow-2xs cursor-pointer"
                      title="Remove background image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                  <label className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <input
                type="text"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://... or upload image"
                className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 text-xs font-mono"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Uploading a new photo completely removes the previous image and updates all customer screens live.
              </p>
            </div>

            {/* Curated Presets */}
            <div>
              <p className="text-[11px] font-bold text-stone-500 mb-2">Or Choose from Curated Themes:</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => handlePresetSelect(preset.url)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      formData.coverImage === preset.url
                        ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Badge & Main Headline Title */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <Type className="w-4 h-4 text-amber-700" />
              <h3 className="font-extrabold text-stone-900 text-sm">Badge & Center Headline</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Highlight Pill Badge Text
                </label>
                <input
                  type="text"
                  value={formData.heroBadge}
                  onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
                  placeholder="e.g. NEW or ✦ TODAY'S SPECIAL"
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 text-xs font-bold"
                />
                <p className="text-[10px] text-stone-400 mt-1">Shown in the pastel lime pill above title</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Action Button Text
                </label>
                <input
                  type="text"
                  value={formData.heroButtonText}
                  onChange={(e) => setFormData({ ...formData, heroButtonText: e.target.value })}
                  placeholder="e.g. Order Now"
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 text-xs font-bold"
                />
                <p className="text-[10px] text-stone-400 mt-1">Bottom card main action button</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Main Hero Headline Title (Separate lines with Enter)
              </label>
              <textarea
                rows={3}
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                placeholder={'ICED\nMATCHA\nLATTE'}
                className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 text-sm font-black uppercase tracking-wider font-mono"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Each line will render in bold uppercase typography stacked in the center.
              </p>
            </div>
          </div>

          {/* Section 3: Bottom Welcome Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <Type className="w-4 h-4 text-amber-700" />
              <h3 className="font-extrabold text-stone-900 text-sm">Bottom Welcome Card Content</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Card Heading
                </label>
                <input
                  type="text"
                  value={formData.heroCardTitle}
                  onChange={(e) => setFormData({ ...formData, heroCardTitle: e.target.value })}
                  placeholder="e.g. Welcome Back"
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Card Subtitle
                </label>
                <input
                  type="text"
                  value={formData.heroCardSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroCardSubtitle: e.target.value })}
                  placeholder="e.g. Explore our Fall menu"
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Cafe Logo & Name */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <h3 className="font-extrabold text-stone-900 text-sm">Center Cafe Logo & Branding</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Cafe Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Cafe Logo URL
                </label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-300 outline-none focus:border-amber-600 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-extrabold text-sm shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span>Hero Settings Saved Successfully!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isSaving ? 'Saving to Database...' : 'Save & Publish Hero Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Interactive Phone Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3 text-stone-600 text-xs font-bold">
            <Smartphone className="w-4 h-4 text-amber-700" />
            <span>Customer Mobile Preview</span>
          </div>

          {/* Phone Frame Mockup */}
          <div className="w-[300px] h-[580px] bg-black rounded-[44px] p-3 shadow-2xl border-4 border-stone-800 relative flex flex-col overflow-hidden">
            
            {/* Top speaker notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-40" />

            {/* Inner Phone Screen */}
            <div className="w-full h-full rounded-[34px] overflow-hidden relative flex flex-col justify-between bg-stone-900 select-none">
              
              {/* Background Image Preview */}
              <div className="absolute inset-0 z-0 bg-[#16100d]">
                {formData.coverImage ? (
                  <img
                    src={formData.coverImage}
                    alt="Preview"
                    className="w-full h-full object-cover object-center brightness-95"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-[#251b17] via-[#1a120e] to-[#0d0908] flex items-center justify-center p-4 text-center">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">No Background Image Set</span>
                  </div>
                )}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Status bar mock */}
              <div className="relative z-20 px-4 pt-3 flex justify-between items-center text-[10px] text-white/70 font-mono">
                <span>9:41</span>
                <span>5G 100%</span>
              </div>

              {/* Center Content */}
              <div className="relative z-10 flex flex-col items-center text-center px-4 my-auto">
                {/* Logo */}
                <div className="w-16 h-16 rounded-full p-1 bg-white/25 backdrop-blur-md border border-white/60 shadow-xl overflow-hidden mb-2">
                  <img
                    src={formData.logo || cafe.logo}
                    alt={formData.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <p className="text-white/95 text-[9px] font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-md">
                  {formData.name}
                </p>

                {/* Badge */}
                {formData.heroBadge && (
                  <div className="inline-flex items-center gap-1 bg-[#eaf49f] text-[#2c3e1e] font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm mb-2">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                    <span>{formData.heroBadge}</span>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-2xl font-black text-white tracking-widest leading-[1.08] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                  {previewTitleLines.map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < previewTitleLines.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h1>
              </div>

              {/* Bottom Card */}
              <div className="relative z-20 w-full">
                <div className="bg-white rounded-t-[28px] p-4 shadow-xl flex flex-col items-center text-center space-y-2.5">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-extrabold text-[#111111]">
                      {formData.heroCardTitle}
                    </h2>
                    <p className="text-[10px] text-stone-500 font-medium">
                      {formData.heroCardSubtitle}
                    </p>
                  </div>

                  {/* Slide to Order Mockup */}
                  <div className="w-full bg-[#111111] text-white rounded-full p-1 flex items-center shadow-md relative overflow-hidden">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-900 shadow-md shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-stone-900 stroke-[2.5]" />
                    </div>
                    <span className="flex-1 text-center font-bold text-[11px] pr-2 tracking-wide uppercase">
                      {formData.heroButtonText} ››
                    </span>
                  </div>

                  <div className="text-[9px] text-stone-400 font-medium pt-0.5 flex items-center justify-center gap-1.5">
                    <span>Wi-Fi: {cafe.wifiSsid || 'Active'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <p className="text-[11px] text-stone-400 mt-2 font-medium">Instant live preview</p>
        </div>

      </div>
    </div>
  );
};