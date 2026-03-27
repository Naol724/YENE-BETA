// Mock data for House Rental Admin Dashboard

export const mockAdmin = {
  name: 'Admin User',
  email: 'admin@houserental.com',
  role: 'super_admin',
};

export const mockUsers = [
  {
    id: '1', name: 'John Doe', email: 'john@example.com', phone: '+254712345678',
    role: 'owner', status: 'active', isApproved: true, isPremium: true,
    joinedDate: '2024-01-15', location: 'Nairobi', listings: 3, avatar: 'JD',
    avatarColor: '#2563EB',
  },
  {
    id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+254723456789',
    role: 'broker', status: 'pending', isApproved: false, isPremium: false,
    joinedDate: '2024-02-20', location: 'Mombasa', listings: 0, avatar: 'SJ',
    avatarColor: '#7C3AED',
  },
  {
    id: '3', name: 'Michael Chen', email: 'michael@example.com', phone: '+254734567890',
    role: 'renter', status: 'active', isApproved: true, isPremium: false,
    joinedDate: '2024-03-10', location: 'Kisumu', listings: 0, avatar: 'MC',
    avatarColor: '#10B981',
  },
  {
    id: '4', name: 'Amina Hassan', email: 'amina@example.com', phone: '+254745678901',
    role: 'owner', status: 'suspended', isApproved: true, isPremium: false,
    joinedDate: '2024-01-28', location: 'Nakuru', listings: 2, avatar: 'AH',
    avatarColor: '#F59E0B',
  },
  {
    id: '5', name: 'David Kamau', email: 'david@example.com', phone: '+254756789012',
    role: 'broker', status: 'pending', isApproved: false, isPremium: false,
    joinedDate: '2024-03-05', location: 'Nairobi', listings: 0, avatar: 'DK',
    avatarColor: '#EF4444',
  },
  {
    id: '6', name: 'Grace Wanjiku', email: 'grace@example.com', phone: '+254767890123',
    role: 'renter', status: 'active', isApproved: true, isPremium: false,
    joinedDate: '2024-02-14', location: 'Eldoret', listings: 0, avatar: 'GW',
    avatarColor: '#06B6D4',
  },
  {
    id: '7', name: 'Peter Otieno', email: 'peter@example.com', phone: '+254778901234',
    role: 'owner', status: 'active', isApproved: true, isPremium: true,
    joinedDate: '2023-12-01', location: 'Nairobi', listings: 5, avatar: 'PO',
    avatarColor: '#8B5CF6',
  },
  {
    id: '8', name: 'Lucy Njeri', email: 'lucy@example.com', phone: '+254789012345',
    role: 'broker', status: 'active', isApproved: true, isPremium: false,
    joinedDate: '2024-01-10', location: 'Nairobi', listings: 4, avatar: 'LN',
    avatarColor: '#EC4899',
  },
];

export const mockListings = [
  {
    id: '1', title: 'Modern 3BR Apartment in Westlands', type: 'apartment',
    price: 85000, location: 'Westlands, Nairobi', bedrooms: 3, bathrooms: 2,
    status: 'active', isPremium: true, views: 342, inquiries: 18,
    owner: 'John Doe', ownerId: '1',
    description: 'Spacious and modern apartment with stunning city views. Features a fully equipped kitchen, master ensuite, and secure parking.',
    createdDate: '2024-01-15',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop',
  },
  {
    id: '2', title: 'Cozy Studio in Kilimani', type: 'studio',
    price: 35000, location: 'Kilimani, Nairobi', bedrooms: 1, bathrooms: 1,
    status: 'active', isPremium: false, views: 189, inquiries: 9,
    owner: 'Peter Otieno', ownerId: '7',
    description: 'Perfect for young professionals. Close to shopping centers and public transport.',
    createdDate: '2024-02-01',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop',
  },
  {
    id: '3', title: 'Executive 4BR Villa in Karen', type: 'house',
    price: 250000, location: 'Karen, Nairobi', bedrooms: 4, bathrooms: 3,
    status: 'active', isPremium: true, views: 521, inquiries: 27,
    owner: 'Lucy Njeri', ownerId: '8',
    description: 'Luxurious villa in a serene environment. Comes with a large garden, garage, and swimming pool.',
    createdDate: '2024-01-08',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop',
  },
  {
    id: '4', title: '2BR Apartment in Lavington', type: 'apartment',
    price: 65000, location: 'Lavington, Nairobi', bedrooms: 2, bathrooms: 1,
    status: 'pending', isPremium: false, views: 98, inquiries: 4,
    owner: 'John Doe', ownerId: '1',
    description: 'Comfortable 2-bedroom apartment in a quiet residential area. All amenities included.',
    createdDate: '2024-03-12',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop',
  },
  {
    id: '5', title: 'Bedsitter Near CBD', type: 'studio',
    price: 18000, location: 'Nairobi CBD', bedrooms: 1, bathrooms: 1,
    status: 'active', isPremium: false, views: 430, inquiries: 33,
    owner: 'Peter Otieno', ownerId: '7',
    description: 'Budget-friendly option in the heart of the city. Walking distance to everything.',
    createdDate: '2024-02-20',
    image: null,
  },
  {
    id: '6', title: 'Luxury Penthouse in Runda', type: 'apartment',
    price: 350000, location: 'Runda, Nairobi', bedrooms: 5, bathrooms: 4,
    status: 'suspended', isPremium: true, views: 203, inquiries: 12,
    owner: 'Amina Hassan', ownerId: '4',
    description: 'Spectacular penthouse with panoramic views. Comes fully furnished with premium finishes.',
    createdDate: '2023-12-15',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop',
  },
];

export const mockTransactions = [
  {
    id: '1', userId: '1', userName: 'John Doe', userEmail: 'john@example.com',
    phone: '+254712345678', role: 'owner', amount: 5000, type: 'Premium Upgrade',
    status: 'completed', method: 'M-Pesa', date: '2024-01-15T13:30:00', receiptUrl: '#',
  },
  {
    id: '2', userId: '7', userName: 'Peter Otieno', userEmail: 'peter@example.com',
    phone: '+254778901234', role: 'owner', amount: 5000, type: 'Premium Upgrade',
    status: 'completed', method: 'M-Pesa', date: '2024-01-18T09:15:00', receiptUrl: '#',
  },
  {
    id: '3', userId: '8', userName: 'Lucy Njeri', userEmail: 'lucy@example.com',
    phone: '+254789012345', role: 'broker', amount: 5000, type: 'Additional Listing',
    status: 'pending', method: 'M-Pesa', date: '2024-02-05T15:22:00', receiptUrl: '#',
  },
  {
    id: '4', userId: '2', userName: 'Sarah Johnson', userEmail: 'sarah@example.com',
    phone: '+254723456789', role: 'broker', amount: 5000, type: 'Premium Upgrade',
    status: 'failed', method: 'M-Pesa', date: '2024-02-08T11:45:00', receiptUrl: '#',
  },
  {
    id: '5', userId: '1', userName: 'John Doe', userEmail: 'john@example.com',
    phone: '+254712345678', role: 'owner', amount: 2000, type: 'Additional Listing',
    status: 'completed', method: 'M-Pesa', date: '2024-03-01T14:10:00', receiptUrl: '#',
  },
];

export const mockAuditLogs = [
  { id: '1', admin: 'Admin User', action: 'User Approved', target: 'John Doe', targetType: 'user', ip: '41.90.64.1', status: 'success', date: '2024-03-27T22:10:00' },
  { id: '2', admin: 'Admin User', action: 'Listing Deleted', target: 'Listing #3', targetType: 'listing', ip: '41.90.64.1', status: 'success', date: '2024-03-27T21:45:00' },
  { id: '3', admin: 'Admin User', action: 'User Suspended', target: 'Amina Hassan', targetType: 'user', ip: '41.90.64.1', status: 'success', date: '2024-03-26T18:20:00' },
  { id: '4', admin: 'Admin User', action: 'Admin Login', target: 'System', targetType: 'system', ip: '41.90.64.1', status: 'success', date: '2024-03-26T08:00:00' },
  { id: '5', admin: 'Admin User', action: 'Settings Changed', target: 'Platform Settings', targetType: 'setting', ip: '41.90.64.1', status: 'success', date: '2024-03-25T14:30:00' },
  { id: '6', admin: 'Admin User', action: 'Report Exported', target: 'User Report', targetType: 'report', ip: '41.90.64.1', status: 'success', date: '2024-03-25T11:00:00' },
  { id: '7', admin: 'Admin User', action: 'User Rejected', target: 'Sarah Johnson', targetType: 'user', ip: '41.90.64.2', status: 'failed', date: '2024-03-24T17:15:00' },
];

export const mockAdminUsers = [
  { id: '1', name: 'Admin User', email: 'admin@houserental.com', role: 'super_admin', status: 'active', lastLogin: '2024-03-27T08:00:00', createdDate: '2023-01-01', mfa: true },
  { id: '2', name: 'Content Team', email: 'content@houserental.com', role: 'moderator', status: 'active', lastLogin: '2024-03-26T10:00:00', createdDate: '2023-06-15', mfa: false },
  { id: '3', name: 'User Manager', email: 'usermgr@houserental.com', role: 'user_manager', status: 'active', lastLogin: '2024-03-25T09:30:00', createdDate: '2023-08-20', mfa: false },
  { id: '4', name: 'Read Only', email: 'viewer@houserental.com', role: 'viewer', status: 'disabled', lastLogin: '2024-02-10T14:00:00', createdDate: '2023-11-01', mfa: false },
];

export const mockDashboardStats = {
  totalUsers: 6,
  totalListings: 5,
  premiumUsers: 2,
  totalRevenue: 12000,
  pendingApprovals: 2,
  verifiedUsers: 4,
  userBreakdown: { renters: 2, owners: 3, brokers: 2 },
  listingBreakdown: { active: 4, pending: 1, premium: 3 },
};

export const mockUserGrowthData = [
  { name: 'Jan', renters: 12, owners: 5, brokers: 3 },
  { name: 'Feb', renters: 19, owners: 8, brokers: 5 },
  { name: 'Mar', renters: 25, owners: 12, brokers: 7 },
  { name: 'Apr', renters: 30, owners: 15, brokers: 9 },
  { name: 'May', renters: 42, owners: 20, brokers: 12 },
  { name: 'Jun', renters: 55, owners: 28, brokers: 15 },
  { name: 'Jul', renters: 60, owners: 32, brokers: 18 },
];

export const mockRevenueData = [
  { name: 'Jan', revenue: 45000, projected: 50000 },
  { name: 'Feb', revenue: 52000, projected: 55000 },
  { name: 'Mar', revenue: 48000, projected: 58000 },
  { name: 'Apr', revenue: 61000, projected: 62000 },
  { name: 'May', revenue: 75000, projected: 70000 },
  { name: 'Jun', revenue: 82000, projected: 78000 },
  { name: 'Jul', revenue: 91000, projected: 85000 },
];

export const mockListingsData = [
  { name: 'Mon', listings: 3, premium: 1 },
  { name: 'Tue', listings: 5, premium: 2 },
  { name: 'Wed', listings: 2, premium: 1 },
  { name: 'Thu', listings: 7, premium: 3 },
  { name: 'Fri', listings: 4, premium: 2 },
  { name: 'Sat', listings: 6, premium: 2 },
  { name: 'Sun', listings: 3, premium: 1 },
];

export const mockActivity = [
  { id: 1, type: 'user', text: 'New owner registered: John Doe', time: '2 min ago', color: '#2563EB' },
  { id: 2, type: 'listing', text: 'New listing posted: Modern Apt in Westlands', time: '15 min ago', color: '#10B981' },
  { id: 3, type: 'payment', text: 'Premium upgrade: Peter Otieno — KES 5,000', time: '1 hr ago', color: '#F59E0B' },
  { id: 4, type: 'approval', text: 'Owner approved: Grace Wanjiku', time: '2 hr ago', color: '#7C3AED' },
  { id: 5, type: 'listing', text: 'New listing posted: Cozy Studio Kilimani', time: '3 hr ago', color: '#10B981' },
  { id: 6, type: 'user', text: 'New broker registered: David Kamau', time: '5 hr ago', color: '#2563EB' },
];
