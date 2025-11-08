import React, { useState } from 'react';
import { User } from '../types';
import { LogoIcon } from './IconComponents';

type View = 'auth' | 'adminLogin' | 'chat' | 'adminPanel';

interface AuthProps {
  setView: (view: View) => void;
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ setView, onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
        setError('Username and password cannot be empty.');
        return;
    }

    try {
        const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');

        if (isLoginView) {
            // Login logic
            const user = storedUsers.find(u => u.username === username && u.password === password);
            if (user) {
                onLogin({ username: user.username });
            } else {
                setError('Invalid username or password.');
            }
        } else {
            // Sign-up logic
            if (storedUsers.find(u => u.username === username)) {
                setError('Username already exists.');
                return;
            }
            const newUser: User = { username, password };
            const updatedUsers = [...storedUsers, newUser];
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            onLogin({ username: newUser.username });
        }
    } catch(err) {
        console.error("Auth error:", err);
        setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
            <LogoIcon className="w-20 h-20 mx-auto text-indigo-500" />
            <h2 className="mt-6 text-3xl font-bold text-white">
                {isLoginView ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
                to continue to Abhishek's AI Assistant
            </p>
        </div>
        
        <div className="flex border-b border-gray-700">
            <button onClick={() => { setIsLoginView(true); setError(''); }} className={`flex-1 py-2 text-sm font-medium ${isLoginView ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>
                Login
            </button>
            <button onClick={() => { setIsLoginView(false); setError(''); }} className={`flex-1 py-2 text-sm font-medium ${!isLoginView ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>
                Sign Up
            </button>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          
          <button type="submit" className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">
            {isLoginView ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center">
            <button onClick={() => setView('adminLogin')} className="text-sm text-indigo-400 hover:underline">
                Admin Login
            </button>
        </div>

      </div>
    </div>
  );
};

export default Auth;