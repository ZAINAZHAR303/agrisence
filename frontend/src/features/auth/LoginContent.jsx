"use client";

import { LoginForm } from "./components";

export default function LoginContent() {
  const handleLogin = async (e) => {
    e.preventDefault();
    // Add login logic here
    console.log("Login submitted");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AgriSense AI
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Sign in to your account
            </p>
          </div>

          <LoginForm onSubmit={handleLogin} />

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-300">
              Don't have an account?{" "}
              <a href="#" className="text-green-600 dark:text-green-400 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
