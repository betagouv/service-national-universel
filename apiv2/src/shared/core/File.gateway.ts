export interface FileGateway {
    readCSV<T>(
        filePath: string,
        options: {
            objectMode?: boolean;
            delimiter?: string;
            quote?: string | null;
            escape?: string;
            headers?: boolean;
            renameHeaders?: boolean;
            ignoreEmpty?: boolean;
            comment?: string;
            strictColumnHandling?: boolean;
            discardUnmappedColumns?: boolean;
            trim?: boolean;
            ltrim?: boolean;
            rtrim?: boolean;
            encoding?: string;
            maxRows?: number;
            skipLines?: number;
            skipRows?: number;
        },
    ): Promise<T[]>;
    generateExcel(excelSheets: { [sheet: string]: any[] }): Promise<Buffer>;
    uploadFile(
        path: string,
        file: { data: Buffer; encoding?: string; mimetype: string },
    ): Promise<{
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    }>;
}

export const FileGateway = Symbol("FileGateway");
