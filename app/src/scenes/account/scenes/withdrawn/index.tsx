import React from "react";
import useAuth from "@/services/useAuth";
import FormDescription from "../../components/FormDescription";
import { youngCanWithdraw } from "snu-lib";
import Withdrawal from "./components/Withdrawal";

const AccountWithdrawnPage = () => {
  const { young } = useAuth();

  return (
    <div className="mb-6 bg-white shadow-sm lg:rounded-lg">
      <div className="md:flex md:flex-raw py-6 px-6">
        <h2 className="m-0 mb-1 text-lg font-medium leading-6 text-gray-900">Ma participation au SNU</h2>
        <div className="md:ml-[15%]">
          <FormDescription>Vous ne souhaitez plus participer au SNU ?</FormDescription>
          {youngCanWithdraw(young) ? <Withdrawal young={young} /> : null}
        </div>
      </div>
    </div>
  );
};

export default AccountWithdrawnPage;
