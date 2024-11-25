import { InjectQueue } from "@nestjs/bullmq";
import { Inject } from "@nestjs/common";
import { Queue } from "bullmq";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { ContactGateway } from "@admin/infra/iam/Contact.gateway";
import { ContactType } from "../Notification";
import { QueueName } from "@shared/infra/Queue";

export class ContactProducer implements ContactGateway {
    constructor(@InjectQueue(QueueName.CONTACT) private contactQueue: Queue) {}
    async syncReferent(referent: ReferentModel): Promise<void> {
        await this.contactQueue.add(ContactType.REFERENT, [referent]);
    }
    async syncReferents(referents: ReferentModel[]): Promise<void> {
        await this.contactQueue.add(ContactType.REFERENT, referents);
    }
    async syncJeunes(jeunes: any[]): Promise<void> {
        await this.contactQueue.add(ContactType.JEUNE, jeunes);
    }
}
