import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Heart, Share2, Bed, Bath, Layout, Home, MessageSquare, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import api from '../utils/api';

const PropertyDetails: React.FC = () => {
  const { id } = useParams();
  const [house, setHouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/houses/${id}`);
        setHouse(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading property details...</div>;
  if (!house) return <div className="p-8 text-center">Property not found</div>;

  return (
    <div className="pb-24 pt-4 px-0 md:px-8 max-w-6xl mx-auto md:pb-12 animate-fade-in">
      
      {/* Title & Actions */}
      <div className="px-4 md:px-0 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{house.title}</h1>
          <p className="text-textSecondary flex items-center gap-1 font-medium">
            <MapPin className="h-4 w-4" /> {house.location.address}, {house.location.area}, {house.location.city}
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 font-medium hover:text-primary transition underline underline-offset-4"><Share2 className="h-4 w-4" /> Share</button>
          <button className="flex items-center gap-2 font-medium hover:text-secondary transition underline underline-offset-4"><Heart className="h-4 w-4" /> Save</button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative w-full h-[300px] md:h-[500px] md:rounded-2xl overflow-hidden bg-gray-100 group">
        <img src={house.images?.[currentImage]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} alt={house.title} className="w-full h-full object-cover" />
        {house.images && house.images.length > 1 && (
          <>
            <button onClick={() => setCurrentImage(prev => prev === 0 ? house.images.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/50 hover:bg-white backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={() => setCurrentImage(prev => prev === house.images.length - 1 ? 0 : prev + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/50 hover:bg-white backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md">
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 backdrop-blur-md px-3 py-1 rounded-full bg-black/20">
              {house.images.map((_: any, i: number) => (
                <div key={i} className={`h-2 w-2 rounded-full ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 px-4 md:px-0">
        
        {/* Main Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="flex justify-between items-center border-b border-border pb-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Hosted by {house.owner?.fullName || 'Host'}</h2>
              <p className="text-textSecondary flex items-center gap-4 text-sm">
                <span>12 Reviews</span>
                <span className="flex items-center gap-1 text-primary"><Star className="h-4 w-4 fill-primary" /> Superhost</span>
              </p>
            </div>
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase shadow-sm">
              {house.owner?.fullName?.charAt(0) || 'H'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            <div className="p-4 border border-border rounded-xl flex items-center gap-3">
               <Home className="h-6 w-6 text-primary" />
               <div className="text-sm">
                 <p className="font-semibold text-textPrimary">{house.propertyType}</p>
                 <p className="text-textSecondary">Type</p>
               </div>
            </div>
            <div className="p-4 border border-border rounded-xl flex items-center gap-3">
               <Bed className="h-6 w-6 text-primary" />
               <div className="text-sm">
                 <p className="font-semibold text-textPrimary">{house.bedrooms}</p>
                 <p className="text-textSecondary">Bedrooms</p>
               </div>
            </div>
            <div className="p-4 border border-border rounded-xl flex items-center gap-3">
               <Bath className="h-6 w-6 text-primary" />
               <div className="text-sm">
                 <p className="font-semibold text-textPrimary">{house.bathrooms}</p>
                 <p className="text-textSecondary">Bathrooms</p>
               </div>
            </div>
            {house.squareFootage && (
              <div className="p-4 border border-border rounded-xl flex items-center gap-3">
                 <Layout className="h-6 w-6 text-primary" />
                 <div className="text-sm">
                   <p className="font-semibold text-textPrimary">{house.squareFootage}</p>
                   <p className="text-textSecondary">Sq Ft</p>
                 </div>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-bold mb-4">About this property</h3>
            <p className="text-textSecondary text-base leading-relaxed">
              {house.description}
            </p>
          </div>

          <div className="border-t border-border pt-6 pb-6">
            <h3 className="text-lg font-bold mb-4">What this place offers</h3>
            <div className="grid grid-cols-2 gap-y-4">
              {house.amenities?.map((amenity: string, i: number) => (
                <div key={i} className="flex items-center gap-3 text-textPrimary font-medium">
                   <div className="h-2 w-2 rounded-full bg-primary/50"></div>
                   {amenity}
                </div>
              ))}
              {(!house.amenities || house.amenities.length === 0) && (
                <p className="text-textSecondary col-span-2">No special amenities listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Action Card */}
        <div className="md:col-span-1">
          <div className="sticky top-24 bg-white border border-border rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col gap-4">
             <div className="flex items-end gap-2 text-2xl font-bold">
               KES {house.pricing.pricePerMonth.toLocaleString()} <span className="text-base text-textSecondary font-normal pb-1">/ month</span>
             </div>
             {house.pricing.securityDeposit && (
               <div className="text-textSecondary text-sm mb-2">
                 + KES {house.pricing.securityDeposit.toLocaleString()} security deposit
               </div>
             )}
             
             <div className="mt-2 space-y-3">
               <button className="btn-primary w-full h-12 text-lg shadow-md hover:-translate-y-0.5 transform">
                 <MessageSquare className="h-5 w-5 mr-2" /> Contact Host
               </button>
               <button className="w-full h-12 font-medium border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors">
                 Save for Later
               </button>
             </div>

             <div className="text-center text-sm text-textSecondary mt-2">
               You won't be charged yet
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
