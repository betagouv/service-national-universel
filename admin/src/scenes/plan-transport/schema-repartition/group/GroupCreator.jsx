import React, { useEffect, useState } from "react";
import { GroupBox, GroupHeader } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import GroupYoungVolumeEditor from "./GroupYoungVolumeEditor";
import { BorderButton, PlainButton } from "../../components/Buttons";

export default function GroupCreator({ group, className = "", onCreate }) {
  const [volume, setVolume] = useState(group.youngsVolume);

  useEffect(() => {
    setVolume(Math.max(0, group.youngsVolume));
  }, [group]);

  function cancelCreation() {
    onCreate && onCreate(null);
  }

  function create() {
    onCreate && onCreate({ ...group, youngsVolume: volume });
  }

  function affect() {
    onCreate && onCreate({ ...group, youngsVolume: volume }, GROUPSTEPS.CENTER);
  }

  function changeVolume(vol) {
    setVolume(Math.max(0, vol));
  }

  return (
    <GroupBox className={className}>
      <GroupHeader onBack={cancelCreation}>Créer un groupe</GroupHeader>
      <GroupYoungVolumeEditor availableVolume={group.availableVolume} value={volume} onChange={changeVolume} />
      <div className="flex items-end justify-center pt-[67px]">
        <BorderButton onClick={create} className="mr-[8px]">
          Créer seulement
        </BorderButton>
        <PlainButton onClick={affect}>Continuer vers l&apos;affectation</PlainButton>
      </div>
    </GroupBox>
  );
}
