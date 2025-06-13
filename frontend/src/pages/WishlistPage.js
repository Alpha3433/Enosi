import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, DollarSign, MessageCircle, Calendar, Share2, Trash2, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Header, Footer } from '../components';

function WishlistPage() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (vendorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/wishlist/remove/${vendorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.vendor_id !== vendorId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const updateNote = async (itemId, vendorId, notes) => {
    try {
      // For now, we'll update the note by removing and re-adding
      // In a full implementation, you'd have an update endpoint
      const token = localStorage.getItem('token');
      
      // Remove and re-add with new note
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/wishlist/remove/${vendorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/wishlist/add/${vendorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      // Update local state
      setWishlistItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, notes } : item
      ));
      
      setEditingNote(null);
      setNoteText('');
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const shareWishlist = async () => {
    try {
      const shareData = {
        title: 'My Wedding Vendor Wishlist',
        text: `Check out my wedding vendor wishlist with ${wishlistItems.length} amazing vendors!`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Wishlist link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing wishlist:', error);
    }
  };

  const startChat = (vendorId) => {
    // Navigate to chat or create chat room
    window.location.href = `/chat?vendor=${vendorId}`;
  };

  const requestQuote = (vendorId) => {
    // Navigate to quote request
    window.location.href = `/vendors/${vendorId}?quote=true`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-2">
              {wishlistItems.length} vendor{wishlistItems.length !== 1 ? 's' : ''} saved for your special day
            </p>
          </div>
          
          {wishlistItems.length > 0 && (
            <div className="flex space-x-3">
              <button
                onClick={shareWishlist}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Wishlist
              </button>
              <button
                onClick={() => window.location.href = '/search'}
                className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700"
              >
                Find More Vendors
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">
              Start exploring our amazing vendors and save your favorites here
            </p>
            <button
              onClick={() => window.location.href = '/search'}
              className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700"
            >
              Browse Vendors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={item.vendor?.image || '/placeholder-vendor.jpg'}
                    alt={item.vendor?.business_name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.vendor_id)}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Added Date */}
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Added {new Date(item.added_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.vendor?.business_name}
                    </h3>
                    <div className="flex items-center text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {item.vendor?.average_rating?.toFixed(1) || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">{item.vendor?.location}</span>
                  </div>

                  {item.vendor?.pricing_from && (
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>From ${item.vendor.pricing_from}</span>
                    </div>
                  )}

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {item.vendor?.description}
                  </p>

                  {/* Notes Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <button
                        onClick={() => {
                          setEditingNote(item.id);
                          setNoteText(item.notes || '');
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {editingNote === item.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add your notes about this vendor..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateNote(item.id, item.vendor_id, noteText)}
                            className="px-3 py-1 bg-pink-600 text-white text-sm rounded hover:bg-pink-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingNote(null);
                              setNoteText('');
                            }}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 italic min-h-[3rem] flex items-center">
                        {item.notes || 'Click to add notes about this vendor...'}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => window.location.href = `/vendors/${item.vendor_id}`}
                      className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 transition-colors"
                    >
                      View Details
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => requestQuote(item.vendor_id)}
                        className="flex items-center justify-center px-3 py-2 border border-pink-600 text-pink-600 rounded-md hover:bg-pink-50 text-sm"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Get Quote
                      </button>
                      <button
                        onClick={() => startChat(item.vendor_id)}
                        className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </button>
                    </div>
                  </div>

                  {/* Priority Level */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Priority Level</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => {
                              // Update priority level - would need API endpoint
                              console.log('Update priority to', level);
                            }}
                            className={`w-4 h-4 rounded-full ${
                              level <= (item.priority || 0)
                                ? 'bg-pink-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Wishlist Stats */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wishlist Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{wishlistItems.length}</div>
                <div className="text-sm text-gray-600">Total Vendors</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {wishlistItems.filter(item => item.vendor?.average_rating >= 4.5).length}
                </div>
                <div className="text-sm text-gray-600">Top Rated (4.5+)</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {wishlistItems.filter(item => item.vendor?.verified).length}
                </div>
                <div className="text-sm text-gray-600">Verified Vendors</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(wishlistItems.map(item => item.vendor?.category)).size}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>

            {/* Categories Breakdown */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Categories in Your Wishlist</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(wishlistItems.map(item => item.vendor?.category)))
                  .filter(Boolean)
                  .map(category => {
                    const count = wishlistItems.filter(item => item.vendor?.category === category).length;
                    return (
                      <span
                        key={category}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {category} ({count})
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default WishlistPage;