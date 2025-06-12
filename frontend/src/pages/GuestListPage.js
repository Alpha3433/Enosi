import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Search,
  Filter,
  Download,
  Upload,
  ArrowLeft,
  Check,
  X,
  UserPlus,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components';

const GuestListPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedGuests, setSelectedGuests] = useState([]);
  
  // Mock guest data
  const [guests, setGuests] = useState([
    {
      id: '1',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+61 400 123 456',
      relationship: 'Friend',
      rsvp_status: 'attending',
      plus_one: true,
      dietary_requirements: 'Vegetarian',
      table_assignment: 'Table 1',
      address: '123 Main St, Sydney NSW'
    },
    {
      id: '2',
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael.brown@email.com',
      phone: '+61 400 987 654',
      relationship: 'Family',
      rsvp_status: 'pending',
      plus_one: false,
      dietary_requirements: '',
      table_assignment: '',
      address: '456 Oak Ave, Melbourne VIC'
    },
    {
      id: '3',
      first_name: 'Emma',
      last_name: 'Wilson',
      email: 'emma.wilson@email.com',
      phone: '+61 400 555 777',
      relationship: 'Work Colleague',
      rsvp_status: 'not_attending',
      plus_one: false,
      dietary_requirements: '',
      table_assignment: '',
      address: '789 Pine Rd, Brisbane QLD'
    },
    {
      id: '4',
      first_name: 'David',
      last_name: 'Miller',
      email: 'david.miller@email.com',
      phone: '+61 400 111 222',
      relationship: 'Family',
      rsvp_status: 'attending',
      plus_one: true,
      dietary_requirements: 'Gluten Free',
      table_assignment: 'Table 2',
      address: '321 Cedar Ln, Perth WA'
    }
  ]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    const newGuest = {
      id: Date.now().toString(),
      ...data,
      rsvp_status: 'pending',
      plus_one: data.plus_one === 'true'
    };
    setGuests([...guests, newGuest]);
    reset();
    setShowAddModal(false);
  };

  const updateRSVP = (guestId, status) => {
    setGuests(guests.map(guest => 
      guest.id === guestId ? { ...guest, rsvp_status: status } : guest
    ));
  };

  const deleteGuest = (guestId) => {
    setGuests(guests.filter(guest => guest.id !== guestId));
  };

  // Filter guests
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = searchTerm === '' || 
      `${guest.first_name} ${guest.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || guest.rsvp_status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvp_status === 'attending').length,
    pending: guests.filter(g => g.rsvp_status === 'pending').length,
    not_attending: guests.filter(g => g.rsvp_status === 'not_attending').length,
    plus_ones: guests.filter(g => g.plus_one && g.rsvp_status === 'attending').length,
    dietary: guests.filter(g => g.dietary_requirements && g.rsvp_status === 'attending').length
  };

  const totalAttending = stats.attending + stats.plus_ones;

  const relationships = ['Family', 'Friend', 'Work Colleague', 'Childhood Friend', 'College Friend', 'Neighbor', 'Other'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/planning" className="flex items-center text-gray-600 hover:text-rose-600 mb-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Planning Tools
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Guest List Manager</h1>
            <p className="text-gray-600 mt-1">
              Organize your wedding guests and track RSVPs
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Guest
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Invited</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.attending}</div>
              <div className="text-sm text-gray-600">Attending</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.not_attending}</div>
              <div className="text-sm text-gray-600">Not Attending</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalAttending}</div>
              <div className="text-sm text-gray-600">Total Attending</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.dietary}</div>
              <div className="text-sm text-gray-600">Special Diets</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Guests</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RSVP Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">All Guests</option>
                <option value="attending">Attending</option>
                <option value="pending">Pending Response</option>
                <option value="not_attending">Not Attending</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="w-full p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Guest List ({filteredGuests.length} guests)
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedGuests.length} selected
                </span>
                {selectedGuests.length > 0 && (
                  <button className="text-sm text-red-600 hover:text-red-800">
                    Delete Selected
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {filteredGuests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relationship
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RSVP Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plus One
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Special Requirements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {guest.first_name} {guest.last_name}
                          </div>
                          {guest.table_assignment && (
                            <div className="text-sm text-gray-500">{guest.table_assignment}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Mail className="h-3 w-3 mr-1" />
                            {guest.email}
                          </div>
                          {guest.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {guest.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.relationship}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            guest.rsvp_status === 'attending' ? 'bg-green-100 text-green-800' :
                            guest.rsvp_status === 'not_attending' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {guest.rsvp_status === 'attending' ? 'Attending' :
                             guest.rsvp_status === 'not_attending' ? 'Not Attending' : 'Pending'}
                          </span>
                          {guest.rsvp_status === 'pending' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => updateRSVP(guest.id, 'attending')}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Mark as attending"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => updateRSVP(guest.id, 'not_attending')}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Mark as not attending"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.plus_one ? (
                          <span className="text-green-600 flex items-center">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.dietary_requirements || (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-rose-600 hover:text-rose-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteGuest(guest.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {guests.length === 0 ? 'No guests yet' : 'No guests match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {guests.length === 0 
                  ? 'Start building your guest list for your special day'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {guests.length === 0 ? (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700"
                >
                  Add First Guest
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Guest List Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium mb-2">RSVP Deadlines</h4>
              <p>Set RSVP deadlines 3-4 weeks before your wedding date.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Plus Ones</h4>
              <p>Be clear about plus-one policies on your invitations.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Dietary Requirements</h4>
              <p>Collect dietary information early to share with your caterer.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Table Planning</h4>
              <p>Start thinking about seating arrangements once RSVPs come in.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Guest</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    {...register('first_name', { required: 'First name is required' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    placeholder="First name"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    {...register('last_name', { required: 'Last name is required' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    placeholder="Last name"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <select
                    {...register('relationship', { required: 'Relationship is required' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Select relationship</option>
                    {relationships.map(rel => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                  {errors.relationship && (
                    <p className="mt-1 text-sm text-red-600">{errors.relationship.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  {...register('address')}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Full address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plus One</label>
                  <select
                    {...register('plus_one')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Requirements</label>
                  <input
                    {...register('dietary_requirements')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    placeholder="e.g., Vegetarian, Gluten Free"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 text-white py-3 px-6 rounded-lg hover:bg-rose-700"
                >
                  Add Guest
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default GuestListPage;