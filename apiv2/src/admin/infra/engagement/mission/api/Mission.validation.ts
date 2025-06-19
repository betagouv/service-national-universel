import { IsArray, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class PostCandidaturesExportPayloadDto {
    @IsObject()
    @IsNotEmpty()
    filters: Record<string, string | string[]>;

    @IsArray()
    @IsString({ each: true })
    fields: string[];

    @IsString()
    @IsOptional()
    searchTerm?: string;
}

export class PostMissionsExportPayloadDto {
    @IsObject()
    @IsNotEmpty()
    filters: Record<string, string | string[]>;

    @IsArray()
    @IsString({ each: true })
    fields: string[];

    @IsString()
    @IsOptional()
    searchTerm?: string;
}
