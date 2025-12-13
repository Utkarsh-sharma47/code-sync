import { Navigate, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProblemPage from "./pages/ProblemPage";
import { useUser } from "@clerk/clerk-react";
import AboutPage from "./pages/AboutPage";
import Toast, { Toaster } from "react-hot-toast";


function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#334155",
            color: "#fff",
          },
        }}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemPage /> : <Navigate to="/" />}
        />
      </Routes>
    </>
  );
}

export default App;
