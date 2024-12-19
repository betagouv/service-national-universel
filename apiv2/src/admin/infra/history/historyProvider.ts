import { HistoryGateway } from "@admin/core/history/History.gateway";
import { HistoryRepository } from "./repository/mongo/HistoryMongo.repository";
import { historyMongoProviders } from "./repository/mongo/HistoryMongo.provider";

export const historyProvider = [
    ...historyMongoProviders,
    {
        provide: HistoryGateway,
        useClass: HistoryRepository,
    },
];
