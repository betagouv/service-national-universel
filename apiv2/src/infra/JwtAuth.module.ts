import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        JwtModule.register({
            global: true,
            signOptions: { expiresIn: "3600s" },
        }),
    ],
})
export class JwtAuthModule {}
