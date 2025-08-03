import { SignUpForm } from "@/components/business/auth/SignUpForm";


export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Simple Daily Family Budget
          </h1>
          <p className="text-gray-600">
            Join thousands of families taking control of their finances
          </p>
        </div>
        
        <SignUpForm />
      </div>
    </div>
  );
}