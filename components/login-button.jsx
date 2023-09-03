import { useSession, signIn, signOut } from "next-auth/react"

import { Avatar, Button } from '@nextui-org/react';

export default function LoginButton({}) {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  console.log(session);
  if (session) {
    return (
      <>
        <Avatar 
          src={session.user.image}
          size="sm" onClick={() => signOut()} title={"Sign Out"} pointer={"true"}/>
        <p className="text-xs">{session.user.name}</p>
      </>
    )
  }
  return (
    <>
      <Avatar 
          text="In" 
          color="gradient" 
          textcolor="white" onClick={() => signIn()} title={"Sign In"} pointer={"true"}/>
          <p className="text-xs">Sign In</p>
    </>
  )
}