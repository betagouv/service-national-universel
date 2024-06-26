export type DemarcheSimplifieeQueryBuilder = {
  operationName: string;
  query: string;
  variables: {
    demarcheNumber: number;
    after: string | null;
    dossierState: string | null;
  };
};

export const buildDemarcheSimplifieeBody = (demarcheNumber: number, afterCursor: string | null, dossierState: string | null): DemarcheSimplifieeQueryBuilder => {
  return {
    query: `
    query getDemarche($demarcheNumber: Int!, $after: String, $dossierState: DossierState) {
  demarche(number: $demarcheNumber) {
    id
    number
    title
    dossiers(after: $after, state: $dossierState) {
      pageInfo {
        ...PageInfoFragment
      }
      nodes {
        ...DossierFragment
      }
    }
  }
}

fragment PageInfoFragment on PageInfo {
  hasPreviousPage
  hasNextPage
  startCursor
  endCursor
}

fragment DossierFragment on Dossier {
  __typename
  id
  number
  archived
  prefilled
  state
  motivation
  usager {
    email
  }
  prenomMandataire
  nomMandataire
  deposeParUnTiers
  connectionUsager
  demandeur {
    __typename
    ...PersonnePhysiqueFragment
    ...PersonneMoraleIncompleteFragment
  }
  demarche {
    revision {
      id
    }
  }
  instructeurs {
    id
    email
  }
  traitements {
    state
    emailAgentTraitant
    dateTraitement
    motivation
  }
  champs {
    ...ChampFragment
    ...RootChampFragment
  }
  annotations {
    ...ChampFragment
    ...RootChampFragment
  }
}

fragment PersonneMoraleIncompleteFragment on PersonneMoraleIncomplete {
  siret
}

fragment PersonnePhysiqueFragment on PersonnePhysique {
  civilite
  nom
  prenom
  email
}

fragment ChampFragment on Champ {
  id
  champDescriptorId
  label
  stringValue
}

fragment RootChampFragment on Champ {
  ... on RepetitionChamp {
    rows {
      champs {
        ...ChampFragment
      }
    }
  }
  ... on DossierLinkChamp {
    dossier {
      id
      number
      state
    }
  }
}
`,

    variables: { demarcheNumber: demarcheNumber, after: afterCursor, dossierState: dossierState },
    operationName: "getDemarche",
  };
};
