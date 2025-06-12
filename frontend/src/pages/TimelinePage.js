import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  ArrowLeft,
  Download,
  Share,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO, addMinutes } from 'date-fns';
import { Header, Footer } from '../components';

const TimelinePage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('timeline'); // timeline, schedule
  
  // Mock data for timeline events
  const mockEvents = [
    {
      id: '1',
      title: 'Hair & Makeup',
      start_time: '2024-06-15T08:00:00',
      end_time: '2024-06-15T11:00:00',
      location: 'Bridal Suite',
      description: 'Hair and makeup for bride and bridesmaids',
      attendees: ['Bride', 'Bridesmaids'],
      vendor: 'Glamour Beauty Studio'
    },
    {
      id: '2',
      title: 'Photography - Getting Ready',
      start_time: '2024-06-15T10:00:00',
      end_time: '2024-06-15T12:00:00',
      location: 'Bridal Suite',
      description: 'Capture getting ready moments',
      attendees: ['Photographer'],
      vendor: 'Eternal Moments Photography'
    },
    {
      id: '3',
      title: 'First Look',
      start_time: '2024-06-15T13:00:00',
      end_time: '2024-06-15T13:30:00',
      location: 'Garden Area',
      description: 'Private first look between couple',
      attendees: ['Bride', 'Groom', 'Photographer']
    },
    {
      id: '4',
      title: 'Wedding Ceremony',
      start_time: '2024-06-15T15:00:00',
      end_time: '2024-06-15T15:45:00',
      location: 'Main Ceremony Area',
      description: 'Wedding ceremony with guests',
      attendees: ['All Guests'],
      vendor: 'Celebrant Services'
    },
    {
      id: '5',
      title: 'Cocktail Hour',
      start_time: '2024-06-15T16:00:00',
      end_time: '2024-06-15T17:00:00',
      location: 'Terrace',
      description: 'Drinks and canapés while photos are taken',
      attendees: ['All Guests'],
      vendor: 'Premium Catering Co'
    },
    {
      id: '6',
      title: 'Reception Dinner',
      start_time: '2024-06-15T18:00:00',
      end_time: '2024-06-15T21:00:00',
      location: 'Reception Hall',
      description: 'Three-course dinner with speeches',
      attendees: ['All Guests'],
      vendor: 'Premium Catering Co'
    },
    {
      id: '7',
      title: 'Dancing & Party',
      start_time: '2024-06-15T21:00:00',
      end_time: '2024-06-15T24:00:00',
      location: 'Reception Hall',
      description: 'Dancing and celebration',
      attendees: ['All Guests'],
      vendor: 'DJ Sound Solutions'
    }
  ];

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log('New event:', data);
    reset();
    setShowAddModal(false);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getEventColor = (index) => {
    const colors = [
      'bg-rose-100 border-rose-300 text-rose-800',
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-orange-100 border-orange-300 text-orange-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800'
    ];
    return colors[index % colors.length];
  };

  const formatTime = (timeString) => {
    return format(parseISO(timeString), 'h:mm a');
  };

  const calculateDuration = (start, end) => {
    const startTime = parseISO(start);
    const endTime = parseISO(end);
    const diffInMinutes = (endTime - startTime) / (1000 * 60);
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Wedding Day Timeline</h1>
            <p className="text-gray-600 mt-1">
              Plan every moment of your perfect wedding day
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share className="h-4 w-4 mr-2" />
              Share
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
              Add Event
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Wedding Day: June 15, 2024</h2>
              <p className="text-gray-600">
                {mockEvents.length} events scheduled • {calculateDuration(mockEvents[0]?.start_time, mockEvents[mockEvents.length - 1]?.end_time)} total
              </p>
            </div>
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'timeline'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-l-lg`}
              >
                Timeline View
              </button>
              <button
                onClick={() => setViewMode('schedule')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'schedule'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-r-lg border-l border-gray-300`}
              >
                Schedule View
              </button>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Wedding Day Timeline</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {mockEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-rose-600 rounded-full"></div>
                      {index < mockEvents.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 pb-8">
                      <div className={`p-4 rounded-lg border-2 ${getEventColor(index)}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <div className="flex items-center space-x-4 text-sm mt-1">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(event.start_time)} - {formatTime(event.end_time)}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {calculateDuration(event.start_time, event.end_time)}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-1 text-gray-500 hover:text-gray-700">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center text-sm mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                        
                        {event.description && (
                          <p className="text-sm mb-3">{event.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm">
                            <Users className="h-4 w-4 mr-1" />
                            {event.attendees?.join(', ')}
                          </div>
                          {event.vendor && (
                            <span className="text-xs bg-white bg-opacity-75 px-2 py-1 rounded">
                              {event.vendor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Schedule View */}
        {viewMode === 'schedule' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Schedule View</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor/Attendees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockEvents.map((event, index) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatTime(event.start_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-gray-500">{event.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateDuration(event.start_time, event.end_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {event.vendor && (
                            <div className="font-medium">{event.vendor}</div>
                          )}
                          <div className="text-gray-500">{event.attendees?.join(', ')}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-rose-600 hover:text-rose-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Timeline Tips */}
        <div className="mt-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Timeline Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium mb-2">Buffer Time</h4>
              <p>Add 15-30 minute buffers between major events to account for delays.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Vendor Coordination</h4>
              <p>Share your timeline with all vendors at least 2 weeks before the wedding.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Photography Time</h4>
              <p>Allow extra time for formal photos - they always take longer than expected.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Backup Plans</h4>
              <p>Have contingency plans for outdoor events in case of weather changes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Event</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                <input
                  {...register('title', { required: 'Event title is required' })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="e.g., Wedding Ceremony"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Event details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    {...register('start_time', { required: 'Start time is required' })}
                    type="datetime-local"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                  {errors.start_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    {...register('end_time', { required: 'End time is required' })}
                    type="datetime-local"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                  {errors.end_time && (
                    <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  {...register('location')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Event location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attendees</label>
                <input
                  {...register('attendees')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Who will be involved? (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor/Contact</label>
                <input
                  {...register('vendor')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Vendor or contact person"
                />
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
                  Add Event
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

export default TimelinePage;