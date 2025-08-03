"use client";

import { useState } from "react";
import FamilyTestSetup from "../../components/testing/FamilyTestSetup";


export default function TestingPage() {
  const [testFamilies, setTestFamilies] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"setup" | "guide">("setup");

  const handleFamilyCreated = (familyId: string) => {
    setTestFamilies(prev => [...prev, familyId]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Atlas Family Budget</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-gray-600 hover:text-gray-900">Dashboard</a>
                <a href="/budget" className="text-gray-600 hover:text-gray-900">Budget</a>
                <a href="/transactions" className="text-gray-600 hover:text-gray-900">Transactions</a>
                <a href="/analytics" className="text-gray-600 hover:text-gray-900">Analytics</a>
                <a href="/testing" className="text-blue-600 font-medium">Testing</a>
              </nav>
            </div>
            <a
              href="/"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Testing Environment
          </h1>
          <p className="text-gray-600 text-lg">
            Create test families and validate core workflows
          </p>
        </div>

        {/* Status Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <div className="text-lg font-bold text-green-900">MVP Status: Ready for User Testing</div>
              <div className="text-green-700">Architecture fixes complete • Real-time sync operational • Desktop-optimized</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Navigation and Status */}
          <div className="lg:col-span-1">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Testing Sections</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("setup")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === "setup"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Family Setup
                </button>
                <button
                  onClick={() => setActiveTab("guide")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === "guide"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Testing Guide
                </button>
              </nav>
            </div>

            {/* Test Families Created */}
            {testFamilies.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-medium text-blue-900 mb-3">Test Families Created</h3>
                <div className="space-y-2">
                  {testFamilies.map((familyId, index) => (
                    <div key={familyId} className="text-sm text-blue-700 bg-white rounded-lg p-2">
                      Family {index + 1}: {familyId}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === "setup" && (
              <div className="space-y-6">
                {/* Family Setup Component */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Family Test Setup</h2>
                  <FamilyTestSetup onComplete={handleFamilyCreated} />
                </div>
              </div>
            )}

            {activeTab === "guide" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">User Testing Guide</h2>
            
            <div className="space-y-6">
              {/* Quick Reference */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">🎯 Testing Objectives</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• <strong>&lt;5 Second Expense Entry:</strong> Validate core user workflow</li>
                  <li>• <strong>Family Real-time Sync:</strong> Test collaborative family budgeting</li>
                  <li>• <strong>Daily Budget Clarity:</strong> Ensure &quot;What can we spend today?&quot; is clear</li>
                  <li>• <strong>Mobile-First UX:</strong> Validate touch-optimized design</li>
                </ul>
              </div>

              {/* Testing Scenarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-3">📱 Scenario 1: Expense Entry</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div><strong>Goal:</strong> Test &lt;5 second workflow</div>
                    <div><strong>Steps:</strong></div>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Open app → See daily budget</li>
                      <li>Add expense → Amount → Category → Submit</li>
                      <li>Validate timing &lt;5 seconds</li>
                      <li>Check family sync &lt;500ms</li>
                    </ol>
                  </div>
                </div>

                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-3">👥 Scenario 2: Family Collaboration</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div><strong>Goal:</strong> Test real-time family sync</div>
                    <div><strong>Steps:</strong></div>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Parent 1: Add $35 restaurant expense</li>
                      <li>Parent 2: See update, add $120 bill</li>
                      <li>Teen: See both, add $8 lunch</li>
                      <li>Check daily budget reflects all</li>
                    </ol>
                  </div>
                </div>

                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-3">📱 Scenario 3: Mobile Experience</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div><strong>Goal:</strong> Validate mobile-first design</div>
                    <div><strong>Tests:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Touch targets ≥44px</li>
                      <li>Number entry on mobile keyboard</li>
                      <li>Smooth animations &lt;3s load</li>
                      <li>Portrait/landscape support</li>
                    </ul>
                  </div>
                </div>

                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-3">🧠 Scenario 4: Budget Understanding</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div><strong>Goal:</strong> Test daily budget clarity</div>
                    <div><strong>Questions:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>&quot;What does $47 Available Today mean?&quot;</li>
                      <li>&quot;How is this calculated?&quot;</li>
                      <li>&quot;What if we&apos;re over budget?&quot;</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Success Criteria */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-900 mb-3">🏆 Success Criteria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-green-800 mb-2">Performance Metrics</div>
                    <ul className="space-y-1 text-green-700">
                      <li>• Expense entry: &lt;5 seconds</li>
                      <li>• Real-time sync: &lt;500ms</li>
                      <li>• App load time: &lt;3 seconds</li>
                      <li>• Family setup: &lt;10 minutes</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium text-green-800 mb-2">User Experience</div>
                    <ul className="space-y-1 text-green-700">
                      <li>• 80%+ understand daily budget</li>
                      <li>• Mobile experience: 7+/10</li>
                      <li>• Family adoption: 80%+ active</li>
                      <li>• Overall satisfaction: 7+/10</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-3">📋 Next Steps</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Create test family using the &quot;Family Setup&quot; tab</li>
                  <li>Test all scenarios with multiple family members</li>
                  <li>Record performance metrics and user feedback</li>
                  <li>Document any issues or improvement opportunities</li>
                  <li>Validate MVP success criteria achievement</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}