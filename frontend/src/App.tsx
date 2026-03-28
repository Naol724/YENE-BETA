import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Favorites from './pages/Favorites';
import Inquiries from './pages/Inquiries';
import OwnerDashboard from './pages/OwnerDashboard';
import PremiumUpgrade from './pages/PremiumUpgrade';
import OwnerListings from './pages/OwnerListings';
import AddListing from './pages/AddListing';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ListingModeration from './pages/ListingModeration';
import TransactionMonitoring from './pages/TransactionMonitoring';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col pt-16 bg-background text-textPrimary">
        <Navbar />

        <main className="flex-1 overflow-auto md:pt-16 pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/house/:id" element={<PropertyDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/inquiries" element={<Inquiries />} />
            
            {/* Owner Routes */}
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/premium" element={<PremiumUpgrade />} />
            <Route path="/owner/listings" element={<OwnerListings />} />
            <Route path="/owner/listings/new" element={<AddListing />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/listings" element={<ListingModeration />} />
            <Route path="/admin/transactions" element={<TransactionMonitoring />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
