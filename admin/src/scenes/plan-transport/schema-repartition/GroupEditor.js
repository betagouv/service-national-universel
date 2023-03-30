import React, { useEffect, useState } from "react";
import { GROUPSTEPS } from "../util";
import GroupCreator from "./group/GroupCreator";
import { toastr } from "react-redux-toastr";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import GroupConfirmDelete from "./group/GroupConfirmDelete";
import GroupUpdateYoungCounts from "./group/GroupUpdateYoungCounts";
import GroupCenter from "./group/GroupCenter";
import GroupGatheringPlaces from "./group/GroupGatheringPlaces";
import GroupConfirmDeleteCenter from "./group/GroupConfirmDeleteCenter";
import GroupAffectationSummary from "./group/GroupAffectationSummary";
import { useSelector } from "react-redux";
import { ROLES } from "snu-lib";
import GroupModificationEnhanced from "./group/GroupModificationEnhanced";

export default function GroupEditor({ group, className = "", onChange, isUserAuthorizedToCreateGroup }) {
  const { user } = useSelector((state) => state.Auth);
  const [step, setStep] = useState(group._id ? (!isUserAuthorizedToCreateGroup ? GROUPSTEPS.AFFECTATION_SUMMARY : GROUPSTEPS.MODIFICATION) : GROUPSTEPS.CREATION);
  const [previousStep, setPreviousStep] = useState(null);
  const [reloadNextStep, setReloadNextStep] = useState(null);
  const [tempGroup, setTempGroup] = useState(group);

  let oldGroup = null;

  useEffect(() => {
    if (oldGroup === null || group === null || oldGroup._id !== group._id) {
      if (reloadNextStep) {
        if (reloadNextStep === GROUPSTEPS.CANCEL) {
          onChange(null);
        } else {
          if (isUserAuthorizedToCreateGroup) {
            setPreviousStep(step);
            setStep(reloadNextStep);
          }
          setReloadNextStep(null);
        }
      } else {
        setPreviousStep(null);
        setStep(group && group._id ? (!isUserAuthorizedToCreateGroup ? GROUPSTEPS.AFFECTATION_SUMMARY : GROUPSTEPS.MODIFICATION) : GROUPSTEPS.CREATION);
      }
    }
    setTempGroup(group);
  }, [group]);

  function onChangeStep(newStep) {
    if (isUserAuthorizedToCreateGroup) {
      setPreviousStep(step);
      setStep(newStep);
    }

    if (newStep === GROUPSTEPS.CANCEL) {
      onChange(null);
    }
  }

  async function onCreate(group, nextStep) {
    if (group === null) {
      onChange && onChange(null);
    } else {
      try {
        let changedGroup = null;
        const result = await api.post("/schema-de-repartition", group);
        if (result.ok) {
          toastr.success("Le groupe a été créé.");
          changedGroup = result.data;
        } else {
          toastr.error("Nous n'avons pas pu créer ce groupe. Veuillez réessaye dans quelques instants.");
          return;
        }
        if (nextStep) {
          setReloadNextStep(nextStep);
          onChange && onChange(changedGroup);
        } else {
          onChange && onChange(null, true);
        }
      } catch (err) {
        capture(err);
        toastr.error("Nous n'avons pas pu créer ce groupe. Veuillez réessaye dans quelques instants.");
      }
    }
  }

  async function onDelete(group) {
    try {
      const result = await api.remove("/schema-de-repartition/" + group._id);
      if (result.ok) {
        toastr.success("Le groupe a été supprimé.");
        onChange && onChange(null, true);
      } else {
        toastr.error("Nous n'avons pas pu supprimer ce groupe. Veuillez réessayer dans quelques instants.");
      }
    } catch (err) {
      capture(err);
      toastr.error("Nous n'avons pas pu supprimer ce groupe. Veuillez réessayer dans quelques instants.");
    }
  }

  async function onUpdate(group, nextStep) {
    try {
      let changedGroup = null;
      const result = await api.put("/schema-de-repartition/" + group._id, group);
      if (result.ok) {
        toastr.success("Vos modifications ont été enregistrées.");
        changedGroup = result.data;
        if (nextStep) {
          setReloadNextStep(nextStep);
        }
      } else {
        toastr.error("Nous n'avons pas pu enregistrer vos modifications. Veuillez réessaye dans quelques instants.");
        return;
      }

      onChange && onChange(changedGroup);
    } catch (err) {
      capture(err);
      toastr.error("Nous n'avons pas pu enregistrer vos modifications. Veuillez réessaye dans quelques instants.");
    }
  }

  async function onUpdateTemp(group, nextStep) {
    setTempGroup(group);
    if (![ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(user.role)) {
      setPreviousStep(step);
      setStep(nextStep);
    }
  }

  switch (step) {
    case GROUPSTEPS.CREATION:
      return <GroupCreator className={className} group={group} onCreate={onCreate} onChangeStep={onChangeStep} />;
    case GROUPSTEPS.MODIFICATION:
      return <GroupModificationEnhanced className={className} group={group} onChangeStep={onChangeStep} />;
    case GROUPSTEPS.CONFIRM_DELETE_GROUP:
      return <GroupConfirmDelete className={className} group={group} onChangeStep={onChangeStep} onDelete={onDelete} />;
    case GROUPSTEPS.YOUNG_COUNTS:
      return <GroupUpdateYoungCounts className={className} group={group} onChangeStep={onChangeStep} onChange={onUpdate} />;
    case GROUPSTEPS.CENTER:
      return <GroupCenter className={className} group={group} onChangeStep={onChangeStep} onChange={onUpdateTemp} />;
    case GROUPSTEPS.GATHERING_PLACES:
      return <GroupGatheringPlaces className={className} group={tempGroup} onChangeStep={onChangeStep} onChange={onUpdateTemp} previousStep={previousStep} />;
    case GROUPSTEPS.AFFECTATION_SUMMARY:
      return (
        <GroupAffectationSummary
          className={className}
          group={tempGroup}
          onChangeStep={onChangeStep}
          onChange={onUpdate}
          isUserAuthorizedToCreateGroup={isUserAuthorizedToCreateGroup}
        />
      );
    case GROUPSTEPS.CONFIRM_DELETE_CENTER:
      return <GroupConfirmDeleteCenter className={className} group={group} onChangeStep={onChangeStep} onChange={onUpdate} />;
    default:
      return <div>TODO STEP: {step}</div>;
  }
}
