import { IsOptional, IsString, IsInt, Min, IsObject, IsIn } from "class-validator";
import { Transform, Type } from "class-transformer";
import { SearchParams } from "src/analytics/core/elasticsearch/QueryBuilder.types";

export class SearchYoungDto implements SearchParams {
    @IsOptional()
    @IsString()
    searchTerm?: string;

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
    @Transform(({ value }) => {
        try {
            return typeof value === "string" ? JSON.parse(value) : value;
        } catch {
            return value;
        }
    })
    filters?: Record<string, string | string[]>;

    @IsOptional()
    @IsString()
    sortField?: string;

    @IsOptional()
    @IsString()
    @IsIn(["asc", "desc"])
    sortOrder?: "asc" | "desc";
}
