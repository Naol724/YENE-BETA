import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Trash2, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const ListingModeration: React.FC = () => {
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHouses = async () => {
    try {
      const res = await api.get('/admin/houses');
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
    if (!window.confirm('Delete this listing from the platform? This cannot be undone.')) return;
    try {
      await api.delete(`/houses/${id}`);
      setHouses(houses.filter(h => h._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 md:px-8 max-w-7xl mx-auto animate-fade-in mt-16">
      <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
        <h2 className="text-3xl font-bold">Platform Listings</h2>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-textSecondary text-sm uppercase tracking-wide">
                <th className="p-4 font-semibold">Property</th>
                <th className="p-4 font-semibold">Owner</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-textSecondary animate-pulse">Loading listings...</td>
                </tr>
              ) : houses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-textSecondary">No listings found.</td>
                </tr>
              ) : (
                houses.map((house: any) => (
                  <tr key={house._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 flex gap-3 items-center min-w-[300px]">
                      <div className="h-12 w-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img src={house.images?.[0]?.url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <div className="font-semibold text-textPrimary line-clamp-1">{house.title}</div>
                        <div className="text-xs text-textSecondary flex items-center mt-1"><MapPin className="h-3 w-3 mr-1" /> {house.location.area}, {house.location.city}</div>
                      </div>
                    </td>
                    <td className="p-4 min-w-[200px]">
                      <div className="font-semibold">{house.owner?.fullName || 'Unknown'}</div>
                      <div className="text-xs text-textSecondary">{house.owner?.email}</div>
                    </td>
                    <td className="p-4 font-bold text-primary whitespace-nowrap">
                      KES {house.pricing.pricePerMonth.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${house.status==='Active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>
                        {house.status} {house.isPremium && '⭐'}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Link to={`/house/${house._id}`} target="_blank" className="p-1 px-3 bg-surface hover:bg-gray-200 rounded transition-colors text-sm font-medium flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" /> View
                        </Link>
                        <button onClick={() => handleDelete(house._id)} className="p-1 px-3 text-error bg-red-50 hover:bg-red-100 rounded transition-colors text-sm font-medium flex items-center gap-1">
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListingModeration;
