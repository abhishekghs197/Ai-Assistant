import React, { useState } from 'react';
import { User } from '../types';
import { KeyIcon } from './IconComponents';

type View = 'auth' | 'adminLogin' | 'chat' | 'adminPanel';

interface AdminLoginProps {
  setView: (view: View) => void;
  onLogin: (user: User) => void;
}

const ADMIN_PASSWORD = 'admin123';
const ADMIN_USERNAME = 'admin';

const AdminLogin: React.FC<AdminLoginProps> = ({ setView, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
        // Ensure admin user exists in localStorage
        try {
            const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
            const adminUser = storedUsers.find(u => u.username === ADMIN_USERNAME);
            if (!adminUser) {
                const updatedUsers = [...storedUsers, { username: ADMIN_USERNAME, password: ADMIN_PASSWORD }];
                localStorage.setItem('users', JSON.stringify(updatedUsers));
            }
        } catch (err) {
            console.error("Failed to setup admin user:", err);
            setError("An unexpected error occurred.");
            return;
        }

        const adminSession: User = { username: ADMIN_USERNAME };
        onLogin(adminSession);

    } else {
      setError('Incorrect admin password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
            <KeyIcon className="w-16 h-16 mx-auto text-indigo-500" />
            <h2 className="mt-4 text-3xl font-bold text-white">
                Admin Access
            </h2>
            <p className="mt-2 text-sm text-gray-400">
                Enter the password to continue.
            </p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          
          <button type="submit" className="w-full py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">
            Login
          </button>
        </form>

        <div className="text-center">
            <button onClick={() => setView('auth')} className="text-sm text-indigo-400 hover:underline">
                Back to User Login
            </button>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;