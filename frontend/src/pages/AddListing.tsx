import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

const AddListing: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    propertyType: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: '',
    city: '',
    area: '',
    address: '',
    pricePerMonth: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Structure payload based on Schema
    const payload = {
      title: formData.title,
      propertyType: formData.propertyType,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      squareFootage: Number(formData.squareFootage) || undefined,
      location: {
        city: formData.city,
        area: formData.area,
        address: formData.address
      },
      pricing: {
        pricePerMonth: Number(formData.pricePerMonth),
      },
      description: formData.description,
      images: [
        { url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa', isMain: true }
      ]
    };

    try {
      await api.post('/houses', payload);
      setSuccess(true);
      setTimeout(() => navigate('/owner/listings'), 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating listing');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-fade-in">
        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Listing Published!</h2>
        <p className="text-textSecondary">Your property is now live and visible to renters.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 px-4 md:px-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold mb-6">Add New Property</h2>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-2xl border border-border shadow-sm">
        
        {/* Basic Info */}
        <section>
          <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Property Title</label>
              <input name="title" required value={formData.title} onChange={handleChange} className="input-field" placeholder="e.g. Modern 3BR Apartment in Kilimani" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Property Type</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="input-field">
                <option>Apartment</option>
                <option>House</option>
                <option>Condo</option>
                <option>Studio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Price Per Month (KES)</label>
              <input type="number" name="pricePerMonth" required value={formData.pricePerMonth} onChange={handleChange} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Bedrooms</label>
              <input type="number" name="bedrooms" required min="1" max="10" value={formData.bedrooms} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Bathrooms</label>
              <input type="number" name="bathrooms" required min="1" max="10" step="0.5" value={formData.bathrooms} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </section>

        {/* Location */}
        <section>
          <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">City</label>
              <input name="city" required value={formData.city} onChange={handleChange} className="input-field" placeholder="e.g. Nairobi" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Area / Neighborhood</label>
              <input name="area" required value={formData.area} onChange={handleChange} className="input-field" placeholder="e.g. Westlands" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Detailed Address</label>
              <input name="address" required value={formData.address} onChange={handleChange} className="input-field" placeholder="Street layout, building name" />
            </div>
          </div>
        </section>

        {/* Details */}
        <section>
          <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">Description & Photos</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Description (min 100 chars)</label>
              <textarea name="description" required minLength={100} value={formData.description} onChange={handleChange} className="w-full border border-border rounded-lg p-4 focus:ring-2 focus:ring-primary min-h-[120px] resize-y" placeholder="Describe the property's features, nearby amenities, etc...">
              </textarea>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Upload Photos</label>
              <div className="border-2 border-dashed border-primary rounded-xl p-8 flex flex-col items-center justify-center text-center bg-blue-50/50 cursor-pointer hover:bg-blue-50 transition-colors">
                <UploadCloud className="h-10 w-10 text-primary mb-2" />
                <p className="font-semibold text-primary">Click to upload or drag and drop</p>
                <p className="text-xs text-textSecondary mt-1">SVG, PNG, JPG (max 10MB each)</p>
                <div className="mt-4 px-3 py-1 bg-warning text-xs font-bold rounded shadow-sm text-black">
                   Note: Dynamic Image Uploading via Cloudinary is simulated.
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-4 border-t border-border flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/owner/listings')} className="btn-secondary !bg-white !text-textPrimary border border-border hover:!bg-gray-100">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary w-40">
            {loading ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddListing;
