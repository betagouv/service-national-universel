import React from "react";
import Emails from "../../../components/views/Emails";
import UserHeader from "../composants/UserHeader";

export default function Edit({ user, currentUser }) {
  return (
    <>
      <UserHeader user={user} currentUser={currentUser} tab="notifications" />
      <div className="m-8">
        <Emails email={user.email} />
      </div>
    </>
  );
}
