import { Role } from "aws-sdk/clients/budgets";
import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsString, MinLength } from "class-validator";
import { Query } from "mongoose";

import { departmentList, GRADES, region2department, RegionsMetropole } from "snu-lib";

export class ReferentByRoleQueryDto {
    role: Role;
    search: string;
}
