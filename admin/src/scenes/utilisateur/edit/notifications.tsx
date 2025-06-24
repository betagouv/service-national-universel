import React from "react";
import { UserDto, ReferentType } from "snu-lib";
import Emails from "../../../components/views/Emails2";
import UserHeader from "../composants/UserHeader";

interface EditProps {
  user: ReferentType;
  currentUser: UserDto;
}

export default function Edit({ user, currentUser }: EditProps) {
  return (
    <>
      <UserHeader user={user} currentUser={currentUser} tab="notifications" />
      <div className="m-8">
        <Emails email={user.email} userType={"referent"} />
      </div>
    </>
  );
}
