import { IsOptional, IsString, IsInt, Min, IsObject, IsIn, ValidateNested, isArray, IsArray } from "class-validator";
import { Transform, Type } from "class-transformer";
import { SearchParams, SearchTerm } from "snu-lib";

class SearchTermDto implements SearchTerm {
    @IsString()
    value: string;

    @IsString({ each: true })
    fields: string[];
}

export class SearchYoungDto implements SearchParams {
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => SearchTermDto)
    searchTerm?: SearchTermDto;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    page?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    size?: number;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => Object)
    filters?: Record<string, string | string[]>;

    @IsOptional()
    @IsArray()
    existingFields?: string[];

    @IsOptional()
    @IsString({ each: true })
    @Type(() => String)
    sourceFields?: string[];

    @IsOptional()
    @IsString()
    sortField?: string;

    @IsOptional()
    @IsString()
    @IsIn(["asc", "desc"])
    sortOrder?: "asc" | "desc";
}
