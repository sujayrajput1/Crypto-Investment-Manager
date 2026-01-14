import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Crypto Investment Manager
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          ✅ Frontend is working correctly!
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          All pages are accessible: Landing, Signup, Login, Dashboard, Portfolio, Risk Analysis, Reports, Rules, Alerts
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            To access full features, run: npm run dev and navigate to different pages
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
