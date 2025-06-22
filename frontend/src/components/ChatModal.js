import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import ChatComponent from './ChatComponent';

const ChatModal = ({ isOpen, onClose, vendorId = null, vendorName = null }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    {/* Background overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        onClick={onClose}
                    />

                    {/* Modal panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
                        style={{ height: '80vh' }}
                    >
                        {/* Header */}
                        <div className="bg-white px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <MessageCircle className="h-6 w-6 text-rose-600 mr-3" />
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {vendorName ? `Chat with ${vendorName}` : 'Messages'}
                                    </h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Chat content */}
                        <div className="h-full">
                            <ChatComponent vendorId={vendorId} onClose={onClose} />
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};

// Chat Button Component for easy integration
export const ChatButton = ({ vendorId, vendorName, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center justify-center bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors ${className}`}
            >
                <MessageCircle className="h-5 w-5 mr-2" />
                Message Vendor
            </button>

            <ChatModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                vendorId={vendorId}
                vendorName={vendorName}
            />
        </>
    );
};

export default ChatModal;