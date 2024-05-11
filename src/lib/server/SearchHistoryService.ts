import { Service } from "./Service";
import {
  ListSearchHistoryQuery,
  SearchHistoryModel,
  UpsertSearchHistory,
  UserDO,
  UserModel,
} from "../models";

export class SearchHistoryService extends Service {
  async upsert(user: UserDO, data: UpsertSearchHistory) {
    const text = data.text.trim();
    if (text === "") {
      return null;
    }

    const items = await this.listAll(user);
    const currentItem = items.find(
      (item) =>
        item.type === data.type &&
        item.text.toLowerCase() === text.toLowerCase(),
    );

    if (currentItem) {
      return await this.storage.updateObject(
        SearchHistoryModel,
        currentItem.id,
        {
          last_used: new Date().toISOString(),
        },
      );
    } else {
      await this.deleteOld(user, data.type);
      return await this.storage.createObject(SearchHistoryModel, {
        id: await this.storage.nextSequence(SearchHistoryModel, "id"),
        user_id: user.id,
        text,
        type: data.type,
        last_used: new Date().toISOString(),
      });
    }
  }

  async listAll(user: UserDO) {
    return await this.storage.listObjectsByFk(
      UserModel,
      SearchHistoryModel,
      "user_id",
      user.id,
    );
  }

  async list(user: UserDO, query: ListSearchHistoryQuery) {
    const items = await this.listAll(user);

    const text = query.text.trim().toLowerCase();

    return items
      .filter(
        (item) =>
          item.type === query.type && item.text.toLowerCase().startsWith(text),
      )
      .toSorted((a, b) => b.last_used.localeCompare(a.last_used))
      .toSorted((a, b) => (text.length > 0 ? a.text.length - b.text.length : 0))
      .slice(0, 10);
  }

  async deleteAll(user: UserDO) {
    const objects = await this.storage.listObjectsByFk(
      UserModel,
      SearchHistoryModel,
      "user_id",
      user.id,
    );

    for (const object of objects) {
      await this.storage.deleteObjectByPk(SearchHistoryModel, object.id);
    }
  }

  async deleteOld(user: UserDO, type: string) {
    const objects = (
      await this.storage.listObjectsByFk(
        UserModel,
        SearchHistoryModel,
        "user_id",
        user.id,
      )
    )
      .filter((o) => o.type === type)
      .toSorted((a, b) => a.last_used.localeCompare(b.last_used));

    for (const object of objects.slice(0, objects.length - 10)) {
      await this.storage.deleteObjectByPk(SearchHistoryModel, object.id);
    }
  }
}
