import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Page, Header, Container, Button } from "@snu/ds/admin";
import { HiPlus } from "react-icons/hi";
import ClasseIcon from "@/components/drawer/icons/Classe";

export default function list() {
  const [classes, setClasses] = useState(undefined);

  return (
    <Page>
      <Header
        title="Liste de mes classes"
        breadcrumb={[{ title: <ClasseIcon className="scale-[65%]" /> }, { title: "Mes classes" }]}
        actions={[
          <Button key="empty" title={`(Voir template ${classes ? "vide" : "liste"})`} type="secondary" onClick={() => setClasses(classes ? undefined : [])} />,
          <Link key="view" to="/mes-classes/1" className="ml-2">
            <Button title="Vue classe" type="secondary" />
          </Link>,
          <Link key="list" to="/mes-classes/create" className="ml-2">
            <Button leftIcon={<ClasseIcon />} title="Créer une classe" />
          </Link>,
        ]}
      />
      {!classes && (
        <Container className="!p-8">
          <div className="py-6 bg-gray-50">
            <div className="flex items-center justify-center h-[136px] mb-4 text-lg text-gray-500 text-center">Vous n’avez pas encore créé de classe engagée</div>
            <div className="flex items-start justify-center h-[136px]">
              <Button type="wired" leftIcon={<HiPlus />} title="Créer une première classe engagée" />
            </div>
          </div>
        </Container>
      )}
    </Page>
  );
}
