import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import AdminPanel from "./pages/AdminPanel";
import UserProfile from "./pages/UserProfile";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import LoginSignup from "./pages/LoginSignup";
import AdminNavigation from "./components/AdminNavigation";
import UserNavigation from "./components/UserNavigation";
import AdminFooter from "./components/AdminFooter";
import UserFooter from "./components/UserFooter";

const authClient = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:6001/api",
});

const ProtectedAdminRoute = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    authClient
      .post("/admin/refresh-token")
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setCheckingAuth(false));
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking access...
      </div>
    );
  }

  return authenticated ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const location = useLocation();
  const [userType, setUserType] = useState(
    location.pathname.startsWith("/admin") ? "admin" : "user",
  );

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      setUserType("admin");
      return;
    }

    setUserType("user");
  }, [location.pathname]);

  const handleSwitchToAdmin = () => {
    setUserType("admin");
  };

  const handleLogout = () => {
    setUserType("user");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {userType === "admin" ? (
        <>
          <AdminNavigation onLogout={handleLogout} />
          <div className="flex-grow">
            <Routes>
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminPanel initialSection="home" />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/blog"
                element={
                  <ProtectedAdminRoute>
                    <AdminPanel initialSection="blogs" />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/projects"
                element={
                  <ProtectedAdminRoute>
                    <AdminPanel initialSection="projects" />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedAdminRoute>
                    <AdminPanel initialSection="profile" />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/*"
                element={<Navigate to="/admin" replace />}
              />
              <Route path="/" element={<Navigate to="/admin" replace />} />
              <Route path="/user" element={<Navigate to="/admin" replace />} />
              <Route
                path="/user/*"
                element={<Navigate to="/admin" replace />}
              />
              <Route path="/login" element={<LoginSignup />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
          <AdminFooter />
        </>
      ) : (
        <>
          <UserNavigation onSwitchToAdmin={handleSwitchToAdmin} />
          <div className="flex-grow">
            <Routes>
              <Route path="/login" element={<LoginSignup />} />
              <Route path="/user" element={<UserProfile />} />
              <Route path="/user/blog" element={<Blog />} />
              <Route path="/user/blog/:id" element={<BlogDetail />} />
              <Route
                path="/blog"
                element={<Navigate to="/user/blog" replace />}
              />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/" element={<Navigate to="/user" replace />} />
              <Route path="/admin" element={<LoginSignup />} />
              <Route path="/admin/*" element={<LoginSignup />} />
              <Route path="*" element={<Navigate to="/user" replace />} />
            </Routes>
          </div>
          <UserFooter />
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
