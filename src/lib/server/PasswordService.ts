import { sortBy } from "remeda";

import { Service } from "./Service";
import {
  AccountPasswordDO,
  AccountPasswordModel,
  CreateAccountPassword,
  CreateTextPassword,
  PasswordSearch,
  TextPasswordDO,
  TextPasswordModel,
  UpdateAccountPassword,
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

    return await this.storage.createObject(TextPasswordModel, doData);
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

  async createAccountPassword(user: UserDO, data: CreateAccountPassword) {
    const doData: AccountPasswordDO = {
      ...data,
      id: await this.storage.nextSequence(AccountPasswordModel, "id"),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return await this.storage.createObject(AccountPasswordModel, doData);
  }

  async updateAccountPassword(user: UserDO, data: UpdateAccountPassword) {
    // TODO: judge relation exists
    return await this.storage.updateObject(AccountPasswordModel, data.id, {
      ...data,
      updated_at: new Date().toISOString(),
    });
  }

  async deleteAccountPassword(user: UserDO, pk: number) {
    // TODO: judge relation exists
    return await this.storage.deleteObjectByPk(AccountPasswordModel, pk);
  }

  async listAccountPasswords(user: UserDO, search: PasswordSearch) {
    const list = await this.storage.listObjectsByFk(
      UserModel,
      AccountPasswordModel,
      "user_id",
      user.id,
    );
    return sortBy(list, (x) => x.id).filter(
      (x) => x.name.includes(search.search) || x.url.includes(search.search),
    );
  }
}
