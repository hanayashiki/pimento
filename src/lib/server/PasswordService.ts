import { sortBy } from "remeda";

import { Service } from "./Service";
import {
  CreateTextPassword,
  PasswordSearch,
  TextPasswordDO,
  TextPasswordModel,
  UpdateTextPassword,
  UserDO,
  UserModel,
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

  async updateTextPassword(user: UserDO, data: UpdateTextPassword) {
    // TODO: judge relation exists
    return await this.storage.updateObject(TextPasswordModel, data.id, {
      ...data,
      updated_at: new Date().toISOString(),
    });
  }

  async deleteTextPassword(user: UserDO, pk: number) {
    // TODO: judge relation exists
    return await this.storage.deleteObjectByPk(TextPasswordModel, pk);
  }

  async listTextPasswords(user: UserDO, search: PasswordSearch) {
    const list = await this.storage.listObjectsByFk(
      UserModel,
      TextPasswordModel,
      "user_id",
      user.id,
    );
    return sortBy(list, (x) => x.id).filter(
      (x) => x.name.includes(search.search) || x.url.includes(search.search),
    );
  }
}
