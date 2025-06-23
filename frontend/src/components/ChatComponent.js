import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { 
    Chat, 
    Channel, 
    Window, 
    ChannelHeader, 
    MessageList, 
    MessageInput,
    Thread,
    LoadingIndicator,
    ChannelList
} from 'stream-chat-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

// CSS import removed as it's causing build issues

const ChatComponent = ({ vendorId = null, onClose = null }) => {
    const [client, setClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const initializeChat = async () => {
            if (!user) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Get Stream token from backend
                const response = await authAPI.get('/chat/auth-token');
                const { token, api_key, user_id, user_name } = response.data;

                // Initialize Stream client
                const chatClient = StreamChat.getInstance(api_key);
                
                // Connect user
                await chatClient.connectUser(
                    {
                        id: user_id,
                        name: user_name,
                        role: user.user_type,
                        email: user.email
                    },
                    token
                );

                setClient(chatClient);

                // If vendorId is provided, start a conversation with that vendor
                if (vendorId) {
                    const channelResponse = await authAPI.post('/chat/start-conversation', null, {
                        params: { vendor_id: vendorId }
                    });
                    
                    const channelInstance = chatClient.channel('messaging', channelResponse.data.channel_id);
                    await channelInstance.watch();
                    setChannel(channelInstance);
                }

                setLoading(false);
            } catch (error) {
                console.error('Chat initialization failed:', error);
                setError('Failed to initialize chat. Please try again.');
                setLoading(false);
            }
        };

        initializeChat();

        // Cleanup on unmount
        return () => {
            if (client) {
                client.disconnectUser().catch(console.error);
            }
        };
    }, [user, vendorId]);

    // Custom file upload handler
    const handleFileUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await authAPI.post('/chat/upload-file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return { file: response.data.url };
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingIndicator />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="flex items-center justify-center h-96">
                <div>Failed to initialize chat</div>
            </div>
        );
    }

    return (
        <div className="h-full min-h-96 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Chat client={client} theme="messaging light">
                {channel ? (
                    // Single channel view (when chatting with specific vendor)
                    <Channel channel={channel}>
                        <Window>
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <ChannelHeader />
                                {onClose && (
                                    <button
                                        onClick={onClose}
                                        className="text-gray-500 hover:text-gray-700 text-xl"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <MessageList />
                            <MessageInput 
                                multipleFiles={true}
                                acceptedFiles={['image/*', 'application/pdf', 'text/plain']}
                                maxNumberOfFiles={5}
                                doFileUploadRequest={handleFileUpload}
                            />
                        </Window>
                        <Thread />
                    </Channel>
                ) : (
                    // Channel list view (when showing all conversations)
                    <div className="flex h-full">
                        <div className="w-1/3 border-r border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                                {onClose && (
                                    <button
                                        onClick={onClose}
                                        className="float-right text-gray-500 hover:text-gray-700 text-xl"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <ChannelList 
                                filters={{ members: { $in: [user.id] } }}
                                sort={{ last_message_at: -1 }}
                                Preview={(props) => (
                                    <div 
                                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                                        onClick={() => setChannel(props.channel)}
                                    >
                                        <div className="font-medium text-gray-900">
                                            {props.channel.data.name || 'Conversation'}
                                        </div>
                                        <div className="text-sm text-gray-600 truncate">
                                            {props.latestMessage?.text || 'No messages yet'}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.906-1.468L3 21l2.532-5.094A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                                </svg>
                                <p>Select a conversation to start messaging</p>
                            </div>
                        </div>
                    </div>
                )}
            </Chat>
        </div>
    );
};

export default ChatComponent;