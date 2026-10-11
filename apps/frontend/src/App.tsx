import { LandingPage } from "./landingPage/LandingPage"
import { Login } from "./auth/Login"
import { SignUp } from "./auth/SignUp"
import { Routes, Route, Navigate } from "react-router-dom";
import { NotFound } from "./Notfound/Notfound";
import { ForgotPassword } from "./auth/ForgotPassword";
import { ProtectedRoute } from "./auth/ProtectedRout";
import { Dashboard } from "./home/Dashboard";
import { Toaster } from "react-hot-toast";
import { Profile } from "./home/componenets/Profile";
import { ResetPassword } from "./auth/RestPassword";
import { Crm } from "./home/crm/crm";
function App() {


  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/crm" element={<Dashboard><Crm /></Dashboard>} />
          <Route path="/crm" element={<Navigate to="/dashboard/crm" replace />} />
          <Route path="/calendar" element={<Dashboard />} />
          <Route path="/properties" element={<Dashboard />} />
          <Route path="/me" element={<Profile />} />
        </Route>
      </Routes>


    </>
  )
}

export default App
