import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  GripVertical,
  Star,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import api from '../../utils/api';

const STEPS = [
  'Basic Info',
  'Location',
  'Pricing',
  'Details',
  'Photos',
  'Rules',
  'Preview',
] as const;

const PROPERTY_TYPES = ['Apartment', 'House', 'Condo', 'Studio'] as const;

const AMENITY_OPTIONS = [
  'WiFi',
  'Parking',
  'Air conditioning',
  'Swimming Pool',
  'Gym',
  'Security',
  'Elevator',
  'Balcony',
  'Garden',
  'Furnished',
  'Pet friendly',
  'Wheelchair accessible',
  'Hot water',
  'Backup generator',
  'CCTV',
  'Intercom',
  'Kids play area',
  'Rooftop',
  'Study room',
  'Walk-in closet',
  'Hardwood floors',
];

const UTILITIES = ['Water', 'Electricity', 'Internet', 'Gas', 'Trash'] as const;

export type ListingFormState = {
  title: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: string;
  address: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
  pricePerMonth: string;
  securityDeposit: string;
  utilitiesIncluded: string[];
  description: string;
  amenities: string[];
  customAmenity: string;
  images: { url: string; isMain: boolean; name?: string }[];
  checkInTime: string;
  checkOutTime: string;
  petFriendly: boolean;
  smokingAllowed: boolean;
  eventsAllowed: boolean;
  additionalRules: string;
};

const defaultState = (): ListingFormState => ({
  title: '',
  propertyType: 'Apartment',
  bedrooms: 1,
  bathrooms: 1,
  squareFootage: '',
  address: '',
  city: 'Addis Ababa',
  area: '',
  lat: -1.2921,
  lng: 36.8219,
  pricePerMonth: '',
  securityDeposit: '',
  utilitiesIncluded: [],
  description: '',
  amenities: [],
  customAmenity: '',
  images: [],
  checkInTime: '14:00',
  checkOutTime: '10:00',
  petFriendly: false,
  smokingAllowed: false,
  eventsAllowed: false,
  additionalRules: '',
});

type Props = {
  mode: 'create' | 'edit';
  houseId?: string;
  initialHouse?: Record<string, unknown>;
};

export default function ListingWizard({ mode, houseId, initialHouse }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ListingFormState>(defaultState);
  const [loadingHouse, setLoadingHouse] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [premiumInfo, setPremiumInfo] = useState<{
    isPremium: boolean;
    canAddListing: boolean;
    houseCount: number;
  } | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadPremium = useCallback(async () => {
    try {
      const res = await api.get('/premium/check-limit');
      setPremiumInfo(res.data.data);
    } catch {
      setPremiumInfo(null);
    }
  }, []);

  useEffect(() => {
    loadPremium();
  }, [loadPremium]);

  useEffect(() => {
    if (mode !== 'edit' || !initialHouse) return;
    const h = initialHouse as {
      title?: string;
      propertyType?: string;
      bedrooms?: number;
      bathrooms?: number;
      squareFootage?: number;
      location?: { city?: string; area?: string; address?: string; coordinates?: { lat?: number; lng?: number } };
      pricing?: { pricePerMonth?: number; securityDeposit?: number; utilitiesIncluded?: string[] };
      description?: string;
      amenities?: string[];
      images?: { url?: string; isMain?: boolean }[];
      rules?: {
        checkInTime?: string;
        checkOutTime?: string;
        petFriendly?: boolean;
        smokingAllowed?: boolean;
        eventsAllowed?: boolean;
        additionalRules?: string;
      };
    };
    setForm({
      ...defaultState(),
      title: h.title ?? '',
      propertyType: h.propertyType ?? 'Apartment',
      bedrooms: h.bedrooms ?? 1,
      bathrooms: h.bathrooms ?? 1,
      squareFootage: h.squareFootage != null ? String(h.squareFootage) : '',
      city: h.location?.city ?? '',
      area: h.location?.area ?? '',
      address: h.location?.address ?? '',
      lat: h.location?.coordinates?.lat ?? -1.2921,
      lng: h.location?.coordinates?.lng ?? 36.8219,
      pricePerMonth: h.pricing?.pricePerMonth != null ? String(h.pricing.pricePerMonth) : '',
      securityDeposit: h.pricing?.securityDeposit != null ? String(h.pricing.securityDeposit) : '',
      utilitiesIncluded: h.pricing?.utilitiesIncluded ?? [],
      description: h.description ?? '',
      amenities: h.amenities ?? [],
      images: (h.images ?? []).map((im) => ({
        url: im.url ?? '',
        isMain: !!im.isMain,
      })),
      checkInTime: h.rules?.checkInTime ?? '14:00',
      checkOutTime: h.rules?.checkOutTime ?? '10:00',
      petFriendly: h.rules?.petFriendly ?? false,
      smokingAllowed: h.rules?.smokingAllowed ?? false,
      eventsAllowed: h.rules?.eventsAllowed ?? false,
      additionalRules: h.rules?.additionalRules ?? '',
    });
    setLoadingHouse(false);
  }, [mode, initialHouse]);

  const update = <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validateStep = (s: number): string | null => {
    switch (s) {
      case 0:
        if (!form.title.trim()) return 'Title is required';
        if (form.title.length > 100) return 'Title max 100 characters';
        return null;
      case 1:
        if (!form.city.trim() || !form.area.trim() || !form.address.trim()) {
          return 'City, area, and address are required';
        }
        return null;
      case 2:
        if (!form.pricePerMonth || Number(form.pricePerMonth) <= 0) return 'Valid monthly price required';
        return null;
      case 3:
        if (form.description.trim().length < 100) return 'Description must be at least 100 characters';
        return null;
      case 4:
        if (form.images.length === 0) return 'Add at least one photo';
        if (form.images.length > 10) return 'Maximum 10 photos';
        return null;
      default:
        return null;
    }
  };

  const next = () => {
    const err = validateStep(step);
    if (err) {
      alert(err);
      return;
    }
    setStep((x) => Math.min(STEPS.length - 1, x + 1));
  };

  const prev = () => setStep((x) => Math.max(0, x - 1));

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const addCustomAmenity = () => {
    const t = form.customAmenity.trim();
    if (!t || form.amenities.includes(t)) return;
    setForm((f) => ({ ...f, amenities: [...f.amenities, t], customAmenity: '' }));
  };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const next: { url: string; isMain: boolean; name?: string }[] = [...form.images];
    Array.from(files).forEach((file) => {
      if (next.length >= 10) return;
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB`);
        return;
      }
      next.push({
        url: URL.createObjectURL(file),
        isMain: next.length === 0,
        name: file.name,
      });
    });
    setForm((f) => ({ ...f, images: next }));
  };

  const readFileAsDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(blob);
    });

  const buildPayload = async () => {
    const imagesPayload: { url: string; isMain: boolean }[] = [];
    for (let i = 0; i < form.images.length; i++) {
      const img = form.images[i];
      if (img.url.startsWith('blob:')) {
        const res = await fetch(img.url);
        const blob = await res.blob();
        if (blob.size > 450 * 1024) {
          imagesPayload.push({
            url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
            isMain: img.isMain,
          });
        } else {
          const dataUrl = await readFileAsDataUrl(blob);
          imagesPayload.push({ url: dataUrl, isMain: img.isMain });
        }
      } else {
        imagesPayload.push({ url: img.url, isMain: img.isMain });
      }
    }

    return {
      title: form.title.trim(),
      propertyType: form.propertyType,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      squareFootage: form.squareFootage ? Number(form.squareFootage) : undefined,
      location: {
        city: form.city.trim(),
        area: form.area.trim(),
        address: form.address.trim(),
        coordinates: { lat: form.lat, lng: form.lng },
      },
      pricing: {
        pricePerMonth: Number(form.pricePerMonth),
        securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : undefined,
        utilitiesIncluded: form.utilitiesIncluded,
      },
      description: form.description.trim(),
      amenities: form.amenities,
      images: imagesPayload,
      rules: {
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
        petFriendly: form.petFriendly,
        smokingAllowed: form.smokingAllowed,
        eventsAllowed: form.eventsAllowed,
        additionalRules: form.additionalRules || undefined,
      },
      status: 'Active',
    };
  };

  const publish = async () => {
    const err = validateStep(3) || validateStep(4);
    if (err) {
      alert(err);
      return;
    }
    if (mode === 'create' && premiumInfo && !premiumInfo.canAddListing) {
      setShowPremiumModal(true);
      return;
    }
    setSubmitting(true);
    try {
      const payload = await buildPayload();
      if (mode === 'edit' && houseId) {
        await api.put(`/houses/${houseId}`, payload);
      } else {
        await api.post('/houses', payload);
      }
      setSuccess(true);
      try {
        const w = window as Window & { deferredInstallPrompt?: Event & { prompt: () => Promise<void> } };
        if (w.deferredInstallPrompt && mode === 'create') {
          await w.deferredInstallPrompt.prompt();
        }
      } catch {
        /* ignore */
      }
      setTimeout(() => navigate('/owner/listings'), mode === 'create' ? 2200 : 1500);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'response' in e ? (e as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
      alert(msg || 'Could not save listing');
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = () => {
    localStorage.setItem(
      'listing-draft',
      JSON.stringify({ form, step, savedAt: Date.now() })
    );
    alert('Draft saved on this device.');
  };

  const freeRemaining = premiumInfo?.isPremium
    ? 'Unlimited'
    : Math.max(0, 1 - (premiumInfo?.houseCount ?? 0));

  if (loadingHouse) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-fade-in">
        <div className="h-20 w-20 bg-success/15 rounded-full flex items-center justify-center text-success mb-6">
          <CheckCircle2 className="h-10 w-10" aria-hidden />
        </div>
        <h2 className="text-2xl font-bold mb-2">{mode === 'edit' ? 'Listing updated' : 'Listing published!'}</h2>
        <p className="text-textSecondary">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-8 animate-fade-in">
      <h1 className="text-[28px] font-bold mb-2">
        {mode === 'edit' ? 'Edit listing' : 'Add new listing'}
      </h1>
      <p className="text-textSecondary text-sm mb-6">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2" role="list" aria-label="Form progress">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <button
              type="button"
              role="listitem"
              onClick={() => (i < step ? setStep(i) : undefined)}
              className={`flex flex-col items-center min-w-[52px] ${i <= step ? 'text-primary' : 'text-textSecondary'}`}
              aria-current={i === step ? 'step' : undefined}
              aria-label={`Step ${i + 1}: ${label}`}
            >
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  i === step
                    ? 'border-primary bg-primary text-white'
                    : i < step
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-white'
                }`}
              >
                {i + 1}
              </span>
              <span className="text-[10px] mt-1 text-center leading-tight hidden sm:block">{label}</span>
            </button>
            {i < STEPS.length - 1 && <div className="h-0.5 flex-1 min-w-[8px] bg-border mb-6 hidden sm:block" />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 md:p-8 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="title">
                Property title <span className="text-error">*</span>
              </label>
              <input
                id="title"
                className="input-field"
                maxLength={100}
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="e.g. Bright 2BR in Westlands"
              />
              <p className="text-xs text-textSecondary mt-1">{form.title.length}/100</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="ptype">
                Property type
              </label>
              <select
                id="ptype"
                className="input-field"
                value={form.propertyType}
                onChange={(e) => update('propertyType', e.target.value)}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-semibold mb-1">Bedrooms</span>
                <div className="flex items-center gap-2">
                  <button type="button" className="btn-secondary !h-10 !min-w-[40px] !px-0" onClick={() => update('bedrooms', Math.max(0, form.bedrooms - 1))} aria-label="Decrease bedrooms">
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{form.bedrooms}</span>
                  <button type="button" className="btn-secondary !h-10 !min-w-[40px] !px-0" onClick={() => update('bedrooms', Math.min(10, form.bedrooms + 1))} aria-label="Increase bedrooms">
                    +
                  </button>
                </div>
              </div>
              <div>
                <span className="block text-sm font-semibold mb-1">Bathrooms</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary !h-10 !min-w-[40px] !px-0"
                    onClick={() => update('bathrooms', Math.max(0, Number((form.bathrooms - 0.5).toFixed(1))))}
                    aria-label="Decrease bathrooms"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-semibold">{form.bathrooms}</span>
                  <button
                    type="button"
                    className="btn-secondary !h-10 !min-w-[40px] !px-0"
                    onClick={() => update('bathrooms', Math.min(10, Number((form.bathrooms + 0.5).toFixed(1))))}
                    aria-label="Increase bathrooms"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="sqft">
                Square footage (optional)
              </label>
              <input
                id="sqft"
                type="number"
                min={0}
                className="input-field"
                value={form.squareFootage}
                onChange={(e) => update('squareFootage', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-textSecondary">
              Enter address details. Google Places autocomplete can be wired later. Set coordinates for map search & discovery.
            </p>
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="addr">
                Street address <span className="text-error">*</span>
              </label>
              <input
                id="addr"
                className="input-field"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="Road, building, unit"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="city">
                  City <span className="text-error">*</span>
                </label>
                <input id="city" className="input-field" value={form.city} onChange={(e) => update('city', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="area">
                  Area / neighborhood <span className="text-error">*</span>
                </label>
                <input id="area" className="input-field" value={form.area} onChange={(e) => update('area', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="lat">
                  Latitude
                </label>
                <input
                  id="lat"
                  type="number"
                  step="any"
                  className="input-field"
                  value={form.lat}
                  onChange={(e) => update('lat', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="lng">
                  Longitude
                </label>
                <input
                  id="lng"
                  type="number"
                  step="any"
                  className="input-field"
                  value={form.lng}
                  onChange={(e) => update('lng', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <p className="text-xs text-textSecondary">
              Tip: pick coordinates from Google Maps (right-click → copy coordinates) for accuracy.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="price">
                Price per month (KES) <span className="text-error">*</span>
              </label>
              <input
                id="price"
                type="number"
                min={1}
                className="input-field"
                value={form.pricePerMonth}
                onChange={(e) => update('pricePerMonth', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="dep">
                Security deposit (optional)
              </label>
              <input
                id="dep"
                type="number"
                min={0}
                className="input-field"
                value={form.securityDeposit}
                onChange={(e) => update('securityDeposit', e.target.value)}
              />
            </div>
            <fieldset>
              <legend className="text-sm font-semibold mb-2">Utilities included</legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {UTILITIES.map((u) => (
                  <label key={u} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.utilitiesIncluded.includes(u)}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          utilitiesIncluded: f.utilitiesIncluded.includes(u)
                            ? f.utilitiesIncluded.filter((x) => x !== u)
                            : [...f.utilitiesIncluded, u],
                        }))
                      }
                    />
                    {u}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="desc">
                Description <span className="text-error">*</span> (min 100 characters)
              </label>
              <textarea
                id="desc"
                className="w-full border border-border rounded-lg p-4 min-h-[160px] focus:ring-2 focus:ring-primary"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                minLength={100}
              />
              <p className="text-xs text-textSecondary mt-1">{form.description.length} characters</p>
            </div>
            <fieldset>
              <legend className="text-sm font-semibold mb-2">Amenities</legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto border border-border rounded-lg p-3">
                {AMENITY_OPTIONS.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                    {a}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Add custom amenity"
                value={form.customAmenity}
                onChange={(e) => update('customAmenity', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
              />
              <button type="button" className="btn-secondary !h-12" onClick={addCustomAmenity}>
                Add
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-xl p-10 cursor-pointer bg-surface hover:bg-primary/5 transition-colors">
              <Upload className="h-10 w-10 text-primary mb-2" aria-hidden />
              <span className="font-semibold text-primary">Click or drag photos here</span>
              <span className="text-xs text-textSecondary mt-1">Up to 10 images, 5MB each</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {form.images.map((img, idx) => (
                <div key={img.url + idx} className="relative group rounded-lg overflow-hidden border border-border aspect-[4/3]">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      className="flex-1 text-xs text-white py-1 flex items-center justify-center gap-0.5"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          images: f.images.map((im, j) => ({ ...im, isMain: j === idx })),
                        }))
                      }
                    >
                      <Star className="h-3 w-3" /> Main
                    </button>
                    <button
                      type="button"
                      className="text-white p-1"
                      aria-label="Move up"
                      onClick={() =>
                        idx > 0 &&
                        setForm((f) => {
                          const arr = [...f.images];
                          [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                          return { ...f, images: arr };
                        })
                      }
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="text-error text-xs px-1"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          images: f.images.filter((_, j) => j !== idx),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                  {img.isMain && (
                    <span className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="ci">
                  Check-in
                </label>
                <input id="ci" type="time" className="input-field" value={form.checkInTime} onChange={(e) => update('checkInTime', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="co">
                  Check-out
                </label>
                <input id="co" type="time" className="input-field" value={form.checkOutTime} onChange={(e) => update('checkOutTime', e.target.value)} />
              </div>
            </div>
            {[
              ['petFriendly', 'Pet friendly', form.petFriendly],
              ['smokingAllowed', 'Smoking allowed', form.smokingAllowed],
              ['eventsAllowed', 'Events allowed', form.eventsAllowed],
            ].map(([key, label, val]) => (
              <label key={key as string} className="flex items-center justify-between gap-4 py-2 border-b border-border">
                <span className="font-medium">{label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={val as boolean}
                  onClick={() => update(key as keyof ListingFormState, !val as never)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${val ? 'bg-primary' : 'bg-border'}`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${val ? 'left-6' : 'left-1'}`}
                  />
                </button>
              </label>
            ))}
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="more">
                Additional rules
              </label>
              <textarea
                id="more"
                className="w-full border border-border rounded-lg p-3 min-h-[80px]"
                value={form.additionalRules}
                onChange={(e) => update('additionalRules', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            {!premiumInfo?.isPremium && (
              <div
                className={`rounded-xl p-4 border ${premiumInfo && !premiumInfo.canAddListing ? 'border-warning bg-warning/10' : 'border-border bg-surface'}`}
              >
                <p className="font-semibold text-textPrimary">Free listings remaining: {freeRemaining}</p>
                {premiumInfo && !premiumInfo.canAddListing && (
                  <p className="text-sm text-textSecondary mt-2">
                    You&apos;ve used your free listing. Upgrade to Premium to add more.
                  </p>
                )}
              </div>
            )}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="aspect-video bg-surface">
                <img
                  src={form.images.find((i) => i.isMain)?.url || form.images[0]?.url || ''}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold">{form.title || 'Untitled'}</h3>
                <p className="text-textSecondary text-sm">
                  {form.area}, {form.city}
                </p>
                <p className="text-2xl font-bold text-primary mt-2">KES {form.pricePerMonth || '—'}/mo</p>
                <p className="text-sm mt-3 line-clamp-4">{form.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-secondary !bg-white !text-textPrimary border border-border" onClick={saveDraft}>
                Save draft
              </button>
              <button
                type="button"
                className="btn-primary flex-1 min-w-[200px]"
                disabled={submitting}
                onClick={publish}
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === 'edit' ? 'Update listing' : 'Publish'}
              </button>
            </div>
          </div>
        )}

        {step < 6 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0}
              className="flex items-center gap-1 text-textSecondary disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" /> Back
            </button>
            <button type="button" onClick={next} className="btn-primary flex items-center gap-1">
              Next <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {showPremiumModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="prem-title">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 id="prem-title" className="text-xl font-bold mb-2">
              Upgrade to Premium
            </h2>
            <p className="text-textSecondary text-sm mb-4">Unlimited listings, featured placement, verified badge, and more.</p>
            <div className="flex gap-3">
              <button type="button" className="btn-primary flex-1" onClick={() => navigate('/owner/premium')}>
                Upgrade now
              </button>
              <button type="button" className="btn-secondary flex-1 !bg-surface !text-textPrimary border border-border" onClick={() => setShowPremiumModal(false)}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
