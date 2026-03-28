import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ProtectedRoute, OwnerRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetails from './pages/PropertyDetails';
import Favorites from './pages/Favorites';
import Inquiries from './pages/Inquiries';
import OwnerDashboard from './pages/OwnerDashboard';
import PremiumUpgrade from './pages/PremiumUpgrade';
import OwnerListings from './pages/OwnerListings';
import AddListing from './pages/AddListing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col pt-14 pb-20 md:pt-[100px] md:pb-0 bg-background text-textPrimary">
        <Navbar />

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
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
                  <OwnerDashboard />
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/premium"
              element={
                <OwnerRoute>
                  <PremiumUpgrade />
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/listings"
              element={
                <OwnerRoute>
                  <OwnerListings />
                </OwnerRoute>
              }
            />
            <Route
              path="/owner/listings/new"
              element={
                <OwnerRoute>
                  <AddListing />
                </OwnerRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
