import { Navigate, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProblemPage from "./pages/ProblemPage";
import DashboardPage from "./pages/DashboardPage";
import Problem from "./pages/Problem";
import SessionPage from "./pages/SessionPage";
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
      {/* //* test toaster with click on button */}
      {/* <button onClick={()=> Toast.success("heelo")}>
        Click
      </button> */}

      <Routes>
        <Route
          path="/"
          element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />}
        />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/dashboard"
          element={isSignedIn ? <DashboardPage /> : <Navigate to="/" />}
        />
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemPage /> : <Navigate to="/" />}
        />
        <Route
          path="/problem/:id"
          element={isSignedIn ? <Problem /> : <Navigate to="/" />}
        />
        <Route
          path="/session/:sessionId"
          element={isSignedIn ? <SessionPage /> : <Navigate to="/" />}
        />
      </Routes>
    </>
  );
}

export default App;
