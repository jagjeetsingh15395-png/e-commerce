import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Configure axios to include credentials
const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:6001/api",
});

const LoginSignup = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [emailForOtp, setEmailForOtp] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError("Please enter your email first");
      return;
    }

    setOtpLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/admin/send-otp", {
        email: formData.email,
      });

      if (response.data && response.data.message) {
        setSuccess(response.data.message);
        setOtpSent(true);
        setEmailForOtp(formData.email);

        // In development, if OTP is returned in response, display it
        if (response.data.otp) {
          // Store the OTP so we can show it to the user
          // In production, this won't be present
          setOtp(response.data.otp);
        }
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to send OTP";
      setError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/admin/verify-otp", {
        email: emailForOtp,
        otp: otp,
      });

      if (response.data && response.data.admin) {
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Invalid OTP";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin && !otpSent) {
      // First step: send OTP for login
      await handleSendOtp();
      return;
    }

    if (isLogin && otpSent) {
      // Second step: verify OTP
      await handleVerifyOtp();
      return;
    }

    // Signup flow (no OTP required)
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const response = await axiosInstance.post("/admin/register", data);

      if (response.data && response.data.admin) {
        setSuccess("Registration successful! Please login.");
        setIsLogin(true);
        setOtpSent(false);
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setOtp("");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setOtpSent(false);
    setOtp("");
    setFormData({ username: "", email: "", password: "", confirmPassword: "" });
  };

  const handleResendOtp = async () => {
    await handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? "Admin Login" : "Admin Signup"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin
            ? "Sign in to manage your portfolio"
            : "Create a new admin account"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {otpSent ? (
            // OTP Verification Form
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {otp ? "Your OTP is:" : `We've sent a 6-digit OTP to`}{" "}
                  <strong>{emailForOtp}</strong>
                </p>
                {otp && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-xl font-bold text-blue-700 letter-spacing-2">
                        {otp}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(otp)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      OTP is valid for 5 minutes
                    </p>
                  </div>
                )}
                {!otp && (
                  <p className="text-xs text-gray-500 mt-1">
                    Check your email and enter the OTP below
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  {otp ? "Enter OTP (copy from above)" : "Enter OTP"}
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center text-lg tracking-wider"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="w-full text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                >
                  {otpLoading ? "Sending..." : "Didn't receive OTP? Resend"}
                </button>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify OTP & Sign In"
                  )}
                </button>

                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setError(null);
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Login/Signup Form
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <div className="mt-1">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your password"
                      minLength="6"
                    />
                  </div>
                </div>
              )}

              {isLogin && !otpSent && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password (for verification only)
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : isLogin ? (
                    "Send OTP"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Timer for OTP */}
          {otpSent && (
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">OTP expires in 5 minutes</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={toggleForm}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
