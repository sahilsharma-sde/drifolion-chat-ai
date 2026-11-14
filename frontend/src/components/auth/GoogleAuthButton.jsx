import { GoogleLogin } from "@react-oauth/google";

export default function GoogleAuthButton({ onSuccess, onError }) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    // Visitors of a deployed site see nothing (no broken button), but while
    // developing, say why the button is missing instead of hiding silently.
    if (import.meta.env.DEV) {
      return (
        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Google sign-in is hidden: VITE_GOOGLE_CLIENT_ID isn't set in
          frontend/.env. Add it, then restart <code>npm run dev</code>.
        </p>
      );
    }
    return null;
  }

  return (
    <div className="flex justify-center [&>div]:w-full">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          onSuccess(credentialResponse.credential);
        }}
        onError={() => onError("Google sign-in failed. Please try again.")}
        theme="filled_black"
        shape="pill"
        width="100%"
      />
    </div>
  );
}
