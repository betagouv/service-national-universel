import { UseCase } from "@shared/core/UseCase";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { EXPORT_JEUNE_FOLDER } from "../ExporterJeune.service";

@Injectable()
export class NettoyageExportJeune implements UseCase<number> {
    private readonly logger: Logger = new Logger(NettoyageExportJeune.name);

    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
    ) {}

    async execute(): Promise<number> {
        const files = await this.fileGateway.remoteListFiles(EXPORT_JEUNE_FOLDER);
        this.logger.log(`${files.length} files found`);
        let count = 0;

        for (const file of files) {
            if (
                this.clockGateway.isBefore(
                    this.clockGateway.endOfDay(file.LastModified),
                    this.clockGateway.startOfDay(new Date()),
                )
            ) {
                try {
                    this.logger.log(`Removing ${file.Key} as it's older than 1 day (${file.LastModified})`);
                    await this.fileGateway.deleteRemoteFile(file.Key);
                    count++;
                } catch (error) {
                    this.logger.error(`Error deleting ${file.Key}: ${error}`);
                }
            }
        }

        this.logger.log(`${count} files removed`);

        return count;
    }
}
