import { StructureProjection, STRUCTURE_PROJECTION_KEYS } from "@admin/core/engagement/structure/Structure.model";
import { IsArray, IsIn, IsString } from "class-validator";

export class StructureProjectionPayloadDto {
    @IsArray()
    @IsString({ each: true })
    @IsIn(STRUCTURE_PROJECTION_KEYS, { each: true })
    fields: readonly StructureProjection[];
}
