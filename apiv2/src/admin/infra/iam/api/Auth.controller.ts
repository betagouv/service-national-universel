import { Body, Controller, Post } from "@nestjs/common";
import { SigninReferent } from "src/admin/core/iam/useCase/SigninReferent";

export interface SigninDto {
    email: string;
    password: string;
}
@Controller("referent")
export class AuthController {
    constructor(private readonly signinReferent: SigninReferent) {}

    @Post("signin")
    async register(@Body() signinDto: SigninDto) {
        return this.signinReferent.execute(signinDto.email, signinDto.password);
    }
}
