import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";

import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styled from "styled-components";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import { translate, corpsEnUniforme, formatLongDateFR, ES_NO_LIMIT, ROLES, getFilterLabel, colors } from "../../utils";
import VioletButton from "../../components/buttons/VioletButton";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, ResultTable, Table, Header, Title, MultiLine } from "../../components/list";
import Badge from "../../components/Badge";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import Chevron from "../../components/Chevron";

// const FILTERS = ["SEARCH", "LEGAL_STATUS", "STATUS", "DEPARTMENT", "REGION", "CORPS", "WITH_NETWORK", "LOCATION", "MILITARY_PREPARATION"];
const FILTERS = ["SEARCH", "REGION", "DEPARTMENT"];
const formatLongDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
};

export default () => {
  const [structure, setStructure] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const user = useSelector((state) => state.Auth.user);
  /*
  const getDefaultQuery = () =>
    user.role === ROLES.SUPERVISOR ? { query: { bool: { filter: { term: { "networkId.keyword": user.structureId } } } } } : { query: { match_all: {} } };
*/
  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="association" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                <Title>Associations</Title>
              </div>
              <div style={{ display: "flex" }}>
                <Link to="/structure/create">
                  <VioletButton>
                    <p>Inviter une nouvelle structure</p>
                  </VioletButton>
                </Link>
              </div>
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  showIcon={false}
                  placeholder="Rechercher par mots clés, ville, code postal..."
                  componentId="SEARCH"
                  dataField={["identite_nom"]}
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  autosuggest={false}
                  URLParams={true}
                  queryFormat="and"
                />
                <RegionFilter dataField={"coordonnees_adresse_region.keyword"} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []} />
                <DepartmentFilter
                  dataField={"coordonnees_adresse_departement.keyword"}
                  filters={FILTERS}
                  defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [user.department] : []}
                />
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>
            </Filter>
            <div>
              <ReactiveListComponent
                react={{ and: FILTERS }}
                onData={({ rawData }) => {
                  // if (rawData?.hits?.hits) setStructureIds(rawData.hits.hits.map((e) => e._id));
                }}
                dataField={"created_at"}
                render={({ data }) => {
                  return data.map((hit) => <Hit hit={hit} key={hit._id} onClick={() => setStructure(hit)} selected={structure?._id === hit._id} />);
                }}
              />
            </div>
          </div>
        </div>
      </ReactiveBase>
    </div>
  );
};

const Hit = ({ hit, onClick, selected }) => {
  const tabs = ["Informations", "Contacts", "Missions"];
  const [show, setShow] = useState(false);
  const [tab, setTab] = useState("Informations");
  const missions = false;
  const association = hit;

  return (
    <Association>
      <AssociationHeader>
        {association.logo && (
          <div>
            <img src={association.logo} alt={association.identite_nom} />
          </div>
        )}
        <AssociationHeaderMainInfo>
          <div>
            <div> {association.activites_lib_theme1}</div>
            <div> {association.identite_nom}</div>
            <div>
              {association.coordonnees_adresse_code_postal} {association.coordonnees_adresse_commune}
            </div>
          </div>
          <div>
            <button onClick={() => setShow(!show)}>
              <Chevron color="#444" style={{ transform: show && "rotate(180deg)" }} />
            </button>
          </div>
        </AssociationHeaderMainInfo>
        <div>
          <ContactButton
            onClick={() => {
              setShow(true);
              setTab("Contacts");
            }}
          >
            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3.97059 4.20594C3.97059 6.39506 5.75206 8.17653 7.94118 8.17653C10.1303 8.17653 11.9118 6.39506 11.9118 4.20594C11.9118 2.01682 10.1303 0.235352 7.94118 0.235352C5.75206 0.235352 3.97059 2.01682 3.97059 4.20594ZM15 17.0001H15.8824V16.1177C15.8824 12.7127 13.1109 9.94123 9.70588 9.94123H6.17647C2.77059 9.94123 0 12.7127 0 16.1177V17.0001H15Z"
                fill="#696974"
              />
            </svg>
          </ContactButton>
          <ContactButton
            onClick={() => {
              setShow(true);
              setTab("Contacts");
            }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.18712 9.74667C8.17287 10.7467 9.36561 11.5187 10.6816 12.0086L12.4618 10.5919C12.5146 10.5556 12.5772 10.5361 12.6413 10.5361C12.7054 10.5361 12.7679 10.5556 12.8207 10.5919L16.1263 12.7217C16.2518 12.7971 16.358 12.9007 16.4366 13.0243C16.5152 13.1478 16.5639 13.288 16.579 13.4336C16.5942 13.5792 16.5752 13.7264 16.5237 13.8635C16.4721 14.0005 16.3894 14.1237 16.2821 14.2233L14.7332 15.7533C14.5114 15.9725 14.2388 16.1333 13.9397 16.2215C13.6406 16.3097 13.3243 16.3224 13.0191 16.2586C9.97427 15.6298 7.16782 14.157 4.92045 12.0086C2.72296 9.83887 1.2023 7.07807 0.542951 4.06111C0.477816 3.76061 0.491411 3.44837 0.582418 3.15467C0.673425 2.86096 0.838759 2.59575 1.0624 2.38472L2.66795 0.835832C2.76731 0.733732 2.88847 0.655432 3.02238 0.606794C3.15628 0.558156 3.29945 0.540442 3.44117 0.554978C3.58289 0.569513 3.71949 0.615921 3.84073 0.690728C3.96198 0.765534 4.06472 0.8668 4.14128 0.986943L6.34184 4.25C6.3798 4.30124 6.40028 4.36332 6.40028 4.42708C6.40028 4.49085 6.3798 4.55293 6.34184 4.60417L4.89212 6.34667C5.39531 7.63628 6.17927 8.7977 7.18712 9.74667Z"
                fill="#696974"
              />
            </svg>
          </ContactButton>
          <ContactButton
            onClick={() => {
              setShow(true);
              setTab("Contacts");
            }}
          >
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.8513 9.14915C11.1345 8.43273 10.1626 8.03027 9.14926 8.03027C8.13588 8.03027 7.16398 8.43273 6.44726 9.14915L3.74439 11.8511C3.02766 12.5679 2.625 13.54 2.625 14.5536C2.625 15.5672 3.02766 16.5393 3.74439 17.256C4.46112 17.9728 5.43321 18.3754 6.44682 18.3754C7.46043 18.3754 8.43253 17.9728 9.14926 17.256L10.5003 15.905"
                stroke="#696974"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.14941 11.851C9.86613 12.5674 10.838 12.9699 11.8514 12.9699C12.8648 12.9699 13.8367 12.5674 14.5534 11.851L17.2563 9.14902C17.973 8.43229 18.3757 7.46019 18.3757 6.44658C18.3757 5.43297 17.973 4.46087 17.2563 3.74414C16.5396 3.02741 15.5675 2.62476 14.5539 2.62476C13.5402 2.62476 12.5681 3.02741 11.8514 3.74414L10.5004 5.09514"
                stroke="#696974"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ContactButton>
          <ContactButton
            onClick={() => {
              setShow(true);
              setTab("Contacts");
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.68947 3.94941C10.0637 3.94941 11.3585 4.5586 12.3075 5.51091V5.51372C12.3075 5.05641 12.6152 4.71047 13.0404 4.71047H13.1484C13.8195 4.71047 13.9539 5.34328 13.9539 5.54297L13.9567 12.6502C13.91 13.1159 14.4377 13.3567 14.7307 13.0574C15.8698 11.8857 17.235 7.02797 14.0214 4.21547C11.0244 1.59028 7.00197 2.02397 4.86334 3.49772C2.59028 5.06822 1.13734 8.53716 2.54865 11.7974C4.0899 15.3518 8.49597 16.4122 11.1183 15.3547C12.4458 14.8186 13.0578 16.6107 11.678 17.1974C9.59847 18.0845 3.80303 17.9939 1.09628 13.3066C-0.73241 10.1403 -0.63566 4.57041 4.21647 1.68478C7.92503 -0.524155 12.8182 0.0878455 15.768 3.16753C18.8505 6.3901 18.6722 12.4195 15.6628 14.7635C14.2998 15.8294 12.276 14.7927 12.2906 13.2397L12.2754 12.7334C11.3265 13.6733 10.0637 14.2246 8.68947 14.2246C5.9709 14.2246 3.57747 11.8306 3.57747 9.11485C3.57747 6.36985 5.9709 3.95053 8.68947 3.95053V3.94941ZM12.1089 8.91853C12.006 6.92897 10.5294 5.73084 8.74515 5.73084H8.67765C6.62115 5.73084 5.47872 7.35085 5.47872 9.18741C5.47872 11.2467 6.85853 12.5472 8.66922 12.5472C10.6903 12.5472 12.0172 11.0684 12.114 9.31903L12.1089 8.91853Z"
                fill="#696974"
              />
            </svg>
          </ContactButton>
        </div>
        {missions && <div>Bouton missions</div>}
      </AssociationHeader>
      {show && (
        <AssociationBody>
          <div>
            {tabs.map((e) =>
              tab === e ? (
                <TabTitle key={e} onClick={() => setTab(e)}>
                  {e}
                </TabTitle>
              ) : (
                <TabTitleSelected key={e} onClick={() => setTab(e)}>
                  {e}
                </TabTitleSelected>
              )
            )}
          </div>
          {tab === "Informations" && (
            <TabInfo>
              <div>
                <b>Description</b>
                <br />
                <p>{association.description}</p>
              </div>
              <TabInfoAdditional>
                {[
                  { label: "ID SIREN", value: association.id_siren },
                  { label: "ID RNA", value: association.id_siren },
                  { label: "Statut juridique", value: association.statut_juridique },
                  { label: "Adresse", value: association.coordonnees_adresse_nom_complet },
                ]
                  .filter((e) => e.value)
                  .map((e) => (
                    <div key={e.label}>
                      <b>{e.label}</b>
                      <span>{e.value}</span>
                    </div>
                  ))}
              </TabInfoAdditional>
            </TabInfo>
          )}
          {tab === "Contacts" && (
            <TabContact>
              <div>
                <table>
                  <tr>
                    <td>
                      <b>Téléphone</b>
                    </td>
                    <td>
                      {association.coordonnees_telephone.map((e) => {
                        return <div>{e}</div>;
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <b>E-mail</b>
                    </td>
                    <td>
                      {association.coordonnees_courriel.map((e) => {
                        return <div>{e}</div>;
                      })}
                    </td>
                  </tr>
                </table>
              </div>
              <div>
                <table>
                  <tr>
                    <td>
                      <b>Liens</b>
                    </td>
                    <td>
                      {[association.url, association.linkedin, association.facebook, association.twitter, association.donation]
                        .filter((e) => e)
                        .map((e) => {
                          return <div>{e}</div>;
                        })}
                    </td>
                  </tr>
                </table>
              </div>
            </TabContact>
          )}
          {tab === "Missions" && <div></div>}
        </AssociationBody>
      )}
    </Association>
  );
};

const Association = styled.div`
  background: #ffffff;
  box-shadow: 0px 15px 40px rgba(0, 0, 0, 0.1);
  border-radius: 10px 10px 0px 0px;
  margin: 1rem;
  padding: 1rem;
`;
const AssociationHeader = styled.div``;
const TabTitle = styled.div``;
const TabTitleSelected = styled.div``;
const AssociationBody = styled.div`
  background: #f9f8f6;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 0px 0px 10px 10px;
`;
const ContactButton = styled.button``;
const AssociationHeaderMainInfo = styled.div`
  border-right: 1px dashed rgba(0, 0, 0, 0.2);
  padding-right: 1rem;
  margin-right: 1rem;
  display: flex;
`;
const TabInfo = styled.div``;
const TabInfoAdditional = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
`;
const TabContact = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
`;
