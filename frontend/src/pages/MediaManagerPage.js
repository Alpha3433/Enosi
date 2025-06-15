import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image, 
  Video, 
  File, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  Grid3x3, 
  List,
  Plus,
  Eye,
  Share2,
  FolderPlus,
  Tag,
  Calendar,
  FileImage,
  FileVideo,
  FileText,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function MediaManagerPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  const categories = [
    { id: 'all', name: 'All Files', icon: File },
    { id: 'image', name: 'Images', icon: FileImage },
    { id: 'video', name: 'Videos', icon: FileVideo },
    { id: 'document', name: 'Documents', icon: FileText }
  ];

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user, filterCategory]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const category = filterCategory === 'all' ? '' : filterCategory;
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/files/user/${category || 'image'}?limit=50&offset=0`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = async (fileList) => {
    const newFiles = Array.from(fileList);
    setUploading(true);

    for (const file of newFiles) {
      await uploadFile(file);
    }

    setUploading(false);
    fetchFiles();
  };

  const uploadFile = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_category', getFileCategory(file.type));
      formData.append('tags', '');

      // Create progress tracking
      const fileId = Math.random().toString(36).substr(2, 9);
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const getFileCategory = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  };

  const deleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.original_filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareFile = async (file) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: file.original_filename,
          url: file.file_url
        });
      } else {
        await navigator.clipboard.writeText(file.file_url);
        alert('File URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = filterCategory === 'all' || file.file_category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const FileCard = ({ file }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow"
    >
      {/* File Preview */}
      <div className="relative h-40 bg-gray-100">
        {file.file_category === 'image' ? (
          <img
            src={file.file_url}
            alt={file.original_filename}
            className="w-full h-full object-cover"
          />
        ) : file.file_category === 'video' ? (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="h-12 w-12 text-gray-400" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* File Actions Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
          <button
            onClick={() => setSelectedFile(file)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => downloadFile(file)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => shareFile(file)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteFile(file.id)}
            className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/30 text-white"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* File Size Badge */}
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {formatFileSize(file.file_size)}
        </div>
      </div>

      {/* File Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate mb-1">
          {file.original_filename}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {new Date(file.created_at).toLocaleDateString()}
        </p>
        
        {/* Tags */}
        {file.tags && file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {file.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {file.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{file.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Manager</h1>
            <p className="text-gray-600 mt-2">
              Manage your wedding photos, videos, and documents
            </p>
          </div>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Upload Files
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files by name or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex space-x-2">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setFilterCategory(category.id)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      filterCategory === category.id
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid' ? 'bg-pink-600 text-white' : 'text-gray-600'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list' ? 'bg-pink-600 text-white' : 'text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mb-6">
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="bg-white rounded-lg border border-gray-200 p-4 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Uploading...</span>
                  <span className="text-sm text-gray-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Files Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredFiles.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFiles.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5 flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {file.file_category === 'image' ? (
                            <img
                              src={file.file_url}
                              alt=""
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              {file.file_category === 'video' ? (
                                <Video className="h-5 w-5 text-gray-500" />
                              ) : (
                                <FileText className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {file.original_filename}
                          </div>
                          {file.tags && file.tags.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {file.tags.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-gray-500 capitalize">
                        {file.file_category}
                      </div>
                      <div className="col-span-2 text-sm text-gray-500">
                        {formatFileSize(file.file_size)}
                      </div>
                      <div className="col-span-2 text-sm text-gray-500">
                        {new Date(file.created_at).toLocaleDateString()}
                      </div>
                      <div className="col-span-1">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setSelectedFile(file)}
                            className="text-gray-400 hover:text-gray-600"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => downloadFile(file)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="text-red-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload your first files to get started'
              }
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700"
            >
              Upload Files
            </button>
          </div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowUploadModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl max-w-lg w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Upload Files</h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-300 hover:border-pink-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Drop files here or click to browse
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Support for images, videos, and documents up to 10MB
                  </p>
                  
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 cursor-pointer inline-block"
                  >
                    Choose Files
                  </label>
                </div>

                {uploading && (
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-600">Uploading files...</div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Preview Modal */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedFile(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-4xl w-full max-h-full flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-white rounded-t-lg px-6 py-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {selectedFile.original_filename}
                  </h3>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="bg-white flex-1 flex items-center justify-center p-6">
                  {selectedFile.file_category === 'image' ? (
                    <img
                      src={selectedFile.file_url}
                      alt={selectedFile.original_filename}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : selectedFile.file_category === 'video' ? (
                    <video
                      src={selectedFile.file_url}
                      controls
                      className="max-w-full max-h-full"
                    />
                  ) : (
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Preview not available for this file type</p>
                      <button
                        onClick={() => downloadFile(selectedFile)}
                        className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
                      >
                        Download File
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-white rounded-b-lg px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {formatFileSize(selectedFile.file_size)} • {new Date(selectedFile.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadFile(selectedFile)}
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    <button
                      onClick={() => shareFile(selectedFile)}
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MediaManagerPage;