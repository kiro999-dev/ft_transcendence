import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Sidebar } from "./componenets/SideBar"
import { useAuth } from "../auth/AuthContext"
import { Loading } from "../auth/ProtectedRout"

type UserData = {
  email: string,
  FullName: string
}
export const Dashboard = ({ children }: { children?: ReactNode }) => {
  const {user ,isLoading} = useAuth()
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
  },[user] )
  return (
    <div className="flex min-h-screen">
      {isLoading ? <Loading></Loading> : <>
        <Sidebar userEmail={userdata.email} userName={userdata.FullName} />
        <main className="min-w-0 flex-1">{children}</main>
      </>}
    </div>
  )
}
