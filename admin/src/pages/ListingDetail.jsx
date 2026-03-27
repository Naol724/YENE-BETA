import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, BedDouble, Bath, Eye, Users, Trash2, Flag, Star } from 'lucide-react';
import { mockListings } from '../data/mockData';

export default function ListingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const listing = mockListings.find(l => l.id === id);

    if (!listing) return (
        <div className="empty-state">
            <h3>Listing not found</h3>
            <button className="btn btn-outline" onClick={() => navigate('/listings')}>Back to Listings</button>
        </div>
    );

    return (
        <div>
            <button className="btn btn-ghost" onClick={() => navigate('/listings')} style={{ marginBottom: 20 }}>
                <ArrowLeft size={16} /> Back to Listings
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>{listing.title}</h1>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                        <span className={`badge badge-${listing.status === 'active' ? 'success' : listing.status === 'pending' ? 'warning' : 'error'}`}>{listing.status}</span>
                        {listing.isPremium && <span className="badge badge-warning">⭐ Premium</span>}
                        <span className="badge badge-gray">{listing.type}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-outline btn-sm"><Flag size={14} /> Flag</button>
                    <button className="btn btn-danger btn-sm" onClick={() => navigate('/listings')}><Trash2 size={14} /> Delete</button>
                </div>
            </div>

            <div className="charts-grid" style={{ marginBottom: 20 }}>
                <div>
                    {/* Image */}
                    <div style={{ height: 280, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg)', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {listing.image
                            ? <img src={listing.image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}><Star size={48} /><p style={{ marginTop: 8 }}>No images available</p></div>
                        }
                    </div>

                    {/* Details */}
                    <div className="card">
                        <div className="card-header"><h3>Property Details</h3></div>
                        <div className="card-body">
                            <p style={{ marginBottom: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{listing.description}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                                {[
                                    { icon: <MapPin size={16} />, label: 'Location', val: listing.location },
                                    { icon: <BedDouble size={16} />, label: 'Bedrooms', val: listing.bedrooms },
                                    { icon: <Bath size={16} />, label: 'Bathrooms', val: listing.bathrooms },
                                    { icon: <Eye size={16} />, label: 'Views', val: listing.views },
                                    { icon: <Users size={16} />, label: 'Inquiries', val: listing.inquiries },
                                    { icon: <Star size={16} />, label: 'Listed', val: listing.createdDate },
                                ].map(f => (
                                    <div key={f.label} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                                        <div style={{ color: 'var(--primary)', marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{f.icon}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</div>
                                        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{f.val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    {/* Pricing */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header"><h3>Pricing</h3></div>
                        <div className="card-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Monthly Rent</span>
                                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>KES {listing.price.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Security Deposit</span>
                                <span style={{ fontSize: 16, fontWeight: 700 }}>KES {(listing.price * 2).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Owner Info */}
                    <div className="card">
                        <div className="card-header"><h3>Owner / Broker</h3></div>
                        <div className="card-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div className="avatar" style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: 44, height: 44, fontSize: 16, fontWeight: 700 }}>
                                    {listing.owner.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{listing.owner}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Property Owner</div>
                                </div>
                            </div>
                            <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/users/${listing.ownerId}`)}>
                                View Owner Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
