import { ESHit } from "./ElasticQuery";

export class ElasticMapper {
    static mapElasticHitToResult<T>(hit: ESHit<T>): T {
        return {
            _id: hit._id,
            ...hit._source,
        };
    }
}
