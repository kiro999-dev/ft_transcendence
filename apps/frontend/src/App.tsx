import { LandingPage } from "./landingPage/LandingPage"
import { Login } from "./auth/Login"
import { SignUp } from "./auth/SignUp"
import { Routes, Route, Navigate } from "react-router-dom";
import { NotFound } from "./Notfound/Notfound";
import { ForgotPassword } from "./auth/ForgotPassword";
import { ProtectedRoute } from "./auth/ProtectedRout";
import { Dashboard } from "./home/Dashboard";
import { Toaster } from "react-hot-toast";
import { Booking } from "./home/booking/Booking"
import { Availability } from "./home/availibility/Availability"
import { Profile } from "./home/componenets/Profile";
import { ResetPassword } from "./auth/RestPassword";
import { ChangePassword } from "./auth/ChangePassword";
import { Crm } from "./home/crm/crm";
import { OrgSettings } from "./home/componenets/OrganizationSettings";
import { TwoFactor } from "./auth/TwoFactor";
// import { Properties } from "./home/properties/properties";

function App() {


  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/two-factor" element={<TwoFactor />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Navigate to="/crm-dashboard" replace />} />
          <Route path="/crm-dashboard" element={<Dashboard><Crm /></Dashboard>} />
          <Route
            path="/booking"
            element={<Dashboard><Booking /></Dashboard>}
          />

          <Route
            path="/availability"
            element={<Dashboard><Availability /></Dashboard>}
          />
          <Route path="/me" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
           <Route path="/organization" element={<OrgSettings/>} />
           {/* <Route path="/properties" element={<Dashboard><Properties /></Dashboard>} /> */}
        </Route>
      </Routes>


    </>
  )
}

export default App