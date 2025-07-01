import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users,
  Plus,
  Trash2,
  Edit3,
  Search,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  UserX,
  Download,
  Upload,
  ArrowLeft,
  Bell,
  Filter,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const GuestListManagerPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuest, setNewGuest] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    rsvp_status: 'pending',
    meal_preference: '',
    plus_one: false
  });
  const [editingId, setEditingId] = useState(null);
  const [editingGuest, setEditingGuest] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Local storage key for guest data
  const getStorageKey = () => `guests_${user?.id || 'default'}`;

  useEffect(() => {
    fetchGuests();
  }, [user]);

  const fetchGuests = async () => {
    try {
      setIsLoading(true);
      // Load guests from localStorage for persistence
      const storageKey = getStorageKey();
      const savedGuests = localStorage.getItem(storageKey);
      if (savedGuests) {
        setGuests(JSON.parse(savedGuests));
      } else {
        setGuests([]);
      }
    } catch (err) {
      console.error('Error fetching guests:', err);
      setError('Failed to load guest list');
    } finally {
      setIsLoading(false);
    }
  };

  const saveGuestsToStorage = (guestList) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(guestList));
      
      // Also save total count to couple profile for dashboard
      const coupleProfileKey = `couple_profile_${user?.id || 'default'}`;
      const existingProfile = localStorage.getItem(coupleProfileKey);
      const profile = existingProfile ? JSON.parse(existingProfile) : {};
      profile.guest_count = guestList.length;
      localStorage.setItem(coupleProfileKey, JSON.stringify(profile));
    } catch (err) {
      console.error('Error saving guests:', err);
    }
  };

  const addGuest = async () => {
    if (!newGuest.name) return;
    
    try {
      const guestData = {
        ...newGuest,
        id: Date.now(), // Temporary ID for demo
        created_at: new Date().toISOString()
      };
      
      const updatedGuests = [...guests, guestData];
      setGuests(updatedGuests);
      saveGuestsToStorage(updatedGuests);
      
      setNewGuest({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        rsvp_status: 'pending',
        meal_preference: '',
        plus_one: false
      });
      setShowAddGuest(false);
    } catch (err) {
      console.error('Error adding guest:', err);
      setError('Failed to add guest');
    }
  };

  const startEdit = (guest) => {
    setEditingId(guest.id);
    setEditingGuest({ ...guest });
  };

  const saveEdit = () => {
    try {
      const updatedGuests = guests.map(guest => 
        guest.id === editingId ? editingGuest : guest
      );
      setGuests(updatedGuests);
      saveGuestsToStorage(updatedGuests);
      setEditingId(null);
      setEditingGuest({});
    } catch (err) {
      console.error('Error updating guest:', err);
      setError('Failed to update guest');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingGuest({});
  };

  const deleteGuest = async (guestId) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;
    
    try {
      const updatedGuests = guests.filter(guest => guest.id !== guestId);
      setGuests(updatedGuests);
      saveGuestsToStorage(updatedGuests);
    } catch (err) {
      console.error('Error deleting guest:', err);
      setError('Failed to delete guest');
    }
  };

  const updateRSVP = async (guestId, status) => {
    try {
      const updatedGuests = guests.map(guest => 
        guest.id === guestId ? { ...guest, rsvp_status: status } : guest
      );
      setGuests(updatedGuests);
      saveGuestsToStorage(updatedGuests);
    } catch (err) {
      console.error('Error updating RSVP:', err);
      setError('Failed to update RSVP');
    }
  };

  const handleImportCSV = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const csv = event.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            const importedGuests = [];
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const guest = {
                  id: Date.now() + i,
                  name: values[0] || '',
                  email: values[1] || '',
                  phone: values[2] || '',
                  address: values[3] || '',
                  rsvp_status: values[4] || 'pending',
                  meal_preference: values[5] || '',
                  plus_one: values[6] === 'true' || false,
                  created_at: new Date().toISOString()
                };
                importedGuests.push(guest);
              }
            }
            
            const updatedGuests = [...guests, ...importedGuests];
            setGuests(updatedGuests);
            saveGuestsToStorage(updatedGuests);
            alert(`Imported ${importedGuests.length} guests successfully!`);
          } catch (error) {
            alert('Error importing CSV file. Please check the format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Name', 'Email', 'Phone', 'Address', 'RSVP Status', 'Meal Preference', 'Plus One'];
      const csvContent = [
        headers.join(','),
        ...guests.map(guest => [
          guest.name,
          guest.email,
          guest.phone,
          guest.address,
          guest.rsvp_status,
          guest.meal_preference,
          guest.plus_one ? 'true' : 'false'
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `wedding_guest_list_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Error exporting guest list');
    }
  };

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || guest.rsvp_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const confirmedCount = guests.filter(guest => guest.rsvp_status === 'confirmed').length;
  const declinedCount = guests.filter(guest => guest.rsvp_status === 'declined').length;
  const pendingCount = guests.filter(guest => guest.rsvp_status === 'pending').length;
  const totalCount = guests.length;

  const getRSVPColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'declined': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-linen font-sans" style={{ zoom: 0.9 }}>
      {/* Header - Same as landing page */}
      <header className="bg-white">
        <div className="container mx-auto px-9 py-5 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="text-xl font-bold font-sans text-millbrook"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Enosi
            </button>
          </div>
          
          <nav className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <button onClick={() => navigate('/search')} className="text-sm hover:text-cement transition-colors font-sans text-millbrook font-medium">
              Find Vendors
            </button>
            <button onClick={() => navigate('/inspiration')} className="text-sm hover:text-cement transition-colors font-sans text-millbrook font-medium">
              Inspiration
            </button>
            <button onClick={() => navigate('/about')} className="text-sm hover:text-cement transition-colors font-sans text-millbrook font-medium">
              About Us
            </button>
          </nav>

          <div className="flex space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button className="p-2 text-kabul hover:text-millbrook transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-coral-reef text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
                </button>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-kabul hover:text-millbrook transition-colors">
                    <span className="text-sm font-sans">{user?.first_name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-coral-reef opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => navigate(user?.user_type === 'vendor' ? '/vendor-dashboard' : '/dashboard')}
                        className="block w-full text-left px-4 py-2 text-sm text-kabul hover:bg-linen font-sans"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-kabul hover:bg-linen font-sans"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="border border-coral-reef text-kabul rounded-full px-4 py-2 text-sm hover:bg-linen transition-colors font-sans"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-cement text-white rounded-full px-4 py-2 text-sm hover:bg-millbrook transition-colors font-sans"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-9 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-kabul hover:text-cement transition-colors font-sans"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-millbrook mb-2 font-sans">Guest List Manager</h1>
          <p className="text-kabul font-sans">
            Manage your wedding guest list and track RSVPs
          </p>
        </div>

        {/* Guest Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
              padding: '24px'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-linen">
                <Users className="w-6 h-6 text-cement" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-millbrook mb-1 font-sans">{totalCount}</h3>
            <p className="text-sm text-kabul font-sans">Total Guests</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
              padding: '24px'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-millbrook mb-1 font-sans">{confirmedCount}</h3>
            <p className="text-sm text-kabul font-sans">Confirmed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
              padding: '24px'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-50">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-millbrook mb-1 font-sans">{declinedCount}</h3>
            <p className="text-sm text-kabul font-sans">Declined</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
              padding: '24px'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-yellow-50">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-millbrook mb-1 font-sans">{pendingCount}</h3>
            <p className="text-sm text-kabul font-sans">Pending</p>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowAddGuest(true)}
              className="flex items-center space-x-2 bg-cement text-white px-6 py-3 rounded-full hover:bg-millbrook transition-colors font-sans"
            >
              <Plus className="w-5 h-5" />
              <span>Add Guest</span>
            </button>
            <button 
              onClick={handleImportCSV}
              className="flex items-center space-x-2 border border-coral-reef text-kabul px-6 py-3 rounded-full hover:bg-linen transition-colors font-sans"
            >
              <Upload className="w-5 h-5" />
              <span>Import CSV</span>
            </button>
            <button 
              onClick={handleExportCSV}
              className="flex items-center space-x-2 border border-coral-reef text-kabul px-6 py-3 rounded-full hover:bg-linen transition-colors font-sans"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>

          <div className="flex space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-kabul" />
              <input
                type="text"
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement transition-all duration-200 font-sans placeholder-napa text-kabul"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement transition-all duration-200 font-sans text-kabul"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="declined">Declined</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Add Guest Form */}
        {showAddGuest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
              padding: '24px'
            }}
          >
            <h3 className="text-lg font-bold text-millbrook mb-4 font-sans">Add New Guest</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Full name"
                value={newGuest.name}
                onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
              />
              <input
                type="email"
                placeholder="Email address"
                value={newGuest.email}
                onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={newGuest.phone}
                onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
              />
              <input
                type="text"
                placeholder="Address"
                value={newGuest.address}
                onChange={(e) => setNewGuest({...newGuest, address: e.target.value})}
                className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
              />
              <select
                value={newGuest.rsvp_status}
                onChange={(e) => setNewGuest({...newGuest, rsvp_status: e.target.value})}
                className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans text-kabul"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
              </select>
              <input
                type="text"
                placeholder="Meal preference"
                value={newGuest.meal_preference}
                onChange={(e) => setNewGuest({...newGuest, meal_preference: e.target.value})}
                className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
              />
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center space-x-2 text-kabul font-sans">
                <input
                  type="checkbox"
                  checked={newGuest.plus_one}
                  onChange={(e) => setNewGuest({...newGuest, plus_one: e.target.checked})}
                  className="w-4 h-4 text-cement border-coral-reef rounded focus:ring-cement"
                />
                <span>Allow Plus One</span>
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={addGuest}
                className="bg-cement text-white px-4 py-2 rounded-lg hover:bg-millbrook transition-colors font-sans"
              >
                Add Guest
              </button>
              <button
                onClick={() => setShowAddGuest(false)}
                className="border border-coral-reef text-kabul px-4 py-2 rounded-lg hover:bg-linen transition-colors font-sans"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Guests List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cement mx-auto"></div>
              <p className="text-kabul mt-2 font-sans">Loading guests...</p>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div 
              className="text-center py-12"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                padding: '24px'
              }}
            >
              <Users className="w-12 h-12 text-kabul mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-millbrook mb-2 font-sans">
                {searchTerm ? 'No guests found' : 'No guests yet'}
              </h3>
              <p className="text-kabul font-sans">
                {searchTerm ? 'Try adjusting your search' : 'Start by adding your first guest to the list'}
              </p>
            </div>
          ) : (
            filteredGuests.map((guest, index) => (
              <motion.div
                key={guest.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  boxShadow: '0px 1px 12px rgba(3,3,3,0.1)',
                  padding: '24px'
                }}
              >
                {editingId === guest.id ? (
                  // Edit mode
                  <div>
                    <h3 className="text-lg font-bold text-millbrook mb-4 font-sans">Edit Guest</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Full name"
                        value={editingGuest.name || ''}
                        onChange={(e) => setEditingGuest({...editingGuest, name: e.target.value})}
                        className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
                      />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={editingGuest.email || ''}
                        onChange={(e) => setEditingGuest({...editingGuest, email: e.target.value})}
                        className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
                      />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={editingGuest.phone || ''}
                        onChange={(e) => setEditingGuest({...editingGuest, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
                      />
                      <input
                        type="text"
                        placeholder="Address"
                        value={editingGuest.address || ''}
                        onChange={(e) => setEditingGuest({...editingGuest, address: e.target.value})}
                        className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
                      />
                      <select
                        value={editingGuest.rsvp_status || 'pending'}
                        onChange={(e) => setEditingGuest({...editingGuest, rsvp_status: e.target.value})}
                        className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans text-kabul"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="declined">Declined</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Meal preference"
                        value={editingGuest.meal_preference || ''}
                        onChange={(e) => setEditingGuest({...editingGuest, meal_preference: e.target.value})}
                        className="w-full px-4 py-3 bg-linen border border-coral-reef rounded-xl focus:ring-2 focus:ring-cement focus:border-cement focus:bg-white transition-all duration-200 font-sans placeholder-napa text-kabul"
                      />
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                      <label className="flex items-center space-x-2 text-kabul font-sans">
                        <input
                          type="checkbox"
                          checked={editingGuest.plus_one || false}
                          onChange={(e) => setEditingGuest({...editingGuest, plus_one: e.target.checked})}
                          className="w-4 h-4 text-cement border-coral-reef rounded focus:ring-cement"
                        />
                        <span>Allow Plus One</span>
                      </label>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={saveEdit}
                        className="bg-cement text-white px-4 py-2 rounded-lg hover:bg-millbrook transition-colors font-sans flex items-center space-x-1"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="border border-coral-reef text-kabul px-4 py-2 rounded-lg hover:bg-linen transition-colors font-sans flex items-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-millbrook font-sans">{guest.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRSVPColor(guest.rsvp_status)}`}>
                          {guest.rsvp_status.charAt(0).toUpperCase() + guest.rsvp_status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-kabul">
                        {guest.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span className="font-sans">{guest.email}</span>
                          </div>
                        )}
                        {guest.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span className="font-sans">{guest.phone}</span>
                          </div>
                        )}
                        {guest.address && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span className="font-sans">{guest.address}</span>
                          </div>
                        )}
                        {guest.plus_one && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span className="font-sans">Plus One</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      {guest.rsvp_status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateRSVP(guest.id, 'confirmed')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Confirm RSVP"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateRSVP(guest.id, 'declined')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Decline RSVP"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => startEdit(guest)}
                        className="p-2 text-kabul hover:text-cement transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGuest(guest.id)}
                        className="p-2 text-coral-reef hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-linen py-12 mt-12">
        <div className="container mx-auto px-9">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-millbrook font-sans">Enosi</h3>
              <p className="text-sm text-kabul mb-2 font-sans">Your favorite wedding planning experience</p>
              <p className="text-sm text-kabul font-sans">since 2024</p>
            </div>
            <div>
              <h4 className="font-semibold text-millbrook mb-4 font-sans">Support</h4>
              <ul className="space-y-2 text-sm text-kabul">
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Help</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">FAQ</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Customer service</a>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-millbrook mb-4 font-sans">Company</h4>
              <ul className="space-y-2 text-sm text-kabul">
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">About Us</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Careers</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Press</a>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-millbrook mb-4 font-sans">Legal</h4>
              <ul className="space-y-2 text-sm text-kabul">
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Terms of Service</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Privacy Policy</a>
                <a href="#" className="block text-sm text-kabul hover:text-cement transition-colors font-sans">Cookies</a>
              </ul>
            </div>
          </div>
          <div className="border-t border-coral-reef mt-8 pt-8 text-center">
            <p className="text-kabul text-sm font-sans">
              © 2025 Enosi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GuestListManagerPage;