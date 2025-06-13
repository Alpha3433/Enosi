import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Package, Clock, ChevronLeft, ChevronRight, Plus, Save } from 'lucide-react';

function VendorCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availability, setAvailability] = useState({});
  const [packages, setPackages] = useState([]);
  const [seasonalPricing, setSeasonalPricing] = useState([]);
  const [activeTab, setActiveTab] = useState('calendar');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch vendor packages
      const packagesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/vendors/packages`, { headers });
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        setPackages(packagesData);
      }

      // Fetch availability for current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const availabilityResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/vendors/availability?start_date=${startOfMonth.toISOString()}&end_date=${endOfMonth.toISOString()}`,
        { headers }
      );
      
      if (availabilityResponse.ok) {
        const availabilityData = await availabilityResponse.json();
        const availabilityMap = {};
        availabilityData.forEach(item => {
          const dateKey = new Date(item.date).toDateString();
          availabilityMap[dateKey] = item;
        });
        setAvailability(availabilityMap);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      setIsLoading(false);
    }
  };

  const saveAvailability = async (dateString, availabilityData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/vendors/availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
          date: new Date(dateString).toISOString(),
          ...availabilityData
        }])
      });

      if (response.ok) {
        setAvailability(prev => ({
          ...prev,
          [dateString]: { date: dateString, ...availabilityData }
        }));
        alert('Availability updated successfully!');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Failed to save availability. Please try again.');
    }
  };

  const createPackage = async (packageData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/vendors/packages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(packageData)
      });

      if (response.ok) {
        const newPackage = await response.json();
        setPackages(prev => [...prev, newPackage]);
        return newPackage;
      }
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDateAvailability = (date) => {
    if (!date) return null;
    return availability[date.toDateString()] || null;
  };

  const CalendarView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="p-2 h-16"></div>;
            }

            const dateAvailability = getDateAvailability(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

            return (
              <motion.div
                key={date.toDateString()}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedDate(date)}
                className={`
                  p-2 h-16 border rounded-md cursor-pointer transition-colors
                  ${isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}
                  ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                `}
              >
                <div className="text-sm font-medium text-gray-900">{date.getDate()}</div>
                
                {dateAvailability && (
                  <div className="mt-1">
                    <div className={`
                      w-full h-2 rounded text-xs text-center
                      ${dateAvailability.is_available 
                        ? dateAvailability.is_booked 
                          ? 'bg-red-200 text-red-800' 
                          : 'bg-green-200 text-green-800'
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      {dateAvailability.is_booked ? 'Booked' : 
                       dateAvailability.is_available ? 'Available' : 'Unavailable'}
                    </div>
                    {dateAvailability.pricing_tier !== 'standard' && (
                      <div className="text-xs text-center mt-1 text-purple-600">
                        {dateAvailability.pricing_tier}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <AvailabilityForm
            date={selectedDate}
            availability={getDateAvailability(selectedDate)}
            onSave={(data) => saveAvailability(selectedDate.toDateString(), data)}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
    );
  };

  const AvailabilityForm = ({ date, availability, onSave, onClose }) => {
    const [isAvailable, setIsAvailable] = useState(availability?.is_available ?? true);
    const [isBooked, setIsBooked] = useState(availability?.is_booked ?? false);
    const [pricingTier, setPricingTier] = useState(availability?.pricing_tier ?? 'standard');
    const [notes, setNotes] = useState(availability?.notes ?? '');

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({
        is_available: isAvailable,
        is_booked: isBooked,
        pricing_tier: pricingTier,
        notes
      });
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl max-w-md w-full p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {date.toLocaleDateString('default', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">Available for bookings</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isBooked}
                  onChange={(e) => setIsBooked(e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">Already booked</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Tier
              </label>
              <select
                value={pricingTier}
                onChange={(e) => setPricingTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="standard">Standard</option>
                <option value="peak">Peak (+20%)</option>
                <option value="off_peak">Off Peak (-10%)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any special notes for this date..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  const PackagesView = () => {
    const [showPackageForm, setShowPackageForm] = useState(false);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Service Packages</h2>
          <button
            onClick={() => setShowPackageForm(true)}
            className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                <div className="text-2xl font-bold text-pink-600">${pkg.base_price}</div>
              </div>
              
              <p className="text-gray-600 mb-4">{pkg.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {pkg.duration_hours ? `${pkg.duration_hours} hours` : 'Custom duration'}
                </div>
                {pkg.max_guests && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    Up to {pkg.max_guests} guests
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Included:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {pkg.inclusions.map((inclusion, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-2"></div>
                      {inclusion}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {showPackageForm && (
          <PackageForm
            onSave={createPackage}
            onClose={() => setShowPackageForm(false)}
          />
        )}
      </div>
    );
  };

  const PackageForm = ({ onSave, onClose }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      base_price: '',
      duration_hours: '',
      max_guests: '',
      inclusions: [''],
      add_ons: []
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const packageData = {
          ...formData,
          base_price: parseFloat(formData.base_price),
          duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : null,
          max_guests: formData.max_guests ? parseInt(formData.max_guests) : null,
          inclusions: formData.inclusions.filter(item => item.trim())
        };
        
        await onSave(packageData);
        onClose();
      } catch (error) {
        alert('Failed to create package. Please try again.');
      }
    };

    const addInclusion = () => {
      setFormData(prev => ({
        ...prev,
        inclusions: [...prev.inclusions, '']
      }));
    };

    const updateInclusion = (index, value) => {
      setFormData(prev => ({
        ...prev,
        inclusions: prev.inclusions.map((item, i) => i === index ? value : item)
      }));
    };

    const removeInclusion = (index) => {
      setFormData(prev => ({
        ...prev,
        inclusions: prev.inclusions.filter((_, i) => i !== index)
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New Package</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => setFormData(prev => ({...prev, base_price: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData(prev => ({...prev, duration_hours: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Guests
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_guests}
                  onChange={(e) => setFormData(prev => ({...prev, max_guests: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's Included
              </label>
              <div className="space-y-2">
                {formData.inclusions.map((inclusion, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inclusion}
                      onChange={(e) => updateInclusion(index, e.target.value)}
                      placeholder="e.g., Professional photography"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    {formData.inclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInclusion(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addInclusion}
                  className="text-pink-600 hover:text-pink-700 text-sm"
                >
                  + Add inclusion
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
              >
                Create Package
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  const tabs = [
    { id: 'calendar', name: 'Availability Calendar', icon: Calendar },
    { id: 'packages', name: 'Service Packages', icon: Package },
    { id: 'pricing', name: 'Seasonal Pricing', icon: DollarSign }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Calendar & Pricing Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your availability, packages, and pricing
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <IconComponent className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'packages' && <PackagesView />}
          {activeTab === 'pricing' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Seasonal Pricing</h2>
              <p className="text-gray-600">Seasonal pricing management coming soon...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default VendorCalendarPage;