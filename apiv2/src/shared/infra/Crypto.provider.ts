import { Injectable } from "@nestjs/common";
import { CryptoGateway } from "../core/Crypto.gateway";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CryptoProvider implements CryptoGateway {
    getUuid(): string {
        return uuidv4();
    }
}
