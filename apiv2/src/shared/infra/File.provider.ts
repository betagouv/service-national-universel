import { promises as fs } from "fs";
import { parse, ParserOptionsArgs } from "@fast-csv/parse";
import * as XLSX from "xlsx";
import * as AWS from "aws-sdk";

import { Injectable } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { ConfigService } from "@nestjs/config";

import { ERRORS } from "snu-lib";

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
    ): Promise<AWS.S3.ManagedUpload.SendData> {
        const bucket = this.config.getOrThrow("bucket.name");
        const endpoint = this.config.getOrThrow("bucket.endpoint");
        const accessKeyId = this.config.getOrThrow("bucket.accessKeyId");
        const secretAccessKey = this.config.getOrThrow("bucket.secretAccessKey");

        return new Promise((resolve, reject) => {
            const s3bucket = new AWS.S3({ endpoint, accessKeyId, secretAccessKey });
            const params = {
                Bucket: bucket,
                Key: path,
                Body: file.data,
                ContentEncoding: file.encoding || "",
                ContentType: file.mimetype,
                Metadata: { "Cache-Control": "max-age=31536000" },
            };

            s3bucket.upload(params, function (err, data) {
                if (err) return reject(`error in callback:${err}`);
                resolve(data);
            });
        });
    }
}
