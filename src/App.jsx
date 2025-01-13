import { ResetPasswordComp } from "./components/auth/ResetPassword";
import { AuthProvider } from "./context/AuthContext";
import { ReportProvider } from "./context/ReportContext";
import { DashboardComp } from "./pages/Dashboard";
import { Route, Routes } from "react-router";


function App() {
  return (
    <>
      <div>
      <AuthProvider>
        <ReportProvider>
          <Routes>
            <Route path="/app" element={<DashboardComp />} />
            <Route path="/reset-password/:token" element={<ResetPasswordComp />} />
          </Routes>
        </ReportProvider>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;
