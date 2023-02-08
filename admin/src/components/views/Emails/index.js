import React from "react";
import { apiURL } from "../../../config";
import API from "../../../services/api";
import { ReactiveBase } from "@appbaseio/reactivesearch";

import ReactiveListComponent from "../../ReactiveListComponent";
import Email from "./components/Email";

export default function Emails({ young }) {
  const getDefaultQuery = () => {
    const query = {
      query: {
        bool: {
          filter: [{ term: { "email.keyword": young.email } }],
        },
      },
      track_total_hits: true,
    };
    return query;
  };

  return (
    <div className="bg-white rounded-xl shadow-md text-gray-700 pb-32">
      <ReactiveBase url={`${apiURL}/es`} app="email" headers={{ Authorization: `JWT ${API.getToken()}` }}>
        <ReactiveListComponent
          pageSize={20}
          defaultQuery={getDefaultQuery}
          // react={{ and: FILTERS }}
          paginationAt="bottom"
          showTopResultStats={false}
          render={({ data }) => (
            <table className="table-auto w-full">
              <thead>
                <tr className="uppercase border-t border-t-slate-100">
                  <th className="w-1/2 font-normal px-4 py-3 text-xs text-gray-500">Objet de l&apos;email</th>
                  <th className="w-1/6 font-normal px-4 py-3 text-xs text-gray-500">Date d&apos;envoi</th>
                  <th className="w-1/6 font-normal px-4 py-3 text-xs text-gray-500">Template ID</th>
                  <th className="w-1/6 font-normal px-4 py-3 text-xs text-gray-500">Dernier statut</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((email) => (
                  <Email key={email.messageId} email={email} />
                ))}
              </tbody>
            </table>
          )}
        />
      </ReactiveBase>
    </div>
  );
}
