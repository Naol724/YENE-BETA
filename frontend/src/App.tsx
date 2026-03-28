import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ProtectedRoute, OwnerRoute } from './components/ProtectedRoute';
import OwnerLayout from './layouts/OwnerLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Favorites from './pages/Favorites';
import Inquiries from './pages/Inquiries';
import OwnerDashboard from './pages/OwnerDashboard';
import PremiumUpgrade from './pages/PremiumUpgrade';
import OwnerListings from './pages/OwnerListings';
import AddListing from './pages/AddListing';
import EditListing from './pages/EditListing';
import OwnerInquiries from './pages/OwnerInquiries';
import OwnerInquiryDetail from './pages/OwnerInquiryDetail';
import OwnerAnalytics from './pages/OwnerAnalytics';
import OwnerProfile from './pages/OwnerProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function AppRoutes() {
  const location = useLocation();
  const ownerShell = location.pathname.startsWith('/owner');

  return (
    <>
      {!ownerShell && <Navbar />}
      <main
        className={
          ownerShell
            ? 'flex-1 overflow-auto'
            : 'flex-1 overflow-auto md:pt-16 pb-16 md:pb-0 pt-0'
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/house/:id" element={<PropertyDetails />} />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inquiries"
            element={
              <ProtectedRoute>
                <Inquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner"
            element={
              <OwnerRoute>
                <OwnerLayout />
              </OwnerRoute>
            }
          >
            <Route index element={<OwnerDashboard />} />
            <Route path="listings" element={<OwnerListings />} />
            <Route path="listings/new" element={<AddListing />} />
            <Route path="listings/:id/edit" element={<EditListing />} />
            <Route path="inquiries" element={<OwnerInquiries />} />
            <Route path="inquiries/:id" element={<OwnerInquiryDetail />} />
            <Route path="premium" element={<PremiumUpgrade />} />
            <Route path="analytics" element={<OwnerAnalytics />} />
            <Route path="profile" element={<OwnerProfile />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background text-textPrimary">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
