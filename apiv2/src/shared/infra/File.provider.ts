import { promises as fs } from "fs";
import { parse, ParserOptionsArgs } from "@fast-csv/parse";
import * as XLSX from "xlsx";
import * as AWS from "aws-sdk";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

import { ERRORS } from "snu-lib";
import { FileGateway } from "@shared/core/File.gateway";

import { TechnicalException, TechnicalExceptionType } from "./TechnicalException";

// TODO: à déplacer dans le module "file"
@Injectable()
export class FileProvider implements FileGateway {
    constructor(private readonly config: ConfigService) {}

    async readCSV<T>(filePath: string, options: ParserOptionsArgs = { headers: true }): Promise<T[]> {
        const buffer = await fs.readFile(filePath);
        return new Promise((resolve, reject) => {
            const content: T[] = [];

            const stream = parse(options)
                .on("error", (error) => {
                    console.log(error);
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

    async generateExcel(excelSheets: { [sheet: string]: any[] }): Promise<Buffer> {
        const wb = XLSX.utils.book_new();
        for (const sheetName of Object.keys(excelSheets)) {
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(excelSheets[sheetName]), sheetName);
        }
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

        const s3bucket = new AWS.S3({ endpoint, accessKeyId, secretAccessKey });
        const params: AWS.S3.Types.PutObjectRequest = {
            Bucket: bucket,
            Key: path,
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
        return {
            Body: awsResponse.Body as Buffer,
            ContentLength: awsResponse.ContentLength,
            ContentType: awsResponse.ContentType,
            FileName: path.replace(/^.*[\\/]/, ""),
        };
    }

    deleteFile(path: string): Promise<void> {
        throw new TechnicalException(TechnicalExceptionType.NOT_IMPLEMENTED_YET);
    }
}
