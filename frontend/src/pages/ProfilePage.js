import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  User,
  Heart,
  Building,
  Calendar,
  MapPin,
  DollarSign,
  Save,
  Camera,
  Edit,
  Settings,
  Bell,
  Lock,
  ArrowLeft,
  Upload,
  Globe,
  Instagram,
  Facebook
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { couplesAPI, vendorsAPI } from '../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const isVendor = user?.user_type === 'vendor';

  // Fetch profile data based on user type
  const { data: profile, isLoading } = useQuery({
    queryKey: isVendor ? ['vendor-profile'] : ['couple-profile'],
    queryFn: isVendor ? vendorsAPI.getProfile : couplesAPI.getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: isVendor ? vendorsAPI.updateProfile : couplesAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries([isVendor ? 'vendor-profile' : 'couple-profile']);
      setIsEditing(false);
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: profile?.data || {}
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const tabs = isVendor ? [
    { id: 'profile', label: 'Business Profile', icon: Building },
    { id: 'gallery', label: 'Gallery', icon: Camera },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] : [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'wedding', label: 'Wedding Details', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={isVendor ? "/vendor-dashboard" : "/dashboard"} 
            className="flex items-center text-gray-600 hover:text-rose-600 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isVendor ? 'Business Profile' : 'Profile Settings'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isVendor 
              ? 'Manage your business information and settings'
              : 'Manage your account and wedding details'
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {isVendor ? 'Business Information' : 'Personal Information'}
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {isVendor ? (
                  <VendorProfileForm register={register} errors={errors} profile={profile?.data} />
                ) : (
                  <CoupleProfileForm register={register} errors={errors} profile={profile?.data} />
                )}
                
                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="flex-1 bg-rose-600 text-white py-3 px-6 rounded-lg hover:bg-rose-700 disabled:opacity-50"
                  >
                    {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {isVendor ? (
                  <VendorProfileView profile={profile?.data} />
                ) : (
                  <CoupleProfileView profile={profile?.data} user={user} />
                )}
              </div>
            )}
          </div>
        )}

        {/* Gallery Tab (Vendor only) */}
        {activeTab === 'gallery' && isVendor && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Photo Gallery</h2>
              <button className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile?.data?.gallery_images?.length > 0 ? (
                profile.data.gallery_images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
                  <p className="text-gray-600 mb-6">Showcase your work by uploading photos</p>
                  <button className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700">
                    Upload First Photo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wedding Details Tab (Couple only) */}
        {activeTab === 'wedding' && !isVendor && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Wedding Details</h2>
            <WeddingDetailsView profile={profile?.data} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
              <AccountSettings user={user} />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

// Component for Vendor Profile Form
const VendorProfileForm = ({ register, errors, profile }) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
      <input
        {...register('business_name', { required: 'Business name is required' })}
        defaultValue={profile?.business_name}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
      />
      {errors.business_name && (
        <p className="mt-1 text-sm text-red-600">{errors.business_name.message}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <select
        {...register('category', { required: 'Category is required' })}
        defaultValue={profile?.category}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
      >
        <option value="">Select category</option>
        <option value="photographer">Photography</option>
        <option value="venue">Venue</option>
        <option value="catering">Catering</option>
        <option value="florist">Florist</option>
        <option value="music">Music & Entertainment</option>
        <option value="makeup">Hair & Makeup</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
      <textarea
        {...register('description', { required: 'Description is required' })}
        defaultValue={profile?.description}
        rows={4}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <input
          {...register('location', { required: 'Location is required' })}
          defaultValue={profile?.location}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
        <input
          {...register('years_experience')}
          type="number"
          defaultValue={profile?.years_experience}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
        <input
          {...register('website')}
          type="url"
          defaultValue={profile?.website}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
        <input
          {...register('instagram')}
          defaultValue={profile?.instagram}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
        <input
          {...register('facebook')}
          defaultValue={profile?.facebook}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        />
      </div>
    </div>
  </>
);

// Component for Couple Profile Form
const CoupleProfileForm = ({ register, errors, profile }) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Partner Name</label>
      <input
        {...register('partner_name')}
        defaultValue={profile?.partner_name}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Date</label>
        <input
          {...register('wedding_date')}
          type="date"
          defaultValue={profile?.wedding_date?.split('T')[0]}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Guest Count</label>
        <input
          {...register('guest_count')}
          type="number"
          defaultValue={profile?.guest_count}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Venue Location</label>
        <input
          {...register('venue_location')}
          defaultValue={profile?.venue_location}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
        <input
          {...register('budget')}
          type="number"
          defaultValue={profile?.budget}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        />
      </div>
    </div>
  </>
);

// Component for Vendor Profile View
const VendorProfileView = ({ profile }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="text-sm font-medium text-gray-500">Business Name</label>
      <p className="text-lg text-gray-900">{profile?.business_name || 'Not set'}</p>
    </div>
    <div>
      <label className="text-sm font-medium text-gray-500">Category</label>
      <p className="text-lg text-gray-900 capitalize">{profile?.category || 'Not set'}</p>
    </div>
    <div className="md:col-span-2">
      <label className="text-sm font-medium text-gray-500">Description</label>
      <p className="text-lg text-gray-900">{profile?.description || 'Not set'}</p>
    </div>
    <div>
      <label className="text-sm font-medium text-gray-500">Location</label>
      <p className="text-lg text-gray-900">{profile?.location || 'Not set'}</p>
    </div>
    <div>
      <label className="text-sm font-medium text-gray-500">Experience</label>
      <p className="text-lg text-gray-900">
        {profile?.years_experience ? `${profile.years_experience} years` : 'Not set'}
      </p>
    </div>
  </div>
);

// Component for Couple Profile View
const CoupleProfileView = ({ profile, user }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <label className="text-sm font-medium text-gray-500">Name</label>
      <p className="text-lg text-gray-900">{user?.first_name} {user?.last_name}</p>
    </div>
    <div>
      <label className="text-sm font-medium text-gray-500">Partner Name</label>
      <p className="text-lg text-gray-900">{profile?.partner_name || 'Not set'}</p>
    </div>
    <div>
      <label className="text-sm font-medium text-gray-500">Wedding Date</label>
      <p className="text-lg text-gray-900">
        {profile?.wedding_date 
          ? new Date(profile.wedding_date).toLocaleDateString()
          : 'Not set'
        }
      </p>
    </div>
    <div>
      <label className="text-sm font-medium text-gray-500">Guest Count</label>
      <p className="text-lg text-gray-900">{profile?.guest_count || 'Not set'}</p>
    </div>
    <div>
      <label className="text-sm font-medium text-gray-500">Venue Location</label>
      <p className="text-lg text-gray-900">{profile?.venue_location || 'Not set'}</p>
    </div>
    <div>
      <label className="text-sm font-medium text-gray-500">Budget</label>
      <p className="text-lg text-gray-900">
        {profile?.budget ? `$${profile.budget.toLocaleString()}` : 'Not set'}
      </p>
    </div>
  </div>
);

// Component for Wedding Details View
const WeddingDetailsView = ({ profile }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-center p-6 bg-rose-50 rounded-lg">
        <Calendar className="h-8 w-8 text-rose-600 mx-auto mb-2" />
        <h3 className="font-medium text-gray-900">Wedding Date</h3>
        <p className="text-gray-600">
          {profile?.wedding_date 
            ? new Date(profile.wedding_date).toLocaleDateString()
            : 'Not set'
          }
        </p>
      </div>
      <div className="text-center p-6 bg-blue-50 rounded-lg">
        <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
        <h3 className="font-medium text-gray-900">Venue</h3>
        <p className="text-gray-600">{profile?.venue_location || 'Not set'}</p>
      </div>
      <div className="text-center p-6 bg-green-50 rounded-lg">
        <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
        <h3 className="font-medium text-gray-900">Guests</h3>
        <p className="text-gray-600">{profile?.guest_count || 'Not set'}</p>
      </div>
    </div>
  </div>
);

// Component for Account Settings
const AccountSettings = ({ user }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-gray-900">{user?.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Account Type</label>
          <p className="text-gray-900 capitalize">{user?.user_type}</p>
        </div>
      </div>
    </div>
    
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
      <div className="space-y-3">
        <button className="flex items-center text-gray-700 hover:text-gray-900">
          <Lock className="h-4 w-4 mr-2" />
          Change Password
        </button>
        <button className="flex items-center text-gray-700 hover:text-gray-900">
          <Bell className="h-4 w-4 mr-2" />
          Notification Settings
        </button>
      </div>
    </div>
  </div>
);

export default ProfilePage;