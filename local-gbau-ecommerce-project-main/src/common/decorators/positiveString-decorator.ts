import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsPositiveNumber(validationOptions?: ValidationOptions) {
  return function (object, propertyName: string) {
    registerDecorator({
      name: 'isPositiveNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const num = parseInt(value, 10);
          return !isNaN(num) && num > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe ser un número positivo`;
        },
      },
    });
  };
}
