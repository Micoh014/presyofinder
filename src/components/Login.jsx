import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showReset, setShowReset] = useState(false);

  async function handleResetPassword() {
    if (!email.trim()) {
      setError("Please enter your email first.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) return setError(error.message);
    setMessage("Password reset link sent! Check your email.");
  }

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) return setError(error.message);
      setMessage("Account created! Check your email to confirm, then log in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) return setError(error.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-6">
      <div className="text-5xl mb-2">📍</div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
        PresyoFinder
      </h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
        Your personal price map
      </p>

      <div className="w-full max-w-sm space-y-3">
        <label htmlFor="login-email" className="sr-only">
          {" "}
          Email{" "}
        </label>
        <input
          id="login-email"
          className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="login-password" className="sr-only">
          {" "}
          Password{" "}
        </label>
        <input
          id="login-password"
          className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-green-500">{message}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-500 text-white rounded-xl py-3 font-semibold text-sm disabled:opacity-50"
        >
          {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Log In"}
        </button>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setMessage("");
          }}
          className="w-full text-sm text-gray-500 dark:text-gray-400"
        >
          {isSignUp
            ? "Already have an account? Log in"
            : "Don't have an account? Sign up"}
          {!isSignUp && (
            <button
              onClick={handleResetPassword}
              className="w-full text-xs text-gray-400 dark:text-gray-500"
            >
              Forgot password?
            </button>
          )}
        </button>
      </div>
    </div>
  );
}
