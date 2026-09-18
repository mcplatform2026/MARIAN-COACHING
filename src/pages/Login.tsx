import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, auth } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Mail, Lock, LogIn, UserPlus, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Forgot password states
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = resetEmail.trim() || email.trim();
    if (!targetEmail) {
      setError("Please provide your email address to receive the password reset link.");
      return;
    }
    setError(null);
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      console.error("Password reset failed", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address. Please check your email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few moments before trying again.");
      } else {
        setError(err.message || "Failed to send password reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
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

        {isResetMode ? (
          /* Password Reset Flow */
          <div className="w-full">
            <div className="text-center mb-4">
              <h2 className="font-headline font-black text-lg uppercase tracking-tight text-neutral-900 flex items-center justify-center gap-1.5">
                <KeyRound className="w-4 h-4 text-blue-600" /> Reset Password
              </h2>
              <p className="text-[11px] text-neutral-600 font-body mt-1">
                Enter your email address below to receive a password reset link.
              </p>
            </div>

            {resetSuccess ? (
              <div className="space-y-4">
                <div className="w-full bg-green-50 border-2 border-black p-3.5 font-body text-xs text-green-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold font-headline uppercase tracking-wider mb-1">Reset Link Sent</p>
                    <p className="text-[11px] text-neutral-700 leading-relaxed">
                      A password reset link has been dispatched to <strong>{resetEmail || email}</strong>. Please check your inbox and spam folder to reset your password.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setResetSuccess(false);
                    setError(null);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white border-2 border-black font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 neu-shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="w-full space-y-3">
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
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-9 pr-3 py-2 border-2 border-black font-body text-xs focus:outline-none focus:ring-0 focus:border-blue-600 bg-neutral-50 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white border-2 border-black font-headline font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 neu-shadow-sm disabled:opacity-50"
                >
                  {resetLoading ? (
                    <span className="animate-pulse">Sending Reset Link...</span>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" /> Send Password Reset Link
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setError(null);
                    }}
                    className="text-[10px] font-headline font-bold text-neutral-600 hover:text-blue-600 underline uppercase tracking-wider inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Normal Auth Form */
          <>
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

            {/* Forgot Password Link - Replaces previous toggle directly */}
            <div className="mt-3.5 w-full text-center flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(true);
                  setResetEmail(email);
                  setError(null);
                  setResetSuccess(false);
                }}
                className="text-[10px] font-headline font-bold text-neutral-600 hover:text-blue-600 underline uppercase tracking-wider"
              >
                Forgot Password? Reset Here
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-[9px] font-headline font-bold text-neutral-400 hover:text-neutral-700 underline uppercase tracking-wider"
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
          </>
        )}

        <p className="mt-5 text-[9px] font-body font-medium text-neutral-400 text-center border-t border-dashed border-neutral-300 pt-3.5 w-full uppercase tracking-wider">
          Authorized Secure Roster Registration System
        </p>
      </div>
    </main>
  );
}
