import { promises as fs } from "fs";
import { parse, ParserOptionsArgs } from "@fast-csv/parse";
import { writeToString } from "@fast-csv/format";
import * as XLSX from "xlsx";
import * as AWS from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import { Injectable, Logger } from "@nestjs/common";

import { cleanFileNamePath, ERRORS } from "snu-lib";
import { CsvOptions, FileGateway } from "@shared/core/File.gateway";

import { TechnicalException, TechnicalExceptionType } from "./TechnicalException";

// TODO: à déplacer dans le module "file"
@Injectable()
export class FileProvider implements FileGateway {
    private readonly logger: Logger = new Logger(FileProvider.name);

    constructor(private readonly config: ConfigService) {}
    async generateCSV(
        recordArray: Record<string, any>[],
        options: CsvOptions = { headers: true, delimiter: ";" },
    ): Promise<string> {
        this.logger.log(`Generating CSV with ${recordArray.length} rows with column names:${options.headers}`);

        return writeToString(recordArray, { ...options, quote: '"', alwaysWriteHeaders: true });
    }

    async readFile(filePath: string): Promise<Buffer> {
        return fs.readFile(filePath);
    }

    async parseCSV<T>(buffer: Buffer, options: ParserOptionsArgs = { headers: true }): Promise<T[]> {
        return new Promise((resolve, reject) => {
            const content: T[] = [];

            const stream = parse(options)
                .on("error", (error) => {
                    reject(new Error(ERRORS.CANNOT_PARSE_CSV));
                })
                .on("data", (row) => {
                    content.push(row);
                })
                .on("end", () => {
                    resolve(content);
                });
            stream.write(buffer);
            stream.end();
        });
    }

    async parseXLS<T>(
        buffer: Buffer,
        options?: { sheetIndex?: number; sheetName?: string; defval?: any },
    ): Promise<T[]> {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = options?.sheetName || workbook.SheetNames[options?.sheetIndex || 0];
        const worksheet = workbook.Sheets[sheetName];

        return await XLSX.utils.sheet_to_json<T>(worksheet, { defval: options?.defval });
    }

    async generateExcel(excelSheets: { [sheet: string]: any[] }): Promise<Buffer> {
        const wb = XLSX.utils.book_new();
        for (const sheetName of Object.keys(excelSheets)) {
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(excelSheets[sheetName]), sheetName);
        }
        return XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    }

    async generateExcelFromValues({
        columnsName,
        values,
        sheetName = "data",
    }: {
        columnsName: string[];
        values: any[][];
        sheetName: string;
    }): Promise<Buffer> {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([columnsName, ...values]), sheetName);
        return XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    }

    async uploadFile(
        path: string,
        file: { data: Buffer; encoding?: string; mimetype: string },
        options: {
            ACL?: "private" | "public-read";
        } = {},
    ): Promise<AWS.S3.ManagedUpload.SendData> {
        const bucket = this.config.getOrThrow("bucket.name");
        const endpoint = this.config.getOrThrow("bucket.endpoint");
        const accessKeyId = this.config.getOrThrow("bucket.accessKeyId");
        const secretAccessKey = this.config.getOrThrow("bucket.secretAccessKey");

        const cleanPath = cleanFileNamePath(path);

        const s3bucket = new AWS.S3({ endpoint, accessKeyId, secretAccessKey });
        const params: AWS.S3.Types.PutObjectRequest = {
            Bucket: bucket,
            Key: cleanPath,
            Body: file.data,
            ContentEncoding: file.encoding || "",
            ContentType: file.mimetype,
            Metadata: { "Cache-Control": "max-age=31536000" },
            ...options,
        };

        return s3bucket.upload(params).promise();
    }

    async downloadFile(
        path: string,
    ): Promise<{ Body: Buffer; ContentLength?: number; ContentType?: string; FileName?: string }> {
        const bucket = this.config.getOrThrow("bucket.name");
        const endpoint = this.config.getOrThrow("bucket.endpoint");
        const accessKeyId = this.config.getOrThrow("bucket.accessKeyId");
        const secretAccessKey = this.config.getOrThrow("bucket.secretAccessKey");

        const s3bucket = new AWS.S3({ endpoint, accessKeyId, secretAccessKey });
        const params: AWS.S3.Types.GetObjectRequest = {
            Bucket: bucket,
            Key: path,
        };

        const awsResponse = await s3bucket.getObject(params).promise();
        const fileName = path.replace(/^.*[\\/]/, ""); // get file name from path;
        return {
            Body: awsResponse.Body as Buffer,
            ContentLength: awsResponse.ContentLength,
            ContentType: awsResponse.ContentType,
            FileName: fileName,
        };
    }

    async remoteFileExists(path: string): Promise<boolean> {
        const bucket = this.config.getOrThrow("bucket.name");
        const endpoint = this.config.getOrThrow("bucket.endpoint");
        const accessKeyId = this.config.getOrThrow("bucket.accessKeyId");
        const secretAccessKey = this.config.getOrThrow("bucket.secretAccessKey");

        const s3bucket = new AWS.S3({ endpoint, accessKeyId, secretAccessKey });
        const params: AWS.S3.Types.HeadObjectRequest = {
            Bucket: bucket,
            Key: path,
        };

        try {
            await s3bucket.headObject(params).promise();
            return true;
        } catch (error) {
            return false;
        }
    }
    async remoteListFiles(path: string): Promise<
        {
            Key: string;
            LastModified: Date;
            Size: number;
        }[]
    > {
        const bucket = this.config.getOrThrow("bucket.name");
        const endpoint = this.config.getOrThrow("bucket.endpoint");
        const accessKeyId = this.config.getOrThrow("bucket.accessKeyId");
        const secretAccessKey = this.config.getOrThrow("bucket.secretAccessKey");

        const s3bucket = new AWS.S3({ endpoint, accessKeyId, secretAccessKey });
        const params: AWS.S3.Types.ListObjectsV2Request = {
            Bucket: bucket,
            Prefix: path,
        };
        const awsResponse = await s3bucket.listObjectsV2(params).promise();

        return (
            awsResponse.Contents?.map((content) => ({
                Key: content.Key!,
                LastModified: content.LastModified!,
                Size: content.Size!,
            })) || []
        );
    }

    async deleteRemoteFile(path: string): Promise<void> {
        const bucket = this.config.getOrThrow("bucket.name");
        const endpoint = this.config.getOrThrow("bucket.endpoint");
        const accessKeyId = this.config.getOrThrow("bucket.accessKeyId");
        const secretAccessKey = this.config.getOrThrow("bucket.secretAccessKey");

        const s3bucket = new AWS.S3({ endpoint, accessKeyId, secretAccessKey });
        const params: AWS.S3.Types.DeleteObjectRequest = {
            Bucket: bucket,
            Key: path,
        };
        await s3bucket.deleteObject(params).promise();
    }

    baseName(path: string): string {
        return path.replace(/^.*[\\/]/, "");
    }

    getFileUrlFromKey(key: string): string {
        const bucket = this.config.getOrThrow("bucket.name");
        const endpoint = this.config.getOrThrow("bucket.endpoint");
        return `https://${bucket}.${endpoint}/${key}`;
    }

    async getFileSignedUrlFromKey(path: string): Promise<string> {
        const bucket = this.config.getOrThrow("bucket.name");
        const endpoint = this.config.getOrThrow("bucket.endpoint");
        const accessKeyId = this.config.getOrThrow("bucket.accessKeyId");
        const secretAccessKey = this.config.getOrThrow("bucket.secretAccessKey");

        const s3bucket = new AWS.S3({ endpoint, accessKeyId, secretAccessKey });
        const params: AWS.S3.Types.GetObjectRequest = {
            Bucket: bucket,
            Key: path,
        };
        return s3bucket.getSignedUrl("getObject", params);
    }
}
