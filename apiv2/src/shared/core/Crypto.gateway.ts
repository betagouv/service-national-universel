export interface CryptoGateway {
    getUuid(): string;
}

export const CryptoGateway = Symbol("CryptoGateway");
