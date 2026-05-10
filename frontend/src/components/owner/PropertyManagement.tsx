import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Home,
  Edit,
  Trash2,
  Eye,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Camera,
  Loader2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RootState } from '../../store';
import api from '../../utils/api';

interface Property {
  _id: string;
  title: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage?: number;
  location: {
    city: string;
    area: string;
    address: string;
  };
  pricing: {
    pricePerMonth: number;
    currency: string;
    securityDeposit?: number;
  };
  description: string;
  amenities: string[];
  images: Array<{
    url: string;
    isMain: boolean;
    caption?: string;
  }>;
  contact: {
    phone: string;
    whatsapp?: string;
    ownerName: string;
  };
  status: string;
  views: number;
  statistics: {
    contactCount: number;
    favoriteCount: number;
    lastContacted?: string;
  };
  createdAt: string;
  updatedAt: string;
  isPremium: boolean;
  featured: boolean;
}

const PropertyManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    rented: 0,
    paused: 0,
    totalViews: 0,
    totalContacts: 0
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/houses/my-listings');
      setProperties(response.data.data || []);
      calculateStats(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      toast.error('Failed to load your properties');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (properties: Property[]) => {
    const stats = {
      total: properties.length,
      active: properties.filter(p => p.status === 'Available' || p.status === 'Active').length,
      rented: properties.filter(p => p.status === 'Rented').length,
      paused: properties.filter(p => p.status === 'Paused').length,
      totalViews: properties.reduce((sum, p) => sum + p.views, 0),
      totalContacts: properties.reduce((sum, p) => sum + p.statistics.contactCount, 0)
    };
    setStats(stats);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await api.delete(`/houses/${propertyId}`);
      setProperties(prev => prev.filter(p => p._id !== propertyId));
      toast.success('Property deleted successfully');
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Failed to delete property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleStatusUpdate = async (propertyId: string, newStatus: string) => {
    try {
      const response = await api.patch(`/houses/${propertyId}`, { status: newStatus });
      if (response.data.success) {
        setProperties(prev => prev.map(p => 
          p._id === propertyId 
            ? { ...p, status: newStatus }
            : p
        ));
        toast.success(`Property status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update property status');
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    const matchesType = filterType === 'all' || property.propertyType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'price':
        return b.pricing.pricePerMonth - a.pricing.pricePerMonth;
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Rented':
        return 'bg-blue-100 text-blue-800';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available':
      case 'Active':
        return <CheckCircle className="w-4 h-4" />;
      case 'Rented':
        return <Home className="w-4 h-4" />;
      case 'Paused':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-mobile py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
              <p className="text-gray-600 mt-1">Manage your rental property listings</p>
            </div>
            <Link
              to="/owner/listings/new"
              className="btn-primary mt-4 sm:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Property
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-green-600">Active</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.rented}</div>
              <div className="text-xs text-blue-600">Rented</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
              <div className="text-xs text-yellow-600">Paused</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalViews}</div>
              <div className="text-xs text-purple-600">Views</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalContacts}</div>
              <div className="text-xs text-orange-600">Contacts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b">
        <div className="container-mobile py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search properties..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Active">Active</option>
                <option value="Rented">Rented</option>
                <option value="Paused">Paused</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
                <option value="Family house">Family House</option>
                <option value="Single room">Single Room</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="createdAt">Newest First</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
                <option value="views">Views</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties */}
      <div className="container-mobile py-6">
        {sortedProperties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Get started by adding your first property listing'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <Link
                to="/owner/listings/new"
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProperties.map((property) => (
                  <div key={property._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="relative aspect-video">
                      <img
                        src={property.images.find(img => img.isMain)?.url || property.images[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(property.status)}`}>
                          {getStatusIcon(property.status)}
                          <span className="ml-1">{property.status}</span>
                        </span>
                      </div>
                      {property.featured && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{property.title}</h3>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.location.area}, {property.location.city}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold text-primary">
                          {property.pricing.currency} {property.pricing.pricePerMonth.toLocaleString()}/mo
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.bedrooms} bed • {property.bathrooms} bath
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {property.views}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {property.statistics.contactCount}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(property.createdAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/owner/listings/${property._id}/edit`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setPropertyToDelete(property._id);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <Link
                          to={`/house/${property._id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stats
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedProperties.map((property) => (
                        <tr key={property._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={property.images.find(img => img.isMain)?.url || property.images[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'}
                                alt={property.title}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {property.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {property.propertyType} • {property.bedrooms} bed • {property.bathrooms} bath
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {property.location.area}, {property.location.city}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {property.pricing.currency} {property.pricing.pricePerMonth.toLocaleString()}/mo
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(property.status)}`}>
                              {getStatusIcon(property.status)}
                              <span className="ml-1">{property.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {property.views}
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {property.statistics.contactCount}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => navigate(`/owner/listings/${property._id}/edit`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setPropertyToDelete(property._id);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <Link
                                to={`/house/${property._id}`}
                                className="text-primary hover:underline"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Property</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this property? All associated data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPropertyToDelete(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (propertyToDelete) {
                    handleDeleteProperty(propertyToDelete);
                  }
                }}
                className="btn-primary bg-red-600 hover:bg-red-700"
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;
