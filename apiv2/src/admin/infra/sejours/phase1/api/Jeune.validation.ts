import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class PostJeunesExportPayloadDto {
    @IsObject()
    @IsNotEmpty()
    filters: Record<string, string[]>;

    @IsArray()
    @IsString({ each: true })
    fields: string[];

    @IsString()
    @IsOptional()
    searchTerm?: string;
}

export class PostJeunesExportScolarisesPayloadDto {
    @IsObject()
    @IsNotEmpty()
    filters: Record<string, string[]>;

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
