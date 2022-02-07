import { FieldError } from "../generated/graphql";

export const mapFieldErrors = (
  errors: FieldError[]
): { [key: string]: any } => {
  return errors.reduce((acc, error) => {
    return {
      ...acc,
      [error.field]: error.message,
    };
  }, {});
};
