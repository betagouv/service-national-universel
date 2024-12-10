import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { FunctionalException, FunctionalExceptionCode } from '@shared/core/FunctionalException';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new BadRequestException('Validation failed');
    }
  }
}

export class ZodImportValidationPipe extends ZodValidationPipe {
    constructor(schema: ZodSchema) {
        super(schema);
    }

    transform(value: unknown, metadata: ArgumentMetadata) {
        try {
            console.log("value", value);
            return super.transform(value, metadata);
        } catch (error) {
            throw new FunctionalException(FunctionalExceptionCode.INVALID_FILE_FORMAT);
        }
    }
}