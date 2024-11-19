import { Module } from "@nestjs/common";
import { AbilityFactory } from "./Ability.factory";

@Module({
    providers: [AbilityFactory],
    exports: [AbilityFactory],
})
export class CaslModule {}
