import { sortBy } from "remeda";

import { Service } from "./Service";
import {
  AccountPasswordDO,
  AccountPasswordModel,
  CreateAccountPassword,
  CreatePaymentCard,
  CreateTextPassword,
  PasswordSearch,
  PaymentCardDO,
  PaymentCardModel,
  TextPasswordDO,
  TextPasswordModel,
  UpdateAccountPassword,
  UpdatePaymentCard,
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
    return sortBy(list, (x) => -x.id).filter(
      (x) =>
        x.name
          .toLocaleLowerCase()
          .includes(search.search.toLocaleLowerCase()) ||
        x.url.toLocaleLowerCase().includes(search.search.toLocaleLowerCase()),
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

  async listAccountPassword(user: UserDO, search: PasswordSearch) {
    const list = await this.storage.listObjectsByFk(
      UserModel,
      AccountPasswordModel,
      "user_id",
      user.id,
    );
    return sortBy(list, (x) => -x.id).filter(
      (x) =>
        x.name
          .toLocaleLowerCase()
          .includes(search.search.toLocaleLowerCase()) ||
        x.url.toLocaleLowerCase().includes(search.search.toLocaleLowerCase()),
    );
  }

  async createPaymentCard(user: UserDO, data: CreatePaymentCard) {
    const doData: PaymentCardDO = {
      ...data,
      id: await this.storage.nextSequence(PaymentCardModel, "id"),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return await this.storage.createObject(PaymentCardModel, doData);
  }

  async updatePaymentCard(user: UserDO, data: UpdatePaymentCard) {
    // TODO: judge relation exists
    return await this.storage.updateObject(PaymentCardModel, data.id, {
      ...data,
      updated_at: new Date().toISOString(),
    });
  }

  async deletePaymentCard(user: UserDO, pk: number) {
    // TODO: judge relation exists
    return await this.storage.deleteObjectByPk(PaymentCardModel, pk);
  }

  async listPaymentCard(user: UserDO, search: PasswordSearch) {
    const list = await this.storage.listObjectsByFk(
      UserModel,
      PaymentCardModel,
      "user_id",
      user.id,
    );

    return sortBy(list, (x) => -x.id).filter(
      (x) =>
        x.name
          .toLocaleLowerCase()
          .includes(search.search.toLocaleLowerCase()) ||
        x.url.toLocaleLowerCase().includes(search.search.toLocaleLowerCase()) ||
        x.lastDigits
          .toLocaleLowerCase()
          .includes(search.search.toLocaleLowerCase()) ||
        x.brand.toLocaleLowerCase().includes(search.search.toLocaleLowerCase()),
    );
  }
}
