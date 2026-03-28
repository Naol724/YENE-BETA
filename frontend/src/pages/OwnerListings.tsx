import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, PauseCircle, PlayCircle, Eye, MessageSquare } from 'lucide-react';
import api from '../utils/api';

const OwnerListings: React.FC = () => {
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHouses = async () => {
    try {
      const res = await api.get('/houses/my-listings');
      setHouses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/houses/${id}`);
      setHouses(houses.filter((h) => h._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (house: any) => {
    const newStatus = house.status === 'Active' ? 'Paused' : 'Active';
    try {
      await api.put(`/houses/${house._id}`, { status: newStatus });
      fetchHouses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 md:px-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
        <h2 className="text-2xl font-bold">My Properties</h2>
        <Link to="/owner/listings/new" className="btn-primary h-10 px-4">
          <Plus className="h-4 w-4 mr-2" /> Add Listing
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(n => <div key={n} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : houses.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-xl bg-surface">
          <h3 className="text-xl font-bold mb-2">No properties listed yet</h3>
          <p className="text-textSecondary mb-6">Create your first listing and reach thousands of renters.</p>
          <Link to="/owner/listings/new" className="btn-primary inline-flex">Add Your First Listing</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {houses.map(house => (
            <div key={house._id} className="bg-white border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center shadow-sm">
               <div className="w-full md:w-48 h-32 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                 <img src={house.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} className="w-full h-full object-cover" alt="" />
               </div>
               
               <div className="flex-1 min-w-0 w-full">
                 <div className="flex justify-between items-start">
                   <h3 className="text-lg font-bold text-textPrimary truncate mb-1">{house.title}</h3>
                   <span className={`px-2 py-1 text-xs font-bold rounded ${house.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                     {house.status}
                   </span>
                 </div>
                 <p className="text-sm text-textSecondary mb-3">{house.location.area}, {house.location.city}</p>
                 
                 <div className="flex gap-6 text-sm">
                   <div className="flex items-center text-textSecondary">
                     <Eye className="h-4 w-4 mr-1 text-primary" /> {house.views || 0} Views
                   </div>
                   <div className="flex items-center text-textSecondary">
                     <MessageSquare className="h-4 w-4 mr-1 text-primary" /> Inquiries
                   </div>
                   <div className="font-bold text-primary">
                     KES {house.pricing.pricePerMonth.toLocaleString()}/mo
                   </div>
                 </div>
               </div>

               <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                 <button className="flex-1 md:flex-none flex items-center justify-center gap-2 p-2 px-4 rounded-lg border border-border hover:bg-surface text-sm font-medium">
                   <Edit className="h-4 w-4" /> Edit
                 </button>
                 <button 
                  onClick={() => toggleStatus(house)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 p-2 px-4 rounded-lg border border-border hover:bg-surface text-sm font-medium"
                 >
                   {house.status === 'Active' ? <><PauseCircle className="h-4 w-4" /> Pause</> : <><PlayCircle className="h-4 w-4" /> Activate</>}
                 </button>
                 <button 
                  onClick={() => handleDelete(house._id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 p-2 px-4 rounded-lg border border-red-100 text-error hover:bg-red-50 text-sm font-medium"
                 >
                   <Trash2 className="h-4 w-4" /> Delete
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerListings;
