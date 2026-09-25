import { LandingPage } from "./landingPage/LandingPage"
import { Login } from "./auth/Login"
import { SignUp } from "./auth/SignUp"
import { Routes, Route } from "react-router-dom";
import { NotFound } from "./Notfound/Notfound";
import { ForgotPassword } from "./auth/ForgotPassword";
import { ProtectedRoute } from "./auth/ProtectedRout";
import { Dashboard } from "./home/Dashboard";
import { Toaster } from "react-hot-toast";
import { Profile } from "./home/componenets/Profile";
function App() {


  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crm" element={<Dashboard />} />
          <Route path="/calendar" element={<Dashboard />} />
          <Route path="/properties" element={<Dashboard />} />
          <Route path="/me" element={<Profile />} />
          
        </Route>
      </Routes>


    </>
  )
}

export default App
