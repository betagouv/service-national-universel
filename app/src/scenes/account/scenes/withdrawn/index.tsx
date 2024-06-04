import React from "react";
import useAuth from "@/services/useAuth";
import FormDescription from "../../components/FormDescription";
import { youngCanWithdraw } from "snu-lib";
import Withdrawal from "./components/Withdrawal";

const AccountSpecialSituationsPage = () => {
  const { young } = useAuth();

  return (
    <div className="mb-6 bg-white shadow-sm lg:rounded-lg">
         <div className="hidden py-6 pl-6 lg:col-start-1 lg:block">
            <h2 className="m-0 mb-1 text-lg font-medium leading-6 text-gray-900">Ma participation au SNU</h2>
            <FormDescription>Vous ne souhaitez plus participer au SNU ?</FormDescription>
          </div>
          {youngCanWithdraw(young) ? <Withdrawal young={young} /> : null}
    </div>
  );
};

export default AccountSpecialSituationsPage;
