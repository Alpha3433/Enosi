import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Globe, BarChart3, ChevronRight, Plus } from 'lucide-react';
import { Header, Footer } from '../components';
import SeatingChart from '../components/SeatingChart';

function AdvancedPlanningPage() {
  const [activeTab, setActiveTab] = useState('seating');
  const [guests, setGuests] = useState([]);
  const [seatingCharts, setSeatingCharts] = useState([]);
  const [weddingWebsite, setWeddingWebsite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanningData();
  }, []);

  const fetchPlanningData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch guests
      const guestsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/planning/guests`, { headers });
      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json();
        setGuests(guestsData);
      }

      // Fetch seating charts
      const chartsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/planning/seating-charts`, { headers });
      if (chartsResponse.ok) {
        const chartsData = await chartsResponse.json();
        setSeatingCharts(chartsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching planning data:', error);
      setLoading(false);
    }
  };

  const handleSaveSeatingChart = async (chartData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/planning/seating-charts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chartData)
      });

      if (response.ok) {
        const newChart = await response.json();
        setSeatingCharts(prev => [...prev, newChart]);
        return newChart;
      } else {
        throw new Error('Failed to save seating chart');
      }
    } catch (error) {
      console.error('Error saving seating chart:', error);
      throw error;
    }
  };

  const createWeddingWebsite = async () => {
    try {
      const token = localStorage.getItem('token');
      const websiteData = {
        title: "Our Wedding",
        welcome_message: "Join us for our special day!",
        wedding_date: new Date().toISOString(),
        venue_name: "Wedding Venue",
        venue_address: "123 Wedding St, City, State",
        rsvp_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
        url_slug: "our-wedding-" + Date.now()
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/planning/wedding-website`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(websiteData)
      });

      if (response.ok) {
        const website = await response.json();
        setWeddingWebsite(website);
      }
    } catch (error) {
      console.error('Error creating wedding website:', error);
    }
  };

  const tabs = [
    {
      id: 'seating',
      name: 'Seating Charts',
      icon: Users,
      description: 'Create and optimize table arrangements'
    },
    {
      id: 'rsvp',
      name: 'RSVP Management',
      icon: Calendar,
      description: 'Manage guest responses and preferences'
    },
    {
      id: 'website',
      name: 'Wedding Website',
      icon: Globe,
      description: 'Create your custom wedding website'
    },
    {
      id: 'analytics',
      name: 'Planning Analytics',
      icon: BarChart3,
      description: 'Track planning progress and insights'
    }
  ];

  const SeatingChartsTab = () => (
    <div className="space-y-6">
      {seatingCharts.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Seating Charts Yet</h3>
          <p className="text-gray-600 mb-6">Create your first seating chart to organize your wedding reception.</p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              You have {guests.length} guests to seat
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {seatingCharts.map((chart) => (
            <motion.div
              key={chart.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-pink-300"
            >
              <h4 className="font-semibold text-gray-900 mb-2">{chart.layout_name}</h4>
              <p className="text-sm text-gray-600 mb-4">
                {chart.tables.length} tables • {chart.venue_layout}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Updated {new Date(chart.updated_at).toLocaleDateString()}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <SeatingChart
        guests={guests}
        onSave={handleSaveSeatingChart}
      />
    </div>
  );

  const RSVPTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">RSVP Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{guests.length}</div>
            <div className="text-sm text-gray-600">Total Invited</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {guests.filter(g => g.rsvp_status === 'attending').length}
            </div>
            <div className="text-sm text-gray-600">Attending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {guests.filter(g => g.rsvp_status === 'declined').length}
            </div>
            <div className="text-sm text-gray-600">Declined</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {guests.filter(g => g.rsvp_status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Guest List</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RSVP Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dietary Needs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plus One
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guests.map((guest) => (
                  <tr key={guest.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {guest.first_name} {guest.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{guest.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        guest.rsvp_status === 'attending' ? 'bg-green-100 text-green-800' :
                        guest.rsvp_status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {guest.rsvp_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.dietary_requirements || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.plus_one ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const WebsiteTab = () => (
    <div className="space-y-6">
      {!weddingWebsite ? (
        <div className="text-center py-12">
          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Wedding Website</h3>
          <p className="text-gray-600 mb-6">
            Share details about your special day and collect RSVPs from your guests.
          </p>
          <button
            onClick={createWeddingWebsite}
            className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 transition-colors"
          >
            Create Wedding Website
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Wedding Website</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={`weddingsite.com/${weddingWebsite.url_slug}`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Copy
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
              <textarea
                value={weddingWebsite.welcome_message}
                onChange={(e) => setWeddingWebsite(prev => ({...prev, welcome_message: e.target.value}))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Date</label>
                <input
                  type="datetime-local"
                  value={weddingWebsite.wedding_date ? new Date(weddingWebsite.wedding_date).toISOString().slice(0, -1) : ''}
                  onChange={(e) => setWeddingWebsite(prev => ({...prev, wedding_date: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RSVP Deadline</label>
                <input
                  type="date"
                  value={weddingWebsite.rsvp_deadline ? new Date(weddingWebsite.rsvp_deadline).toISOString().split('T')[0] : ''}
                  onChange={(e) => setWeddingWebsite(prev => ({...prev, rsvp_deadline: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Website Status</h4>
                  <p className="text-sm text-gray-600">
                    {weddingWebsite.is_published ? 'Published and live' : 'Draft - not visible to guests'}
                  </p>
                </div>
                <button
                  onClick={() => setWeddingWebsite(prev => ({...prev, is_published: !prev.is_published}))}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    weddingWebsite.is_published 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {weddingWebsite.is_published ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-2">Planning Progress</h4>
          <div className="text-3xl font-bold text-green-600 mb-1">73%</div>
          <p className="text-sm text-gray-600">Complete</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-2">Budget Used</h4>
          <div className="text-3xl font-bold text-blue-600 mb-1">82%</div>
          <p className="text-sm text-gray-600">Of total budget</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-2">Days Remaining</h4>
          <div className="text-3xl font-bold text-purple-600 mb-1">127</div>
          <p className="text-sm text-gray-600">Until wedding day</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Planning Insights</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-900">Vendor Bookings</h4>
              <p className="text-sm text-blue-700">You've booked 6 out of 8 recommended vendors</p>
            </div>
            <div className="text-blue-600 font-bold">75%</div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-medium text-green-900">RSVP Responses</h4>
              <p className="text-sm text-green-700">Great response rate! Most guests have replied</p>
            </div>
            <div className="text-green-600 font-bold">89%</div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <h4 className="font-medium text-yellow-900">Tasks Completion</h4>
              <p className="text-sm text-yellow-700">Some high-priority tasks need attention</p>
            </div>
            <div className="text-yellow-600 font-bold">68%</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'seating':
        return <SeatingChartsTab />;
      case 'rsvp':
        return <RSVPTab />;
      case 'website':
        return <WebsiteTab />;
      case 'analytics':
        return <AnalyticsTab />;
      default:
        return <SeatingChartsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Planning Tools</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive tools to plan every detail of your perfect wedding
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
                    <div className="text-left">
                      <div>{tab.name}</div>
                      <div className="text-xs opacity-75">{tab.description}</div>
                    </div>
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
          {renderTabContent()}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

export default AdvancedPlanningPage;