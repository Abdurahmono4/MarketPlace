"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig"; // Adjust this path

// Helper function to convert Firebase error codes to user-friendly messages
const getErrorMessage = (error) => {
  switch (error.code) {
    case "auth/user-not-found":
      return "No user found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please try again later.";
    case "auth/invalid-email":
      return "Invalid email address format.";
    default:
      return "An error occurred. Please try again.";
  }
};

const useAuth = () => {
  // User state to manage the authenticated user object
  const [user, setUser] = useState(null);
  // Loading state to manage UI while checking auth status
  const [loading, setLoading] = useState(true);
  // Error state to manage errors during authentication
  const [error, setError] = useState(null);

  // This effect runs once when the component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user); // Set user if logged in
        setLoading(false); // Finished loading auth state
      },
      (error) => {
        setError(error); // Set any errors
        setLoading(false); // Finished loading with an error
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Function to log out the user
  const signOut = async () => {
    try {
      await firebaseSignOut(auth); // Sign out using Firebase
      setUser(null); // Clear user state after sign-out
      setError(null); // Clear any previous errors
    } catch (error) {
      setError(getErrorMessage(error)); // Handle any error during sign-out
    }
  };

  // Function to log in the user using email and password
  const login = async (email, password) => {
    setLoading(true); // Start loading while logging in
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user); // Set the logged-in user
      setLoading(false); // Finished loading after successful login
    } catch (error) {
      setError(getErrorMessage(error)); // Map Firebase error to a user-friendly message
      setLoading(false); // Stop loading if there's an error
    }
  };

  return { user, loading, error, signOut, login };
};

export default useAuth;
