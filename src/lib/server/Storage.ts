import { VercelKV, createClient } from "@vercel/kv";
import { pipe, reduce } from "remeda";
import { z } from "zod";

import { env } from "@/lib/env";
import { ZodAnyObject } from "@/lib/types";

export type ModelFields<S extends ZodAnyObject> = keyof S["shape"] & string;

export interface Model<in out S extends ZodAnyObject = ZodAnyObject> {
  name: string;
  do: S;
  pk: ModelFields<S>;
  uniqueIndices: ModelFields<S>[];
}

export type AnyModel = Model<any>;

export type AnyData = Record<string, any>;

export const defineModel = <S extends ZodAnyObject = ZodAnyObject>(
  model: Model<S>,
) => model;

export class ErrorPk extends Error {
  constructor(public model: AnyModel, public pkValue: any) {
    super(`${StorageHelpers.getPkKeyName(model, pkValue)} already exists`);
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
}

export class Storage {
  kv: VercelKV;

  constructor() {
    this.kv = createClient({
      url: env.KV2_REST_API_URL,
      token: env.KV2_REST_API_TOKEN,
    });
  }

  async flushAll() {
    await this.kv.flushall();
  }

  async createObject<S extends ZodAnyObject>(
    model: Model<S>,
    data: z.infer<Model<S>["do"]>,
  ) {
    const pkValue = data[model.pk];

    await this.checkPk(model, data);

    await this.checkUniqueness(model, data);

    await pipe(
      model.uniqueIndices,
      reduce(
        (p, uniqueIndex) =>
          p.set(
            StorageHelpers.getUniqueIndexKeyName(
              model,
              uniqueIndex,
              data[uniqueIndex],
            ),
            pkValue,
          ),
        this.kv.pipeline(),
      ),
      (p) => p.hset(StorageHelpers.getPkKeyName(model, pkValue), data),
      (p) => p.exec(),
    );

    return await this.readObjectByPk(model, pkValue);
  }

  async readObjectByPk<S extends ZodAnyObject>(
    model: Model<S>,
    pkValue: any,
  ): Promise<z.infer<Model<S>["do"]> | null> {
    const rawObject = await this.kv.hgetall(
      StorageHelpers.getPkKeyName(model, pkValue),
    );

    return model.do.parse(rawObject);
  }

  async readObjectByIndex<S extends ZodAnyObject>(
    model: Model<S>,
    index: string,
    indexValue: any,
  ): Promise<z.infer<Model<S>["do"]> | null> {
    const pkValue = await this.kv.get(
      StorageHelpers.getUniqueIndexKeyName(model, index, indexValue),
    );

    if (pkValue === null) return null;

    return this.readObjectByPk(model, pkValue);
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
