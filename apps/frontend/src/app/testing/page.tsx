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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Simple Daily Family Budget - User Testing
          </h1>
          <p className="text-gray-600">
            MVP Testing Environment - Create test families and validate core workflows
          </p>
        </div>

        {/* Status Banner */}
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-2">✅</span>
            <div>
              <div className="font-bold">MVP Status: Ready for User Testing</div>
              <div className="text-sm">Architecture fixes complete • Real-time sync operational • Mobile-optimized</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("setup")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "setup"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Family Setup
              </button>
              <button
                onClick={() => setActiveTab("guide")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "guide"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Testing Guide
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "setup" && (
          <div className="space-y-6">
            {/* Test Families Created */}
            {testFamilies.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Test Families Created</h3>
                <div className="space-y-2">
                  {testFamilies.map((familyId, index) => (
                    <div key={familyId} className="text-sm text-blue-700">
                      Family {index + 1}: {familyId}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Family Setup Component */}
            <FamilyTestSetup onComplete={handleFamilyCreated} />
          </div>
        )}

        {activeTab === "guide" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Testing Guide</h2>
            
            <div className="space-y-6">
              {/* Quick Reference */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">🎯 Testing Objectives</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• <strong>&lt;5 Second Expense Entry:</strong> Validate core user workflow</li>
                  <li>• <strong>Family Real-time Sync:</strong> Test collaborative family budgeting</li>
                  <li>• <strong>Daily Budget Clarity:</strong> Ensure "What can we spend today?" is clear</li>
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
                      <li>"What does $47 Available Today mean?"</li>
                      <li>"How is this calculated?"</li>
                      <li>"What if we're over budget?"</li>
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
                  <li>Create test family using the "Family Setup" tab</li>
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