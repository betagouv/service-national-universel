import { ContactGateway } from "@admin/infra/iam/Contact.gateway";
import { InjectQueue } from "@nestjs/bullmq";
import { QueueName } from "@shared/infra/Queue";
import { Queue } from "bullmq";
import { ContactType } from "../Notification";
import { ReferentSyncDto } from "./Contact";

export class ContactProducer implements ContactGateway {
    constructor(@InjectQueue(QueueName.CONTACT) private contactQueue: Queue) {}
    async syncReferent(referent: ReferentSyncDto): Promise<void> {
        await this.contactQueue.add(ContactType.REFERENT, [referent]);
    }
    async syncReferents(referents: ReferentSyncDto[]): Promise<void> {
        await this.contactQueue.add(ContactType.REFERENT, referents);
    }
    async syncJeunes(jeunes: any[]): Promise<void> {
        await this.contactQueue.add(ContactType.JEUNE, jeunes);
    }
}
