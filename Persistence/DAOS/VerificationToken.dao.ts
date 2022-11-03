import { CustomError } from "../../Middleware/Errors/CustomError";
import { Container } from "../Containers/Mongo.container";
import { v4 as uuid } from "uuid";
import {
  VerificationTokenDocument,
  VerificationToken,
} from "../Models/VerificationToken.model";
import { LeanDocument } from "mongoose";

export class VerificationTokenDAO extends Container<VerificationTokenDocument> {
  constructor() {
    super(VerificationToken);
  }
  async generate(userId: string): Promise<string> {
    const newToken = await this.create({ user_id: userId, token: uuid() });
    if (!newToken) throw new CustomError(500, "Failed to create token");
    return newToken.token;
  }
  async findByUserId(
    userId: string
  ): Promise<LeanDocument<VerificationTokenDocument> | null> {
    return await this.getOne({ user_id: userId });
  }
  async remove(tokenId: string): Promise<boolean> {
    await this.delete(tokenId);
    return true;
  }
}
