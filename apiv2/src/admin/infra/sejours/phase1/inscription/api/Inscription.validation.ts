import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class PostInscriptionsExportPayloadDto {
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

export class PostInscriptionsExportScolarisesPayloadDto {
    @IsObject()
    @IsNotEmpty()
    filters: Record<string, string | string[]>;

    @IsArray()
    @IsString({ each: true })
    fields: string[];

    @IsString()
    @IsOptional()
    searchTerm?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    departement?: string[];

    @IsString()
    @IsOptional()
    region?: string;
}
