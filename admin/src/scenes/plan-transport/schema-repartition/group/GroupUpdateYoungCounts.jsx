import React, { useEffect, useState } from "react";
import { GroupBox, GroupHeader } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import { PlainButton } from "../../components/Buttons";
import GroupYoungVolumeEditor from "./GroupYoungVolumeEditor";

export default function GroupUpdateYoungCounts({ group, className = "", onChange, onChangeStep }) {
  const [volume, setVolume] = useState(group.youngsVolume);

  useEffect(() => {
    setVolume(Math.max(1, group.youngsVolume));
  }, [group]);

  function save() {
    onChange && onChange({ ...group, youngsVolume: volume });
  }

  function changeVolume(vol) {
    setVolume(Math.max(1, vol));
  }

  return (
    <GroupBox className={className}>
      <GroupHeader onBack={() => onChangeStep(GROUPSTEPS.MODIFICATION)}>Modifier le nombre de volontaires</GroupHeader>
      <GroupYoungVolumeEditor availableVolume={group.availableVolume} value={volume} onChange={changeVolume} />
      <div className="flex items-end justify-center pt-[67px]">
        <PlainButton onClick={save}>Enregistrer</PlainButton>
      </div>
    </GroupBox>
  );
}
