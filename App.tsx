import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Chat, Message, MessageSender, User } from './types';
import { getChatResponseStream, generateImage } from './services/geminiService';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import ChatHistory from './components/ChatHistory';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Auth from './components/Auth';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import ShareModal from './components/ShareModal';
import { MenuIcon, ShareIcon, UserIcon, ShieldCheckIcon, LogoutIcon } from './components/IconComponents';

type View = 'auth' | 'adminLogin' | 'chat' | 'adminPanel';

const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const App: React.FC = () => {
    const [view, setView] = useState<View>('auth');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    
    const { speak, cancel, isSpeaking } = useSpeechSynthesis();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const prevChatsRef = useRef<Chat[] | undefined>(undefined);
    const prevIsLoadingRef = useRef(false);


    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chats, activeChatId, isLoading]);

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Check for logged in user on mount
    useEffect(() => {
        try {
            const storedUser = sessionStorage.getItem('currentUser');
            if (storedUser) {
                const user: User = JSON.parse(storedUser);
                setCurrentUser(user);
                setView('chat');
            }
        } catch (error) {
            console.error("Failed to parse user from session storage:", error);
            sessionStorage.removeItem('currentUser');
        }
    }, []);

    // Load user's chats when user logs in
    useEffect(() => {
        if (currentUser) {
            try {
                const storedChats = localStorage.getItem(`chats_${currentUser.username}`);
                if (storedChats) {
                    const userChats: Chat[] = JSON.parse(storedChats);
                    setChats(userChats);
                    if (userChats.length > 0) {
                        setActiveChatId(userChats[0].id);
                    } else {
                        handleNewChat();
                    }
                } else {
                    handleNewChat();
                }
            } catch (error) {
                console.error("Failed to parse chats from local storage:", error);
                handleNewChat();
            }
        } else {
            setChats([]);
            setActiveChatId(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    // Save chats to localStorage whenever they change
    useEffect(() => {
        if (currentUser && chats.length > 0) {
            localStorage.setItem(`chats_${currentUser.username}`, JSON.stringify(chats));
        }
    }, [chats, currentUser]);

    // Generate header image when a new chat gets a title
    useEffect(() => {
        const activeChat = chats.find(c => c.id === activeChatId);
        const prevActiveChat = prevChatsRef.current?.find(c => c.id === activeChatId);
    
        if (activeChat && prevActiveChat && prevActiveChat.title === 'New Chat' && activeChat.title !== 'New Chat' && !activeChat.headerImage) {
            (async () => {
                setIsGeneratingImage(true);
                try {
                    const prompt = `A visually stunning, abstract header image for a chat about: "${activeChat.title}"`;
                    const imageUrl = await generateImage(prompt);
                    if (imageUrl) {
                        setChats(prev => prev.map(chat => 
                            chat.id === activeChatId ? { ...chat, headerImage: imageUrl } : chat
                        ));
                    }
                } catch (error) {
                    console.error("Failed to generate header image:", error);
                } finally {
                    setIsGeneratingImage(false);
                }
            })();
        }
        
        prevChatsRef.current = chats;
    }, [chats, activeChatId]);

    // This effect handles auto-speaking the AI response when it's finished loading.
    useEffect(() => {
        if (prevIsLoadingRef.current && !isLoading) { // Check if loading just finished
            const activeChat = chats.find(c => c.id === activeChatId);
            if (activeChat && activeChat.messages.length > 0) {
                const lastMessage = activeChat.messages[activeChat.messages.length - 1];
                // Ensure the last message is from AI, has text, and is not an error message.
                if (lastMessage.sender === MessageSender.AI && lastMessage.text.trim() && !lastMessage.text.startsWith("Sorry, I encountered an error.")) {
                    cancel(); // Cancel any previous speech
                    speak(lastMessage.text);
                    setSpeakingMessageId(lastMessage.id);
                }
            }
        }
        // Update ref for the next render cycle.
        prevIsLoadingRef.current = isLoading;
    }, [isLoading, chats, activeChatId, speak, cancel]);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        setView('chat'); 
    };

    const handleLogout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
        setView('auth');
    };

    const handleNewChat = () => {
        const newId = uuidv4();
        const newChat: Chat = {
            id: newId,
            title: 'New Chat',
            messages: [{
                id: uuidv4(),
                text: "Hello! I am Abhishek's AI assistant. How can I help you today?",
                sender: MessageSender.AI,
                timestamp: getTimestamp(),
            }],
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(newId);
        setIsHistoryOpen(false);
    };

    const handleSelectChat = (id: string) => {
        setActiveChatId(id);
        setIsHistoryOpen(false);
    };

    const handleDeleteChat = (id: string) => {
        setChats(prev => prev.filter(c => c.id !== id));
        if (activeChatId === id) {
            const remainingChats = chats.filter(c => c.id !== id);
             if (remainingChats.length > 0) {
                setActiveChatId(remainingChats[0].id);
            } else {
                handleNewChat();
            }
        }
    };
    
    const handleSpeak = (message: Message) => {
        if (isSpeaking && speakingMessageId === message.id) {
            // If the clicked message is already speaking, stop it.
            cancel();
            setSpeakingMessageId(null);
        } else {
            // If any other message is speaking, cancel it before starting the new one.
            cancel();
            speak(message.text);
            setSpeakingMessageId(message.id);
        }
    };

    useEffect(() => {
        if (!isSpeaking) {
            setSpeakingMessageId(null);
        }
    }, [isSpeaking]);

    const handleSendMessage = useCallback(async (text: string, file?: File) => {
        if (!activeChatId) return;

        const historyForAPI = chats.find(c => c.id === activeChatId)?.messages ?? [];

        const fileData = file ? {
            type: file.type,
            name: file.name,
            data: await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            }),
        } : undefined;

        const userMessage: Message = { id: uuidv4(), text, sender: MessageSender.USER, timestamp: getTimestamp(), file: fileData };
        const aiMessagePlaceholder: Message = { id: uuidv4(), text: '', sender: MessageSender.AI, timestamp: getTimestamp() };

        setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, userMessage, aiMessagePlaceholder] } : c));
        setIsLoading(true);

        try {
            if (text.toLowerCase().startsWith('/imagine')) {
                const prompt = text.substring(8).trim();
                const imageUrl = await generateImage(prompt);
                const aiImageMessage: Message = {
                    id: aiMessagePlaceholder.id,
                    text: `Here is the image you requested for: "${prompt}"`,
                    sender: MessageSender.AI,
                    timestamp: getTimestamp(),
                    file: imageUrl ? { type: 'image/png', data: imageUrl, name: 'generated-image.png' } : undefined
                };
                setChats(prev => prev.map(c => c.id === activeChatId ? {...c, messages: [...c.messages.slice(0, -1), aiImageMessage]} : c));
            } else {
                const stream = await getChatResponseStream(text, historyForAPI, fileData);

                let fullResponse = "";
                for await (const chunk of stream) {
                    const chunkText = chunk.text;
                    if(chunkText) {
                        fullResponse += chunkText;
                        setChats(prev => prev.map(c => {
                            if (c.id === activeChatId) {
                                const newMessages = [...c.messages];
                                newMessages[newMessages.length - 1].text = fullResponse;
                                return { ...c, messages: newMessages };
                            }
                            return c;
                        }));
                    }
                }
                
                setChats(prev => {
                    const currentChat = prev.find(c => c.id === activeChatId);
                    if (currentChat && currentChat.title === 'New Chat') {
                        const newTitle = text.substring(0, 25) + (text.length > 25 ? '...' : '');
                        return prev.map(c => c.id === activeChatId ? { ...c, title: newTitle } : c);
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Error getting AI response:", error);
            const errorMessage: Message = { ...aiMessagePlaceholder, text: "Sorry, I encountered an error. Please try again." };
            setChats(prev => prev.map(c => c.id === activeChatId ? {...c, messages: [...c.messages.slice(0, -1), errorMessage]}: c));
        } finally {
            setIsLoading(false);
        }
    }, [activeChatId, chats]);

    const activeChat = chats.find(chat => chat.id === activeChatId);

    if (view === 'auth') return <Auth setView={setView} onLogin={handleLogin} />;
    if (view === 'adminLogin') return <AdminLogin setView={setView} onLogin={handleLogin} />;
    if (view === 'adminPanel') return <AdminPanel setView={setView} />;

    const showImageHeader = activeChat && (activeChat.headerImage || (isGeneratingImage && activeChat.title !== 'New Chat'));

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} chat={activeChat ?? null} />
            <ChatHistory chats={chats} activeChatId={activeChatId} onNewChat={handleNewChat} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} isOpen={isHistoryOpen} setIsOpen={setIsHistoryOpen} />
            
            <main className="flex-1 flex flex-col bg-gray-900">
                 <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm flex-shrink-0 z-10">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsHistoryOpen(true)} className="md:hidden p-2 rounded-md hover:bg-gray-700">
                           <MenuIcon className="w-6 h-6"/>
                        </button>
                        {!showImageHeader && <h1 className="text-lg font-semibold truncate">{activeChat?.title || 'Chat'}</h1>}
                    </div>
                     <div className="flex items-center gap-4">
                        {activeChat && activeChat.messages.length > 1 && (
                            <button onClick={() => setIsShareModalOpen(true)} className="p-2 rounded-md hover:bg-gray-700" aria-label="Share chat">
                                <ShareIcon className="w-5 h-5"/>
                            </button>
                        )}
                        <div ref={profileMenuRef} className="relative">
                            <button onClick={() => setIsProfileOpen(prev => !prev)} className="w-8 h-8 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition">
                                <UserIcon className="w-5 h-5 text-white" />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 animate-fade-in-down">
                                    <div className="p-3 border-b border-gray-700"><p className="text-sm font-medium text-white truncate">Signed in as</p><p className="text-sm font-semibold text-white truncate">{currentUser?.username}</p></div>
                                    <div className="py-1">
                                        {currentUser?.username === 'admin' && (
                                            <button onClick={() => { setView('adminPanel'); setIsProfileOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"><ShieldCheckIcon className="w-5 h-5"/>Admin Panel</button>
                                        )}
                                        <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"><LogoutIcon className="w-5 h-5"/>Logout</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                
                {showImageHeader && (
                    <div className="relative h-32 md:h-40 bg-gray-800 flex-shrink-0">
                        {isGeneratingImage && !activeChat.headerImage && (
                            <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
                                <p className="text-gray-400 text-sm">Generating header image...</p>
                            </div>
                        )}
                        {activeChat.headerImage && (
                            <img src={activeChat.headerImage} alt={activeChat.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent flex items-end p-4">
                            <h2 className="text-2xl font-bold text-white shadow-lg">{activeChat.title}</h2>
                        </div>
                    </div>
                )}

                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
                    {activeChat ? (
                        activeChat.messages.map(msg => (
                            <ChatMessage key={msg.id} message={msg} onSpeak={handleSpeak} isSpeaking={isSpeaking} speakingMessageId={speakingMessageId} />
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500"><p>Select a chat or start a new one.</p></div>
                    )}
                </div>
                <div className="p-4 md:p-6 border-t border-gray-700 bg-gray-900">
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                </div>
            </main>
        </div>
    );
};

export default App;