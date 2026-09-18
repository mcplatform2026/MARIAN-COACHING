import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, auth } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Mail, Lock, LogIn, UserPlus, Sparkles } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err: any) {
      console.error("Google login failed", err);
      if (err.code === "auth/popup-blocked") {
        setError("Your browser blocked the Google pop-up. If you are in the preview window, please click the 'Open in new tab' button (top right) and try again.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized. Please add this app's URL to 'Authorized Domains' in your Firebase Authentication settings.");
      } else {
        setError("Google sign-in failed. Try opening this app in a new tab by clicking the button at the top right of the preview window.");
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password fields.");
      return;
    }
    setError(null);
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err: any) {
      console.error("Email auth failed", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. It must be at least 6 characters.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password. Please verify and try again.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    document.title = "MARIAN COACHING - Sign In";
  }, []);

  return (
    <main className="flex-1 flex items-center justify-center p-4 min-h-screen bg-surface-container w-full h-full text-black">
      <div className="bg-white border-2 border-black p-6 md:p-8 neu-shadow w-full max-w-md flex flex-col items-center">
        
        {/* Brand Headline */}
        <h1 className="font-headline font-black text-2xl md:text-3xl text-center uppercase tracking-tight mb-5 break-words w-full text-blue-600 animate-in fade-in duration-300">
          MARIAN COACHING
        </h1>

        {/* Error message card */}
        {error && (
          <div className="w-full bg-red-50 border-2 border-black p-2.5 mb-4 font-body font-bold text-xs text-red-800 flex items-start gap-2">
            <span className="shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Email/Password Auth Form */}
        <form onSubmit={handleEmailAuth} className="w-full space-y-3">
          <div>
            <label className="block text-[10px] font-headline font-black uppercase tracking-wider mb-1 text-neutral-700">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <Mail className="w-3.5 h-3.5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2 border-2 border-black font-body text-xs focus:outline-none focus:ring-0 focus:border-blue-600 bg-neutral-50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-headline font-black uppercase tracking-wider mb-1 text-neutral-700">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border-2 border-black font-body text-xs focus:outline-none focus:ring-0 focus:border-blue-600 bg-neutral-50 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white border-2 border-black font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 neu-shadow-sm disabled:opacity-50"
          >
            {authLoading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-3.5 h-3.5" /> Sign Up with Email
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" /> Sign In with Email
              </>
            )}
          </button>
        </form>

        {/* Toggle between Sign In / Sign Up */}
        <div className="mt-3.5 w-full text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[10px] font-headline font-bold text-neutral-600 hover:text-blue-600 underline uppercase tracking-wider"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need a secure login? Create Account"}
          </button>
        </div>

        {/* Neobrutalist "or" Divider */}
        <div className="w-full flex items-center justify-center my-4 gap-3">
          <div className="h-0.5 bg-black flex-1"></div>
          <span className="text-[9px] font-headline font-black uppercase tracking-widest text-neutral-400 bg-white px-2">
            OR
          </span>
          <div className="h-0.5 bg-black flex-1"></div>
        </div>

        {/* Google Authentication Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-2.5 bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-black font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all active:scale-98 neu-shadow-sm"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            className="w-4.5 h-4.5 bg-white rounded-full p-0.5" 
          />
          Continue with Google
        </button>

        <p className="mt-5 text-[9px] font-body font-medium text-neutral-400 text-center border-t border-dashed border-neutral-300 pt-3.5 w-full uppercase tracking-wider">
          Authorized Secure Roster Registration System
        </p>
      </div>
    </main>
  );
}
