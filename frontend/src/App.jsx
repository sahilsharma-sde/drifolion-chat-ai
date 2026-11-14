import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./App.css";

// Route-level code splitting: the chat UI (markdown/syntax-highlighting deps)
// only loads once a user is authenticated and lands on "/".
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-[var(--nexus-bg)]">
      <div className="h-8 w-8 rounded-full border-2 border-[var(--nexus-violet)] border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
