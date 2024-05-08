import { Redis } from "@upstash/redis/cloudflare";
import { pipe, reduce } from "remeda";
import { z } from "zod";

import { env } from "@/lib/env";
import { ZodAnyObject } from "@/lib/types";

export type ModelFields<S extends ZodAnyObject> = keyof S["shape"] & string;

export type ForeignKeyMap = Record<string, AnyModel>;

export interface Model<
  in out S extends ZodAnyObject = ZodAnyObject,
  FK extends ForeignKeyMap = {},
> {
  name: string;
  do: S;
  pk: ModelFields<S>;
  uniqueIndices: ModelFields<S>[];
  fks: FK;
}

export type AnyModel = Model<any, ForeignKeyMap>;

export type AnyData = Record<string, any>;

export type ModelDO<M extends AnyModel> = z.infer<M["do"]>;
export type ModelPkValue<M extends AnyModel> = ModelDO<M>[M["pk"]];

export const defineModel = <
  S extends ZodAnyObject = ZodAnyObject,
  FK extends ForeignKeyMap = {},
>(
  model: Model<S, FK>,
) => model;

const autoDeserializeRawObject = <T>(rawObject: T): T => {
  if (typeof rawObject === "object" && !!rawObject) {
    for (const [k, v] of Object.entries(rawObject)) {
      try {
        if (typeof v === "string") {
          const parsed = JSON.parse(v);
          (rawObject as any)[k] = parsed;
        }
      } catch (e) {}
    }
  }
  return rawObject;
};

export class ErrorPk extends Error {
  constructor(
    public model: AnyModel,
    public pkValue: any,
  ) {
    super(`${StorageHelpers.getPkKeyName(model, pkValue)} already exists`);
  }
}
export class ErrorPkNotExist extends Error {
  constructor(
    public model: AnyModel,
    public pkValue: any,
  ) {
    super(`${StorageHelpers.getPkKeyName(model, pkValue)} does not exists`);
  }
}

export class ErrorUniqueIndex extends Error {
  constructor(
    public model: AnyModel,
    public uniqueIndex: string,
    public uniqueIndexValue: any,
  ) {
    super(
      `${StorageHelpers.getUniqueIndexKeyName(
        model,
        uniqueIndex,
        uniqueIndexValue,
      )} already exists`,
    );
  }
}

export class StorageHelpers {
  static getUniqueIndexKeyName(
    model: AnyModel,
    uniqueIndex: string,
    indexValue: any,
  ) {
    return `${model.name}__unique_index:${uniqueIndex}:${indexValue}`;
  }

  static getPkKeyName(model: AnyModel, pkValue: any) {
    return `${model.name}__pk:${pkValue}`;
  }

  static getSequenceName(model: AnyModel, sequenceName: string) {
    return `${model.name}__sequence:${sequenceName}`;
  }

  static getFkKeyName(
    oneModel: AnyModel,
    manyModel: AnyModel,
    fkName: string,
    fkValue: any,
  ) {
    if (!(fkName in manyModel.do.shape)) {
      throw new Error(`${fkName} not found on model ${manyModel.name}`);
    }

    return `${oneModel.name}__fk:${manyModel.name}:${fkName}:${fkValue}`;
  }
}

export class Storage {
  kv: Redis;

  constructor() {
    this.kv = new Redis({
      url: env.KV2_REST_API_URL,
      token: env.KV2_REST_API_TOKEN,
    });
  }

  async flushAll() {
    await this.kv.flushall();
  }

  async createObject<S extends ZodAnyObject, FK extends ForeignKeyMap = {}>(
    model: Model<S, FK>,
    _data: ModelDO<Model<S>>,
  ) {
    const data = model.do.parse(_data);

    const pkValue = data[model.pk];

    await this.checkPk(model, data);

    await this.checkUniqueness(model, data);

    await pipe(
      this.kv.pipeline(),
      (p) =>
        model.uniqueIndices.reduce(
          (p, uniqueIndex) =>
            p.set(
              StorageHelpers.getUniqueIndexKeyName(
                model,
                uniqueIndex,
                data[uniqueIndex],
              ),
              pkValue,
            ),
          p,
        ),
      (p) =>
        Object.entries(model.fks).reduce(
          (p, [fkName, oneModel]) =>
            p.sadd(
              StorageHelpers.getFkKeyName(
                oneModel,
                model,
                fkName,
                data[fkName],
              ),
              pkValue,
            ),
          p,
        ),
      (p) => p.hset(StorageHelpers.getPkKeyName(model, pkValue), data),
      (p) => p.exec(),
    );

    return await this.readObjectByPk(model, pkValue);
  }

  async updateObject<S extends ZodAnyObject, FK extends ForeignKeyMap = {}>(
    model: Model<S, FK>,
    pkValue: ModelDO<Model<S, FK>>[Model<S, FK>["pk"]],
    _data: Partial<ModelDO<Model<S, FK>>>,
  ) {
    const data = model.do.partial().parse(_data);

    const object = await this.readObjectByPk(model, pkValue);

    if (!object) {
      throw new ErrorPkNotExist(model, pkValue);
    }

    // TODO: update keys

    await pipe(
      this.kv.pipeline(),
      (p) => p.hset(StorageHelpers.getPkKeyName(model, pkValue), data),
      (p) => p.exec(),
    );

    return await this.readObjectByPk(model, pkValue);
  }

  async deleteObjectByPk<S extends ZodAnyObject, FK extends ForeignKeyMap = {}>(
    model: Model<S, FK>,
    pkValue: ModelDO<Model<S, FK>>[Model<S, FK>["pk"]],
  ) {
    const data = await this.readObjectByPk(model, pkValue);
    if (!data) {
      throw new ErrorPkNotExist(model, pkValue);
    }

    await pipe(
      this.kv.pipeline(),
      (p) =>
        model.uniqueIndices.reduce(
          (p, uniqueIndex) =>
            p.del(
              StorageHelpers.getUniqueIndexKeyName(
                model,
                uniqueIndex,
                data[uniqueIndex],
              ),
            ),
          p,
        ),
      (p) =>
        Object.entries(model.fks).reduce(
          (p, [fkName, oneModel]) =>
            p.srem(
              StorageHelpers.getFkKeyName(
                oneModel,
                model,
                fkName,
                data[fkName],
              ),
              pkValue,
            ),
          p,
        ),
      (p) => p.hset(StorageHelpers.getPkKeyName(model, pkValue), data),
      (p) => p.exec(),
    );

    return data;
  }

  async readObjectByPk<S extends ZodAnyObject, FK extends ForeignKeyMap = {}>(
    model: Model<S, FK>,
    pkValue: any,
  ): Promise<ModelDO<Model<S>> | null> {
    const rawObject = await this.kv.hgetall(
      StorageHelpers.getPkKeyName(model, pkValue),
    );
    return model.do.parse(autoDeserializeRawObject(rawObject));
  }

  async readObjectByIndex<S extends ZodAnyObject>(
    model: Model<S>,
    index: string,
    indexValue: any,
  ): Promise<ModelDO<Model<S>> | null> {
    const pkValue = await this.kv.get(
      StorageHelpers.getUniqueIndexKeyName(model, index, indexValue),
    );

    if (pkValue === null) return null;

    return this.readObjectByPk(model, pkValue);
  }

  async listObjectsByFk<S extends ZodAnyObject>(
    oneModel: AnyModel,
    manyModel: Model<S>,
    fkName: string,
    fkValue: any,
  ): Promise<ModelDO<Model<S>>[]> {
    const pks = await this.kv.smembers(
      StorageHelpers.getFkKeyName(oneModel, manyModel, fkName, fkValue),
    );

    if (pks.length === 0) return [];

    const objects = await reduce(
      pks,
      (p, pk) => p.hgetall(StorageHelpers.getPkKeyName(manyModel, pk)),
      this.kv.pipeline(),
    ).exec();

    return manyModel.do.array().parse(objects.map(autoDeserializeRawObject));
  }

  async checkPk(model: AnyModel, data: AnyData) {
    const v = await this.kv.get(
      StorageHelpers.getPkKeyName(model, data[model.pk]),
    );

    if (v != null) {
      throw new ErrorPk(model, data[model.pk]);
    }
  }

  async checkUniqueness(model: AnyModel, data: AnyData) {
    for (const uniqueIndex of model.uniqueIndices) {
      const v = await this.kv.get(
        StorageHelpers.getUniqueIndexKeyName(
          model,
          uniqueIndex,
          data[uniqueIndex],
        ),
      );
      if (v != null) {
        throw new ErrorUniqueIndex(model, uniqueIndex, data[uniqueIndex]);
      }
    }
  }

  async nextSequence(model: AnyModel, sequenceName: string) {
    return await this.kv.incr(
      StorageHelpers.getSequenceName(model, sequenceName),
    );
  }
}
