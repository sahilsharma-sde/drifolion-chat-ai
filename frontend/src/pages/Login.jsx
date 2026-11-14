import { useRef, useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";
import PasswordField from "../components/auth/PasswordField";
import SubmitButton from "../components/auth/SubmitButton";
import AuthDivider from "../components/auth/AuthDivider";
import FormAlert from "../components/auth/FormAlert";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const googleEnabled = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const redirectTo = location.state?.from?.pathname || "/";

  // Already signed in (e.g. opened /login in a second tab): go to the app.
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const validateEmail = (value) =>
    !value.trim()
      ? "Enter your email address."
      : !EMAIL_REGEX.test(value.trim())
        ? "That doesn't look like an email address."
        : "";

  const validatePassword = (value) => (value ? "" : "Enter your password.");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);

    if (errors.email) return emailRef.current?.focus();
    if (errors.password) return passwordRef.current?.focus();

    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message || "Couldn't log you in. Please try again.");
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setFormError("");
    try {
      await loginWithGoogle(idToken);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(err.message || "Google sign-in failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to Nexus AI"
      subtitle="Pick up your conversations and documents right where you left them."
    >
      <div className="space-y-4">
        <FormAlert tone="notice">{location.state?.reason}</FormAlert>

        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={setFormError}
        />
      </div>

      {googleEnabled && <AuthDivider>or log in with email</AuthDivider>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-4">
        <AuthField
          ref={emailRef}
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() =>
            email && setFieldErrors((f) => ({ ...f, email: validateEmail(email) }))
          }
          placeholder="you@example.com"
          error={fieldErrors.email}
        />

        <PasswordField
          ref={passwordRef}
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          error={fieldErrors.password}
        />

        <FormAlert>{formError}</FormAlert>

        <SubmitButton loading={submitting} loadingText="Logging in…">
          Log in
        </SubmitButton>
      </form>

      <p className="text-sm text-[var(--nexus-text-muted)] text-center mt-8">
        New to Nexus AI?{" "}
        <Link to="/register" className="text-[var(--nexus-cyan)] font-medium hover:underline">
          Create a free account
        </Link>
      </p>

      <p className="text-xs text-[var(--nexus-text-muted)] text-center mt-3">
        Just looking around?{" "}
        <Link to="/" className="underline underline-offset-2 hover:text-[var(--nexus-text)]">
          Try a guest chat
        </Link>
      </p>
    </AuthLayout>
  );
}
