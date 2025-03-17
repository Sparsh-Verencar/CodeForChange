import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";

const Signup = () => {
  const { user, isSignedIn } = useUser();
  const { openSignUp } = useClerk();
  const [subjects, setSubjects] = useState([]);
  const [step, setStep] = useState("signup");

  // Redirect to purpose page after sign-up
  useEffect(() => {
    if (isSignedIn) {
      setStep("purpose");
    }
  }, [isSignedIn]);

  const handlePurpose = (purpose) => {
    if (purpose === "learning") {
      setStep("subjects");
    } else {
      // Handle teaching logic
      console.log("Teaching logic not implemented");
    }
  };

  const handleSaveSubjects = async () => {
    if (!user) return;

    const userData = {
      userId: user.id,
      email: user.primaryEmailAddress.emailAddress,
      username: user.username,
      subjects,
    };

    try {
      const response = await fetch("http://localhost:5000/api/save-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        alert("Subjects saved successfully");
      }
    } catch (err) {
      console.error("Failed to save subjects:", err);
    }
  };

  return (
    <div className="p-4">
      {step === "signup" && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
          <button onClick={openSignUp} className="bg-blue-500 text-white px-4 py-2 rounded">
            Sign Up with Clerk
          </button>
        </div>
      )}

      {step === "purpose" && (
        <div>
          <h1 className="text-2xl font-bold mb-4">What is your purpose?</h1>
          <button
            onClick={() => handlePurpose("learning")}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Learning
          </button>
          <button
            onClick={() => handlePurpose("teaching")}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Teaching
          </button>
        </div>
      )}

      {step === "subjects" && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Enter Subjects</h1>
          <input
            type="text"
            placeholder="Enter subjects (comma-separated)"
            className="border p-2 w-full mb-4"
            onChange={(e) => setSubjects(e.target.value.split(","))}
          />
          <button onClick={handleSaveSubjects} className="bg-blue-500 text-white px-4 py-2 rounded">
            Save Subjects
          </button>
        </div>
      )}
    </div>
  );
};

export default Signup;