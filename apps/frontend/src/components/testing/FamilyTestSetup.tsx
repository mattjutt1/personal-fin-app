"use client";

import { useState } from "react";

interface FamilyTestSetupProps {
  onComplete?: (familyId: string) => void;
}

export default function FamilyTestSetup({ onComplete }: FamilyTestSetupProps) {
  // Static mode - no Convex backend needed for demo
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [familyData, setFamilyData] = useState({
    name: "",
    monthlyIncome: 5000,
    fixedExpenses: 2500,
    savingsGoal: 500,
    budgetStartDate: new Date().toISOString().split('T')[0],
  });

  const testMembers = [
    { name: "Test Parent 1", email: "parent1@test-family.local", role: "manager" as const },
    { name: "Test Parent 2", email: "parent2@test-family.local", role: "member" as const },
    { name: "Test Teen", email: "teen@test-family.local", role: "member" as const },
  ];

  const [createdFamily, setCreatedFamily] = useState<string | null>(null);

  const handleCreateFamily = async () => {
    if (!familyData.name.trim()) return;
    
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock family ID
    const familyId = `test-family-${Date.now()}`;
    setCreatedFamily(familyId);
    setStep(2);
    setLoading(false);
  };

  const handleAddMembers = async () => {
    if (!createdFamily) return;
    
    setLoading(true);
    
    // Simulate adding members
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStep(3);
    onComplete?.(createdFamily);
    setLoading(false);
  };

  const handleReset = () => {
    setStep(1);
    setCreatedFamily(null);
    setFamilyData({
      name: "",
      monthlyIncome: 5000,
      fixedExpenses: 2500,
      savingsGoal: 500,
      budgetStartDate: new Date().toISOString().split('T')[0],
    });
  };

  const dailyBudget = Math.round((familyData.monthlyIncome - familyData.fixedExpenses - familyData.savingsGoal) / 30);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Family Testing Setup
        </h2>
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i === step
                  ? "bg-blue-600 text-white"
                  : i < step
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {i < step ? "✓" : i}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Step {step}: {step === 1 ? "Budget Setup" : step === 2 ? "Add Members" : "Complete"}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Family Name
            </label>
            <input
              type="text"
              value={familyData.name}
              onChange={(e) => setFamilyData({ ...familyData, name: e.target.value })}
              placeholder="The Smith Family"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Income
              </label>
              <input
                type="number"
                value={familyData.monthlyIncome}
                onChange={(e) => setFamilyData({ ...familyData, monthlyIncome: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fixed Expenses
              </label>
              <input
                type="number"
                value={familyData.fixedExpenses}
                onChange={(e) => setFamilyData({ ...familyData, fixedExpenses: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Savings Goal
              </label>
              <input
                type="number"
                value={familyData.savingsGoal}
                onChange={(e) => setFamilyData({ ...familyData, savingsGoal: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Daily Budget Preview</h3>
            <div className="text-3xl font-bold text-blue-600">${dailyBudget}</div>
            <div className="text-sm text-blue-700">
              Available for variable expenses each day
            </div>
            <div className="text-xs text-blue-600 mt-2">
              Calculation: (${familyData.monthlyIncome} - ${familyData.fixedExpenses} - ${familyData.savingsGoal}) ÷ 30 days
            </div>
          </div>

          <button
            onClick={handleCreateFamily}
            disabled={loading || !familyData.name.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Family..." : "Create Test Family"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-900 mb-2">✅ Family Created!</h3>
            <div className="text-sm text-green-700">
              Family &quot;{familyData.name}&quot; has been created with your budget settings.
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Test Family Members</h3>
            <div className="space-y-3">
              {testMembers.map((member, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.role === "manager" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddMembers}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Adding Members..." : "Add Test Members"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-lg font-medium text-green-900 mb-2">Test Family Ready!</h3>
            <div className="text-sm text-green-700">
              Your test family has been set up successfully. You can now begin user testing.
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Testing Information</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Family ID:</strong> {createdFamily}</div>
              <div><strong>Daily Budget:</strong> ${dailyBudget}</div>
              <div><strong>Test Members:</strong> {testMembers.length} members added</div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">📋 Next Steps for Testing</h4>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Follow the USER_TESTING_GUIDE.md scenarios</li>
              <li>Test expense entry for each family member</li>
              <li>Verify real-time sync across devices</li>
              <li>Check daily budget calculations</li>
              <li>Validate mobile touch experience</li>
            </ol>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Create Another Test Family
          </button>
        </div>
      )}
    </div>
  );
}