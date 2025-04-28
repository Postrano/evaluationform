"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentForm, setCurrentForm] = useState(""); // NEW: track which form
  const router = useRouter();

  // Open modal and set current form
  const handleModalOpen = (formType) => {
    setCurrentForm(formType);
    setPassword("");        // Clear previous password input
    setErrorMessage("");    // Clear previous errors
    setIsModalOpen(true);
  };

  // Close modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setPassword("");
    setErrorMessage("");
  };

  // Handle password submit
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Define correct passwords
    const passwords = {
      evaluation: "Aquino_Postrano", // password for Evaluation Form
      audit: "Aquino_Postrano",      // password for Internal Audit Report (change this as needed)
    };

    if (password === passwords[currentForm]) {
      alert("Access granted!");

      // Redirect based on form type
      if (currentForm === "evaluation") {
        router.push("/evaluations");
      } else if (currentForm === "audit") {
        router.push("/reports"); // <- internal audit report page
      }
    } else {
      setErrorMessage("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800">
      
      {/* Evaluation Button */}
      <button
        onClick={() => handleModalOpen("evaluation")}
        className="py-3 px-8 bg-blue-500 text-white font-semibold rounded-md mb-3.5 hover:bg-blue-600 transition-colors"
      >
        Evaluation Form
      </button>

      {/* Internal Audit Button */}
      <button
        onClick={() => handleModalOpen("audit")}
        className="py-3 px-8 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
      >
        Internal Audit Report
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Enter Password for {currentForm === "evaluation" ? "Evaluation Form" : "Internal Audit Report"}
            </h2>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-600 font-medium">
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 mt-1 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {errorMessage && (
                <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
            </form>

            <button
              onClick={handleModalClose}
              className="mt-4 text-center w-full py-2 text-blue-500 hover:text-blue-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
