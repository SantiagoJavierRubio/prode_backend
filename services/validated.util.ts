import { CustomError } from "../Middleware/Errors/CustomError";
import { GroupCreate } from "../Persistence/DAOS/Group.dao";

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
  validateUserName(name: string): void {
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
  arePositiveNumbers(data: any[]): boolean {
    if (!(data instanceof Array)) return false;
    if (
      data.some((item) => {
        if (isNaN(item)) return true;
        if (item < 0) return true;
        return false;
      })
    )
      return false;
    return true;
  }
  validateGroupData(data: GroupCreate): void {
    if (data?.name?.length > 20)
      throw new CustomError(
        400,
        "Group name is too long",
        "Group name must be less than 21 characters"
      );
    if (
      !/[a-zA-Z0-9]/.test(data?.name) ||
      /[/"?&$:'#%{}();,+@]/.test(data.name)
    )
      throw new CustomError(
        400,
        "Group name not valid",
        "Group name must contain no special characters and at least one letter or number"
      );
    if (
      data?.rules?.timeLimit &&
      !this.arePositiveNumbers([data.rules?.timeLimit])
    )
      throw new CustomError(
        400,
        "Time prediction limit must be a positive number"
      );
    if (data?.extraPredictions) {
      data.extraPredictions.forEach((ePred) => {
        if (
          /[/"?&$:'#%{}();,+@]/.test(ePred?.key) ||
          /[/"?&$:'#%{}();,+@]/.test(ePred?.description)
          // || !(ePred?.timeLimit instanceof Date)
        )
          throw new CustomError(400, "Extra prediction format not valid");
      });
    }
  }
}
