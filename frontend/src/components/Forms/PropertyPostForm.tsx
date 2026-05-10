import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Upload,
  Camera,
  MapPin,
  Home,
  DollarSign,
  Phone,
  Check,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RootState } from '../../store';
import api from '../../utils/api';

interface PropertyPostFormProps {
  mode?: 'create' | 'edit';
  initialData?: any;
  onSuccess?: (property: any) => void;
  onCancel?: () => void;
}

interface FormData {
  title: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: string;
  location: {
    city: string;
    area: string;
    address: string;
  };
  pricing: {
    pricePerMonth: string;
    currency: string;
    securityDeposit: string;
    utilitiesIncluded: string[];
    paymentFrequency: string;
  };
  description: string;
  amenities: string[];
  customAmenities: string[];
  images: Array<{
    url: string;
    isMain: boolean;
    caption: string;
    public_id?: string;
  }>;
  contact: {
    phone: string;
    whatsapp: string;
    ownerName: string;
  };
  rules: {
    checkInTime: string;
    checkOutTime: string;
    petFriendly: boolean;
    smokingAllowed: boolean;
    eventsAllowed: boolean;
    additionalRules: string;
  };
  status: string;
  availability: {
    availableFrom: string;
    minimumStay: string;
    maximumStay: string;
  };
}

const PropertyPostForm: React.FC<PropertyPostFormProps> = ({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || '',
    propertyType: initialData?.propertyType || 'Apartment',
    bedrooms: initialData?.bedrooms || 1,
    bathrooms: initialData?.bathrooms || 1,
    squareFootage: initialData?.squareFootage || '',
    location: {
      city: initialData?.location?.city || 'Addis Ababa',
      area: initialData?.location?.area || '',
      address: initialData?.location?.address || ''
    },
    pricing: {
      pricePerMonth: initialData?.pricing?.pricePerMonth || '',
      currency: initialData?.pricing?.currency || 'ETB',
      securityDeposit: initialData?.pricing?.securityDeposit || '',
      utilitiesIncluded: initialData?.pricing?.utilitiesIncluded || [],
      paymentFrequency: initialData?.pricing?.paymentFrequency || 'Monthly'
    },
    description: initialData?.description || '',
    amenities: initialData?.amenities || [],
    customAmenities: initialData?.customAmenities || [],
    images: initialData?.images || [],
    contact: {
      phone: initialData?.contact?.phone || user?.phone || '',
      whatsapp: initialData?.contact?.whatsapp || '',
      ownerName: initialData?.contact?.ownerName || user?.fullName || ''
    },
    rules: {
      checkInTime: initialData?.rules?.checkInTime || '14:00',
      checkOutTime: initialData?.rules?.checkOutTime || '10:00',
      petFriendly: initialData?.rules?.petFriendly || false,
      smokingAllowed: initialData?.rules?.smokingAllowed || false,
      eventsAllowed: initialData?.rules?.eventsAllowed || false,
      additionalRules: initialData?.rules?.additionalRules || ''
    },
    status: initialData?.status || 'Available',
    availability: {
      availableFrom: initialData?.availability?.availableFrom || new Date().toISOString().split('T')[0],
      minimumStay: initialData?.availability?.minimumStay || '1',
      maximumStay: initialData?.availability?.maximumStay || ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragActive, setDragActive] = useState(false);
  
  const propertyTypes = ['Apartment', 'Villa', 'Studio', 'Family house', 'Single room', 'House', 'Condo'];
  const currencies = ['ETB', 'USD', 'EUR'];
  const paymentFrequencies = ['Monthly', 'Quarterly', 'Annually'];
  const cities = ['Addis Ababa', 'Mekelle', 'Gondar', 'Bahir Dar', 'Hawassa', 'Dire Dawa', 'Adama'];
  const utilities = ['Water', 'Electricity', 'Internet', 'Gas', 'Trash'];
  const amenities = [
    'WiFi', 'Water', 'Electricity', 'Security', 'Furnished', 'Balcony',
    'Parking', 'Air conditioning', 'Swimming Pool', 'Gym', 'Elevator',
    'Garden', 'Pet friendly', 'Wheelchair accessible', 'Hot water',
    'Backup generator', 'CCTV', 'Intercom', 'Kids play area', 'Rooftop',
    'Study room', 'Walk-in closet', 'Hardwood floors', 'Kitchen',
    'Laundry room', 'Storage', 'Dishwasher', 'Refrigerator',
    'Microwave', 'Oven', 'Stove', 'Washer', 'Dryer'
  ];

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Basic info validation
    if (!formData.title.trim()) {
      newErrors.title = 'Property title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    // Location validation
    if (!formData.location.area.trim()) {
      newErrors.area = 'Area/sub-city is required';
    }
    if (!formData.location.address.trim()) {
      newErrors.address = 'Full address is required';
    }

    // Pricing validation
    if (!formData.pricing.pricePerMonth || parseFloat(formData.pricing.pricePerMonth) <= 0) {
      newErrors.pricePerMonth = 'Valid monthly price is required';
    }
    if (formData.pricing.securityDeposit && parseFloat(formData.pricing.securityDeposit) < 0) {
      newErrors.securityDeposit = 'Security deposit cannot be negative';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    } else if (formData.description.length > 3000) {
      newErrors.description = 'Description cannot exceed 3000 characters';
    }

    // Images validation
    if (formData.images.length === 0) {
      newErrors.images = 'At least one property image is required';
    }

    // Contact validation
    if (!formData.contact.phone.trim()) {
      newErrors.phone = 'Contact phone number is required';
    } else if (!/^(\+?\d{1,3}[- ]?)?\d{10}$/.test(formData.contact.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.contact.whatsapp && !/^(\+?\d{1,3}[- ]?)?\d{10}$/.test(formData.contact.whatsapp)) {
      newErrors.whatsapp = 'Please enter a valid WhatsApp number';
    }
    if (!formData.contact.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }

    // Square footage validation
    if (formData.squareFootage && (parseFloat(formData.squareFootage) < 0 || isNaN(parseFloat(formData.squareFootage)))) {
      newErrors.squareFootage = 'Please enter a valid square footage';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof FormData] as any),
        [field]: value
      }
    }));
    if (errors[`${parent}.${field}`]) {
      setErrors(prev => ({ ...prev, [`${parent}.${field}`]: '' }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleUtilityToggle = (utility: string) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        utilitiesIncluded: prev.pricing.utilitiesIncluded.includes(utility)
          ? prev.pricing.utilitiesIncluded.filter(u => u !== utility)
          : [...prev.pricing.utilitiesIncluded, utility]
      }
    }));
  };

  const handleImageUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      toast.error('Please select valid image files (JPEG, PNG, WebP) under 5MB');
      return;
    }

    if (formData.images.length + validFiles.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const response = await api.post('/upload/property-image', formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        });

        if (response.data.success) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, response.data.data]
          }));
          toast.success(`${file.name} uploaded successfully`);
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSetMainImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isMain: i === index
      }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        pricing: {
          ...formData.pricing,
          pricePerMonth: parseFloat(formData.pricing.pricePerMonth),
          securityDeposit: formData.pricing.securityDeposit ? parseFloat(formData.pricing.securityDeposit) : undefined
        },
        squareFootage: formData.squareFootage ? parseFloat(formData.squareFootage) : undefined,
        availability: {
          ...formData.availability,
          minimumStay: parseInt(formData.availability.minimumStay),
          maximumStay: formData.availability.maximumStay ? parseInt(formData.availability.maximumStay) : undefined
        }
      };

      let response;
      if (mode === 'create') {
        response = await api.post('/houses', payload);
      } else {
        response = await api.put(`/houses/${initialData._id}`, payload);
      }

      if (response.data.success) {
        toast.success(`Property ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        onSuccess?.(response.data.data);
        navigate(mode === 'create' ? '/owner/listings' : `/owner/listings/${response.data.data._id}`);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        setErrors(backendErrors.reduce((acc: Record<string, string>, err: string) => {
          acc[err.split(' ')[0].toLowerCase()] = err;
          return acc;
        }, {}));
      }
      toast.error(error.response?.data?.message || 'Failed to save property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-mobile">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {mode === 'create' ? 'Post New Property' : 'Edit Property'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {mode === 'create' ? 'List your rental property for tenants' : 'Update your property information'}
                </p>
              </div>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Home className="w-5 h-5 mr-2 text-primary" />
                Basic Information
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="e.g., Modern 2-Bedroom Apartment in Bole"
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    className="input-field"
                  >
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Bedrooms and Bathrooms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms *
                    </label>
                    <select
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                      className="input-field"
                    >
                      {[...Array(21)].map((_, i) => (
                        <option key={i} value={i}>{i} {i === 1 ? 'Bedroom' : 'Bedrooms'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms *
                    </label>
                    <select
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                      className="input-field"
                    >
                      {[...Array(21)].map((_, i) => (
                        <option key={i} value={i}>{i} {i === 1 ? 'Bathroom' : 'Bathrooms'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Square Footage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Square Footage (optional)
                  </label>
                  <input
                    type="number"
                    value={formData.squareFootage}
                    onChange={(e) => handleInputChange('squareFootage', e.target.value)}
                    className={`input-field ${errors.squareFootage ? 'border-red-500' : ''}`}
                    placeholder="e.g., 850"
                    min="0"
                  />
                  {errors.squareFootage && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.squareFootage}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Location Information
              </h2>

              <div className="space-y-4">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    value={formData.location.city}
                    onChange={(e) => handleNestedInputChange('location', 'city', e.target.value)}
                    className="input-field"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Area/Sub-city */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area/Sub-city *
                  </label>
                  <input
                    type="text"
                    value={formData.location.area}
                    onChange={(e) => handleNestedInputChange('location', 'area', e.target.value)}
                    className={`input-field ${errors.area ? 'border-red-500' : ''}`}
                    placeholder="e.g., Bole, Kazanchis, Piassa"
                    maxLength={50}
                  />
                  {errors.area && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.area}
                    </p>
                  )}
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <textarea
                    value={formData.location.address}
                    onChange={(e) => handleNestedInputChange('location', 'address', e.target.value)}
                    className={`input-field min-h-[100px] resize-y ${errors.address ? 'border-red-500' : ''}`}
                    placeholder="Enter the complete address including street name and landmarks"
                    maxLength={200}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-primary" />
                Pricing Information
              </h2>

              <div className="space-y-4">
                {/* Price and Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Rent *
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.pricePerMonth}
                      onChange={(e) => handleNestedInputChange('pricing', 'pricePerMonth', e.target.value)}
                      className={`input-field ${errors.pricePerMonth ? 'border-red-500' : ''}`}
                      placeholder="e.g., 15000"
                      min="0"
                      step="0.01"
                    />
                    {errors.pricePerMonth && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.pricePerMonth}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.pricing.currency}
                      onChange={(e) => handleNestedInputChange('pricing', 'currency', e.target.value)}
                      className="input-field"
                    >
                      {currencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Security Deposit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Deposit (optional)
                  </label>
                  <input
                    type="number"
                    value={formData.pricing.securityDeposit}
                    onChange={(e) => handleNestedInputChange('pricing', 'securityDeposit', e.target.value)}
                    className={`input-field ${errors.securityDeposit ? 'border-red-500' : ''}`}
                    placeholder="e.g., 30000"
                    min="0"
                    step="0.01"
                  />
                  {errors.securityDeposit && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.securityDeposit}
                    </p>
                  )}
                </div>

                {/* Payment Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Frequency
                  </label>
                  <select
                    value={formData.pricing.paymentFrequency}
                    onChange={(e) => handleNestedInputChange('pricing', 'paymentFrequency', e.target.value)}
                    className="input-field"
                  >
                    {paymentFrequencies.map(frequency => (
                      <option key={frequency} value={frequency}>{frequency}</option>
                    ))}
                  </select>
                </div>

                {/* Utilities Included */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilities Included
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {utilities.map(utility => (
                      <label key={utility} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.pricing.utilitiesIncluded.includes(utility)}
                          onChange={() => handleUtilityToggle(utility)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">{utility}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Property Description</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`input-field min-h-[150px] resize-y ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Describe your property, its features, location benefits, and what makes it special..."
                  maxLength={3000}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {formData.description.length}/3000 characters
                  </span>
                  {errors.description && (
                    <span className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-primary" />
                Property Images
              </h2>

              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 md:p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 mb-2 text-sm sm:text-base">
                  <span className="hidden sm:inline">Drag and drop images here, or click to browse</span>
                  <span className="sm:hidden">Tap to select images</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  JPEG, PNG, WebP up to 5MB each (max 10 images)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="btn-primary cursor-pointer inline-block text-xs sm:text-sm"
                >
                  Select Images
                </label>
              </div>

              {errors.images && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.images}
                </p>
              )}

              {/* Uploaded Images */}
              {formData.images.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Uploaded Images ({formData.images.length}/10)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={image.url}
                            alt={`Property image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Main Image Badge */}
                        {image.isMain && (
                          <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                            Main
                          </div>
                        )}

                        {/* Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            {!image.isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(index)}
                                className="p-1 sm:p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                                title="Set as main image"
                              >
                                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleImageRemove(index)}
                              className="p-1 sm:p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                              title="Remove image"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                            </button>
                          </div>
                        </div>

                        {/* Upload Progress */}
                        {uploadProgress[image.url] && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                            Uploading... {uploadProgress[image.url]}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Amenities & Features</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenities.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary" />
                Contact Information
              </h2>

              <div className="space-y-4">
                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    value={formData.contact.ownerName}
                    onChange={(e) => handleNestedInputChange('contact', 'ownerName', e.target.value)}
                    className={`input-field ${errors.ownerName ? 'border-red-500' : ''}`}
                    placeholder="Your full name"
                    maxLength={100}
                  />
                  {errors.ownerName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.ownerName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => handleNestedInputChange('contact', 'phone', e.target.value)}
                    className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+251 9XX XXX XXX"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number (optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.whatsapp}
                    onChange={(e) => handleNestedInputChange('contact', 'whatsapp', e.target.value)}
                    className={`input-field ${errors.whatsapp ? 'border-red-500' : ''}`}
                    placeholder="+251 9XX XXX XXX"
                  />
                  {errors.whatsapp && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.whatsapp}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {mode === 'create' ? 'Creating Property...' : 'Updating Property...'}
                  </div>
                ) : (
                  mode === 'create' ? 'Create Property Listing' : 'Update Property Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyPostForm;
