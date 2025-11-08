import React, { useState, useEffect } from 'react';
import { User, Chat } from '../types';
import { ArrowLeftIcon } from './IconComponents';

type View = 'auth' | 'adminLogin' | 'chat' | 'adminPanel';

interface AdminPanelProps {
    setView: (view: View) => void;
}

interface UserWithChats extends User {
    chats: Chat[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ setView }) => {
    const [usersWithChats, setUsersWithChats] = useState<UserWithChats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
            const allUserData = users.map(user => {
                const userChats: Chat[] = JSON.parse(localStorage.getItem(`chats_${user.username}`) || '[]');
                return { ...user, chats: userChats };
            });
            setUsersWithChats(allUserData);
        } catch (error) {
            console.error("Failed to load admin data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => setView('chat')}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                </div>

                {loading ? (
                    <p>Loading user data...</p>
                ) : (
                    <div className="space-y-6">
                        {usersWithChats.map(user => (
                            <div key={user.username} className="bg-gray-800 rounded-lg p-4">
                                <h2 className="text-xl font-semibold text-indigo-400">{user.username}</h2>
                                {user.chats.length > 0 ? (
                                    <ul className="mt-2 space-y-1 list-disc list-inside text-gray-300">
                                        {user.chats.map(chat => (
                                            <li key={chat.id} className="truncate">
                                                <span className="font-mono text-xs text-gray-500 mr-2">{chat.id.substring(0,8)}</span>
                                                {chat.title} ({chat.messages.length} messages)
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="mt-2 text-gray-500">No chats found for this user.</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;