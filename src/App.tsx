import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import { cn } from "./lib/utils";
import { SignUp } from "./pages/SignUp";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { useEffect, useState } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import type { User } from "firebase/auth";

function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
function PublicRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-neutral-900">
        <div
          className={cn(
            "absolute inset-0 z-0 pointer-events-none",
            "[background-size:20px_20px]",
            "[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
          )}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-neutral-900"></div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
          </div>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
