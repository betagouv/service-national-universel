import { CreateDistributionListBrevoRoute } from './createDistributionList';
import { ImportContactsBrevoRoute } from './importContacts';

export type PlanMarketingRoutes = {
    ImportContacts: ImportContactsBrevoRoute;
    CreateDistributionList: CreateDistributionListBrevoRoute;
}
