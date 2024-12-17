import { Injectable } from "@nestjs/common";

@Injectable()
export abstract class DbSessionGateway<T> {
    public abstract start(): Promise<void>;
    public abstract commit(): Promise<void>;
    public abstract end(): Promise<void>;
    public abstract abort(): Promise<void>;
    public abstract get(): T | null;
}
