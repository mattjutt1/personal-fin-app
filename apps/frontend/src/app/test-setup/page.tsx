"use client";

import { useState } from "react";

export default function TestSetupPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (type: 'premium' | 'free' | 'trial') => {
    setLoading(true);
    try {
      // For now, just add instructions since Convex setup is having issues
      const userInfo = {
        premium: { email: 'test@example.com', status: 'Premium with all features' },
        free: { email: 'free@example.com', status: 'Free tier with basic features' },
        trial: { email: 'trial@example.com', status: '14-day trial with all features' }
      };
      
      const info = userInfo[type];
      setResults(prev => [...prev, `ℹ️ Use ${info.email} to sign in and test ${info.status}`]);
      
      // Add a note about manual testing
      setResults(prev => [...prev, `📝 Note: Currently using mock authentication - any password will work`]);
      
    } catch (error) {
      setResults(prev => [...prev, `❌ Error: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Setup</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Test Users</h2>
          
          <div className="space-y-4">
            {/* Premium User */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Premium Test User</h3>
              <p className="text-sm text-gray-600 mb-3">
                Email: test@example.com<br />
                Status: Premium (all features unlocked)<br />
                Has Stripe Customer ID for portal access
              </p>
              <button
                onClick={() => handleCreateUser('premium')}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Create Premium User
              </button>
            </div>

            {/* Free User */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Free Test User</h3>
              <p className="text-sm text-gray-600 mb-3">
                Email: free@example.com<br />
                Status: Free tier (basic features only)<br />
                No Stripe Customer ID
              </p>
              <button
                onClick={() => handleCreateUser('free')}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Create Free User
              </button>
            </div>

            {/* Trial User */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Trial Test User</h3>
              <p className="text-sm text-gray-600 mb-3">
                Email: trial@example.com<br />
                Status: 14-day trial (all features unlocked)<br />
                Has Stripe Customer ID for portal access
              </p>
              <button
                onClick={() => handleCreateUser('trial')}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Create Trial User
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
            <div className="space-y-2">
              {results.map((result, index) => (
                <p key={index} className="text-sm font-mono">{result}</p>
              ))}
            </div>
          </div>
        )}

        {/* Test Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Testing Links</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border-2 border-green-500">
              <h3 className="font-semibold text-green-700 mb-2">Premium User Test</h3>
              <a 
                href="/?user=premium" 
                className="block text-center bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Test as Premium User
              </a>
              <p className="text-xs text-gray-600 mt-2">All features unlocked</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border-2 border-blue-500">
              <h3 className="font-semibold text-blue-700 mb-2">Trial User Test</h3>
              <a 
                href="/?user=trial" 
                className="block text-center bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Test as Trial User
              </a>
              <p className="text-xs text-gray-600 mt-2">14-day trial active</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border-2 border-gray-500">
              <h3 className="font-semibold text-gray-700 mb-2">Free User Test</h3>
              <a 
                href="/?user=free" 
                className="block text-center bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Test as Free User
              </a>
              <p className="text-xs text-gray-600 mt-2">Basic features only</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Test Features:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <a href="/" className="text-blue-600 underline">Home</a> - Check subscription badge in header</li>
              <li>• <a href="/bank-sync" className="text-blue-600 underline">Bank Sync</a> - Premium feature (paywall for free users)</li>
              <li>• <a href="/settings" className="text-blue-600 underline">Settings</a> - View subscription status and manage account</li>
              <li>• <a href="/pricing" className="text-blue-600 underline">Pricing</a> - Upgrade flow and subscription plans</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}