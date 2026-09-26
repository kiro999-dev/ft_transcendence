import { useEffect, useState } from "react"
import { Sidebar } from "./componenets/SideBar"
import { useAuth } from "../auth/AuthContext"
import { Loading } from "../auth/ProtectedRout"

type UserData = {
  email: string,
  FullName: string
}
export const Dashboard = () => {
  const { isLoading, user } = useAuth()

  const [userdata, setUserData] = useState<UserData>({
    email: "",
    FullName: ""
  })
  useEffect(() => {
    if (!user)
      return
    const { first_name, last_name, email } = user
    setUserData({
      email,
      FullName: `${first_name} ${last_name}`
    });
  }, [user])
  return (
    <div>
      {isLoading ? <Loading></Loading> : <Sidebar userEmail={userdata.email} userName={userdata.FullName}></Sidebar>}
    </div>
  )
}
