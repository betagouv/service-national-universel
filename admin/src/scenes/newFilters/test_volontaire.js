import React, { useState, useEffect } from "react";
import { translateGrade } from "snu-lib";
import ListFiltersPopOver from "./filters/ListFiltersPopOver";
import ResultTable from "./ResultTable";

import Chevron from "../../components/Chevron";
import { Filter, FilterRow, Table, ActionBox, Header, Title, MultiLine, Help, LockIcon, HelpText } from "../../components/list";
import api from "../../services/api";
import { apiURL, appURL, supportURL } from "../../config";
import plausibleEvent from "../../services/plausible";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";

import IconChangementCohorte from "../../assets/IconChangementCohorte.js";

import Badge from "../../components/Badge";

import { translate, translatePhase1, YOUNG_STATUS_COLORS, getAge, ROLES, colors, YOUNG_STATUS, translatePhase2 } from "../../utils";

export default function test_volontaire() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const [volontaire, setVolontaire] = useState(null);

  const searchBarObject = {
    placeholder: "Rechercher par prénom, nom, email, ville...",
    datafield: ["lastName.keyword", "firstName.keyword", "email.keyword", "city.keyword"],
  };
  const filterArray = [
    { title: "Cohorte", name: "cohort", datafield: "cohort.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Région", name: "region", datafield: "region.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Département", name: "department", datafield: "department.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Classe", name: "grade", datafield: "grade.keyword", parentGroup: "Dossier", translate: translateGrade, missingLabel: "Non renseignée" },
    { title: "Custom", name: "example", datafield: "example.keyword", parentGroup: "Dossier", customComponent: "example" },
  ];

  const defaultQuery = { query: { bool: { must: [{ match_all: {} }] } } };
  const getCount = (value) => {
    setCount(value);
  };

  useEffect(() => {
    console.log("data", data);
  }, [data]);
  //extract dans utils ou logique du filtre ?

  return (
    <div className="bg-white h-full">
      <div className="flex flex-col gap-8 m-4">
        <div>{count} résultats aa</div>
        {/* display filtter button + currentfilters + searchbar */}
        <ListFiltersPopOver
          pageId="young"
          esId="young"
          defaultQuery={defaultQuery}
          filters={filterArray}
          getCount={getCount}
          setData={(value) => setData(value)}
          searchBarObject={searchBarObject}
          page={page}
          size={size}
        />
        <ResultTable
          setPage={setPage}
          count={count}
          currentCount={data?.length}
          size={size}
          page={page}
          render={
            <Table>
              <thead>
                <tr>
                  <th width="25%">Volontaire</th>
                  <th>Cohorte</th>
                  <th>Contextes</th>
                  <th width="10%">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((hit) => (
                  <Hit key={hit._id} hit={hit} onClick={() => setVolontaire(hit)} selected={volontaire?._id === hit._id} />
                ))}
              </tbody>
            </Table>
          }
        />
      </div>
    </div>
  );
}

const Hit = ({ hit, onClick, selected }) => {
  const getBackgroundColor = () => {
    if (selected) return colors.lightBlueGrey;
    if (hit.status === "WITHDRAWN" || hit.status === YOUNG_STATUS.DELETED) return colors.extraLightGrey;
  };

  if (hit.status === YOUNG_STATUS.DELETED) {
    return (
      <tr style={{ backgroundColor: getBackgroundColor() }} onClick={onClick}>
        <td>
          <MultiLine>
            <span className="font-bold text-black">Compte supprimé</span>
            <p>{hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null}</p>
          </MultiLine>
        </td>
        <td>
          <Badge
            color="#0C7CFF"
            backgroundColor="#F9FCFF"
            text={hit.cohort}
            tooltipText={hit.originalCohort ? `Anciennement ${hit.originalCohort}` : null}
            style={{ cursor: "default" }}
            icon={hit.originalCohort ? <IconChangementCohorte /> : null}
          />
        </td>
        <td>
          <Badge minify text="Supprimé" color={YOUNG_STATUS_COLORS.DELETED} tooltipText={translate(hit.status)} />

          <BadgePhase text="Phase 1" value={hit.statusPhase1} redirect={`/volontaire/${hit._id}/phase1`} style={"opacity-50"} />
          <BadgePhase text="Phase 2" value={hit.statusPhase2} redirect={`/volontaire/${hit._id}/phase2`} style={"opacity-50"} />
          <BadgePhase text="Phase 3" value={hit.statusPhase3} redirect={`/volontaire/${hit._id}/phase3`} style={"opacity-50"} />
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <Action hit={hit} />
        </td>
      </tr>
    );
  } else {
    return (
      <tr style={{ backgroundColor: getBackgroundColor() }} onClick={onClick}>
        <td>
          <MultiLine>
            <span className="font-bold text-black">{`${hit.firstName} ${hit.lastName}`}</span>
            <p>
              {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
            </p>
          </MultiLine>
        </td>
        <td>
          <Badge
            color="#0C7CFF"
            backgroundColor="#F9FCFF"
            text={hit.cohort}
            tooltipText={hit.originalCohort ? `Anciennement ${hit.originalCohort}` : null}
            style={{ cursor: "default" }}
            icon={hit.originalCohort ? <IconChangementCohorte /> : null}
          />
        </td>
        <td>
          {hit.status === "WITHDRAWN" && <Badge minify text="Désisté" color={YOUNG_STATUS_COLORS.WITHDRAWN} tooltipText={translate(hit.status)} />}
          <BadgePhase text="Phase 1" value={hit.statusPhase1} redirect={`/volontaire/${hit._id}/phase1`} />
          <BadgePhase text="Phase 2" value={hit.statusPhase2} redirect={`/volontaire/${hit._id}/phase2`} />
          <BadgePhase text="Phase 3" value={hit.statusPhase3} redirect={`/volontaire/${hit._id}/phase3`} />
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <Action hit={hit} />
        </td>
      </tr>
    );
  }
};

const BadgePhase = ({ text, value, redirect, style }) => {
  const history = useHistory();
  const translator = () => {
    if (text === "Phase 1") {
      return translatePhase1(value);
    } else if (text === "Phase 2") {
      return translatePhase2(value);
    } else {
      return translate(value);
    }
  };

  return (
    <Badge
      onClick={() => history.push(redirect)}
      minify
      text={text}
      tooltipText={translator()}
      minTooltipText={`${text}: ${translate(value)}`}
      color={YOUNG_STATUS_COLORS[value]}
      className={style}
    />
  );
};

const Action = ({ hit }) => {
  const user = useSelector((state) => state.Auth.user);

  return (
    <ActionBox color={"#444"}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          Choisissez&nbsp;une&nbsp;action
          <Chevron color="#444" />
        </DropdownToggle>
        <DropdownMenu>
          <Link to={`/volontaire/${hit._id}`} onClick={() => plausibleEvent("Volontaires/CTA - Consulter profil volontaire")}>
            <DropdownItem className="dropdown-item">Consulter le profil</DropdownItem>
          </Link>
          {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && hit.status !== YOUNG_STATUS.DELETED ? (
            <DropdownItem className="dropdown-item" onClick={() => plausibleEvent("Volontaires/CTA - Prendre sa place")}>
              <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${hit._id}`}>Prendre sa place</a>
            </DropdownItem>
          ) : null}
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};
