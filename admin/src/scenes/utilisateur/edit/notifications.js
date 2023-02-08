import React from "react";
import Emails from "../../../components/views/Emails";
import UserHeader from "../composants/UserHeader";

export default function Edit({ user, currentUser }) {
  return (
    <>
      <UserHeader user={user} currentUser={currentUser} tab="notifications" />
      <Emails email={user.email} />
    </>
  );
}
