import { LandingPage } from "./landingPage/LandingPage"
import { Login } from "./authPages/Login"
import { SignUp } from "./authPages/SignUp"
import { Routes, Route } from "react-router";
import { NotFound } from "./Notfound/Notfound";
import { ForgotPassword } from "./authPages/ForgotPassword";
function App() {


  return (
   <>

    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

   </>
  )
}

export default App
