import { useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";
import PasswordField from "../components/auth/PasswordField";
import SubmitButton from "../components/auth/SubmitButton";
import AuthDivider from "../components/auth/AuthDivider";
import FormAlert from "../components/auth/FormAlert";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8; // keep in step with the server's rule
const googleEnabled = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

const STRENGTH_LABELS = ["Too short", "Weak", "Okay", "Good", "Strong"];
const STRENGTH_COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee"];

/** 0 = too short, 1-4 = weak -> strong. Only length is enforced by the server. */
function passwordStrength(password) {
  if (password.length < MIN_PASSWORD) return 0;

  let score = 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 4);
}

function StrengthMeter({ password }) {
  const strength = useMemo(() => passwordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className="h-1 flex-1 rounded-full bg-white/10 transition-colors"
            style={segment <= strength ? { background: STRENGTH_COLORS[strength] } : undefined}
          />
        ))}
      </div>
      <p className="text-xs mt-1.5 text-[var(--nexus-text-muted)]">
        Password strength: <span style={{ color: STRENGTH_COLORS[strength] }}>{STRENGTH_LABELS[strength]}</span>
        {strength < 3 && " · mix upper and lower case, numbers and symbols"}
      </p>
    </div>
  );
}

export default function Register() {
  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const validateName = (v) => (v.trim() ? "" : "Enter your name.");
  const validateEmail = (v) =>
    !v.trim()
      ? "Enter your email address."
      : !EMAIL_REGEX.test(v.trim())
        ? "That doesn't look like an email address."
        : "";
  const validatePassword = (v) =>
    v.length >= MIN_PASSWORD ? "" : `Use at least ${MIN_PASSWORD} characters.`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const errors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);

    if (errors.name) return nameRef.current?.focus();
    if (errors.email) return emailRef.current?.focus();
    if (errors.password) return passwordRef.current?.focus();

    setSubmitting(true);

    try {
      await register(name.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      const message = err.message || "Couldn't create your account. Please try again.";

      // Put "email already in use" next to the email field, where it can be fixed.
      if (/already/i.test(message) && /email|account/i.test(message)) {
        setFieldErrors((f) => ({ ...f, email: message }));
        emailRef.current?.focus();
      } else {
        setFormError(message);
      }

      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setFormError("");
    try {
      await loginWithGoogle(idToken);
      navigate("/", { replace: true });
    } catch (err) {
      setFormError(err.message || "Google sign-in failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your free account"
      subtitle="Save your chats, upload PDFs and ask questions about them."
    >
      <GoogleAuthButton onSuccess={handleGoogleSuccess} onError={setFormError} />

      {googleEnabled && <AuthDivider>or sign up with email</AuthDivider>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-4">
        <AuthField
          ref={nameRef}
          label="Name"
          type="text"
          autoComplete="name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() =>
            name && setFieldErrors((f) => ({ ...f, name: validateName(name) }))
          }
          placeholder="Your full name"
          error={fieldErrors.name}
        />

        <AuthField
          ref={emailRef}
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() =>
            email && setFieldErrors((f) => ({ ...f, email: validateEmail(email) }))
          }
          placeholder="you@example.com"
          error={fieldErrors.email}
        />

        <div>
          <PasswordField
            ref={passwordRef}
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`At least ${MIN_PASSWORD} characters`}
            error={fieldErrors.password}
            hint={password ? undefined : `Use at least ${MIN_PASSWORD} characters.`}
          />
          <StrengthMeter password={password} />
        </div>

        <FormAlert>{formError}</FormAlert>

        <SubmitButton loading={submitting} loadingText="Creating your account…">
          Create account
        </SubmitButton>
      </form>

      <p className="text-sm text-[var(--nexus-text-muted)] text-center mt-8">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--nexus-cyan)] font-medium hover:underline">
          Log in
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
