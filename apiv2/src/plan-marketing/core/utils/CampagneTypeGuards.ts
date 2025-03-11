import { CampagneModel, CampagneSpecifiqueModelWithRef, CreateCampagneModel, CreateCampagneSpecifiqueModelWithRef } from "../Campagne.model";

export const isCampagneWithRef = (model: CampagneModel | CreateCampagneModel): model is CampagneSpecifiqueModelWithRef | CreateCampagneSpecifiqueModelWithRef => {
    return !model.generic && 'campagneGeneriqueId' in model;
};