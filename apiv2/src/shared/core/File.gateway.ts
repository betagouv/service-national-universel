// TODO: à déplacer dans le module "file"
export interface FileGateway {
    readCSV<T>(
        buffer: Buffer,
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
    readXLS<T>(buffer: Buffer, { sheetIndex }?: { sheetIndex: number }): Promise<T[]>;
    generateExcel(excelSheets: { [sheet: string]: any[] }): Promise<Buffer>;
    uploadFile(
        path: string,
        file: { data: Buffer; encoding?: string; mimetype: string },
        options?: {
            ACL?: "private" | "public-read";
        },
    ): Promise<{
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    }>;
    downloadFile(
        path: string,
    ): Promise<{ Body: Buffer; ContentLength?: number; ContentType?: string; FileName?: string }>;
    deleteFile(path: string): Promise<void>;
}

export const FileGateway = Symbol("FileGateway");
