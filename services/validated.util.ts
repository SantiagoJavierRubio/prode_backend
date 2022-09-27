import { CustomError } from "../Middleware/Errors/CustomError";

export class Validated {
  hasNulls(data: any[]): boolean {
    if (
      data.some((item) => {
        if (item === null || item === undefined) return true;
        return false;
      })
    )
      return true;
    return false;
  }
  validateUserName(name: string) {
    if (name.length > 20) {
      throw new CustomError(
        400,
        "Username too long",
        "Usernames should be 20 characters or less"
      );
    }
    if (/([^A-Za-z0-9])/.test(name)) {
      throw new CustomError(
        400,
        "Invalid username",
        "Only alphanumeric characters allowed"
      );
    }
  }
}
