import React from "react";
import { ProfilePic } from "@snu/ds";
import { Container } from "@snu/ds/admin";
import { BsSend } from "react-icons/bs";

export default function ProfilePicExamples() {
  return (
    <Container title="Profile Picture">
      <div className="flex items-center mb-4">
        <ProfilePic image="https://i.pravatar.cc/300" initials="ap" />
        <p className="flex ml-3">
          Avec une image&nbsp;
          {`<ProfilePic image="https://i.pravatar.cc/300" />`}
        </p>
      </div>
      <div className="flex items-center mb-4">
        <ProfilePic initials="hp" />
        <p className="flex ml-3">Avec un initials&nbsp;{`<ProfilePic initials="hp" />`}</p>
      </div>
      <div className="flex items-center mb-4">
        <ProfilePic icon={({ size, className }) => <BsSend size={size} className={className} />} />
        <p className="flex ml-3">Avec un icon&nbsp;{`<ProfilePic icon={({ size, className }) => <BsSend size={size} className={className} />} />`}</p>
      </div>
      <div className="flex items-center">
        <ProfilePic />
        <p className="flex ml-3">Comportement par défaut sans props&nbsp;{`<ProfilePic />`}</p>
      </div>
    </Container>
  );
}
