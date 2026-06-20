import { useState } from "react";
import { supabase } from "../services/supabase";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { MapPin } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-6">
      <MapPin size={48} className="text-green-500 mb-2" strokeWidth={1.75} />
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
        PresyoFinder
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Your personal price map
      </p>

      <div className="w-full max-w-sm space-y-3">
        <Input
          id="login-email"
          label="Email"
          srOnlyLabel
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="login-password"
          label="Password"
          srOnlyLabel
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-green-500" role="status">
            {message}
          </p>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
        >
          {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Log In"}
        </Button>

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
        </button>

        {!isSignUp && (
          <button
            onClick={handleResetPassword}
            className="w-full text-xs text-gray-400 dark:text-gray-500"
          >
            Forgot password?
          </button>
        )}
      </div>
    </div>
  );
}
