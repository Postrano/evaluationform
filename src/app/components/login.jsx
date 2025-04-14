"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // To navigate to the evaluations page

const Login = () => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state
  const router = useRouter(); // For routing to the evaluations page

  // Handle the modal toggle
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Handle the password submit
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Correct password for validation
    const correctPassword = "Aquino_Postrano";

    if (password === correctPassword) {
      alert("Access granted! Proceeding to the Evaluation Form.");
      router.push("/evaluations"); // Navigate to the evaluations page
    } else {
      setErrorMessage("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={handleModalToggle} // Toggle the modal on button click
        className="py-3 px-8 bg-blue-500  text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
      >
        Evaluation Form
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Enter Password</h2>
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
                  onChange={(e) => setPassword(e.target.value)} // Update password on input change
                  required
                  className="w-full p-3 mt-1 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errorMessage && <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>}
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
            </form>
            <button
              onClick={handleModalToggle} // Close the modal
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
