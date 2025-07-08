import React, { useEffect, useState } from "react";

import { PatchType, ReferentType, UserDto } from "snu-lib";

import HistoricComponent from "../../../components/views/Historic2";
import { formatHistory } from "../../../utils";
import API from "../../../services/api";
import Loader from "../../../components/Loader";
import UserHeader from "../composants/UserHeader";

interface EditProps {
  user: ReferentType;
  currentUser: UserDto;
}

export default function Edit({ user, currentUser }: EditProps): JSX.Element {
  const [data, setData] = useState<PatchType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const formattedData = formatHistory(data, user.role);

  const getPatches = async (): Promise<void> => {
    try {
      const { ok, data } = await API.get(`/referent/${user._id}/patches`);
      if (!ok) return;
      setData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) getPatches();
  }, [user]);

  if (isLoading) return <Loader />;

  return (
    <>
      <UserHeader user={user} currentUser={currentUser} tab="historique" />
      <div className="p-[30px]">
        {/* @ts-expect-error legacy js component */}
        <HistoricComponent model="referent" data={formattedData} />
      </div>
    </>
  );
}
