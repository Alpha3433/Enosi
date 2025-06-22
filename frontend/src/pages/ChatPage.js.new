import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Header, Footer } from '../components-airbnb';
import ChatComponent from '../components/ChatComponent';

const ChatPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    style={{ height: '80vh' }}
                >
                    {/* Header */}
                    <div className="bg-white px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <MessageCircle className="h-6 w-6 text-rose-600 mr-3" />
                            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                        </div>
                        <p className="text-gray-600 mt-1">
                            Communicate with vendors about your upcoming wedding
                        </p>
                    </div>

                    {/* Chat Component */}
                    <div className="h-full">
                        <ChatComponent />
                    </div>
                </motion.div>
            </div>
            
            <Footer />
        </div>
    );
};

export default ChatPage;