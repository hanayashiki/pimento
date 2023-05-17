import { Service } from "./Service";
import {
  CreateTextPassword,
  TextPasswordDO,
  TextPasswordModel,
  UserDO,
} from "../models";

export class PasswordService extends Service {
  async createTextPassword(user: UserDO, data: CreateTextPassword) {
    const doData: TextPasswordDO = {
      ...data,
      id: await this.storage.nextSequence(TextPasswordModel, "id"),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.storage.createObject(TextPasswordModel, doData);
  }
}
