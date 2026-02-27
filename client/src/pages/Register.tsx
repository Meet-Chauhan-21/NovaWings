// src/pages/Register.tsx
// Registration form using Formik + Yup with validation

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { registerUser } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import type { RegisterFormValues } from "../types";

/** Yup validation schema for the register form */
const registerSchema = Yup.object().shape({
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

/**
 * Register page renders a Formik-based form with name, email, and password fields.
 * On success, stores auth data via context and redirects to home.
 */
export default function Register() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const initialValues: RegisterFormValues = { name: "", email: "", password: "" };

  /** Handle form submission: call API, update context, navigate */
  const handleSubmit = async (values: RegisterFormValues, { setSubmitting }: { setSubmitting: (b: boolean) => void }) => {
    setApiError(null);
    try {
      const response = await registerUser(values);
      login(response);
      toast.success(response.message || "Registration successful!");
      navigate("/");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } | string } };
      const message =
        (typeof err?.response?.data === "string"
          ? err.response.data
          : (err?.response?.data as { message?: string; error?: string })?.message ||
            (err?.response?.data as { message?: string; error?: string })?.error) ||
        "Registration failed. Please try again.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Create Account</h2>

        <Formik initialValues={initialValues} validationSchema={registerSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none ${
                    touched.name && errors.name ? "border-red-400" : "border-gray-200"
                  }`}
                />
                <ErrorMessage name="name" component="p" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none ${
                    touched.email && errors.email ? "border-red-400" : "border-gray-200"
                  }`}
                />
                <ErrorMessage name="email" component="p" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none ${
                      touched.password && errors.password ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <ErrorMessage name="password" component="p" className="text-red-500 text-sm mt-1" />
              </div>

              {apiError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" />
                    <path d="M11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                  </svg>
                  <span>{apiError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 transition hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
