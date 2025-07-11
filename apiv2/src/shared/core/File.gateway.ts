// TODO: à déplacer dans le module "file"
export interface CsvOptions {
    headers?: boolean | string[];
    delimiter: string;
}
export interface FileGateway {
    readFile(filePath: string): Promise<Buffer>;
    parseCSV<T>(
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
    generateCSV(data: Record<string, any>[], options: CsvOptions): Promise<string>;
    parseXLS<T>(buffer: Buffer, options?: { sheetIndex?: number; sheetName?: string; defval?: any }): Promise<T[]>;
    generateExcel(excelSheets: { [sheet: string]: any[] }): Promise<Buffer>;
    generateExcelFromValues({
        columnsName,
        values,
        sheetName,
    }: {
        columnsName: string[];
        values: any[][];
        sheetName: string;
    }): Promise<Buffer>;
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
    remoteFileExists(path: string): Promise<boolean>;
    downloadFile(
        path: string,
    ): Promise<{ Body: Buffer; ContentLength?: number; ContentType?: string; FileName?: string }>;
    deleteRemoteFile(path: string): Promise<void>;
    baseName(path: string): string;
    getFileUrlFromKey(key: string): string;
}

export const FileGateway = Symbol("FileGateway");
