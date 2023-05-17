import { createHmac, randomUUID } from "crypto";

import * as jose from "jose";

import { env } from "../env";
import { AppError, errorOfFormError } from "../errors";
import {
  CreateUser,
  LoginUser,
  LoginUserResponse,
  UserDO,
  UserModel,
} from "../models";
import { Service } from "@/lib/server/Service";

export class UserService extends Service {
  model = UserModel;

  hashPassword(data: CreateUser, nonce: string) {
    return createHmac("sha512", nonce)
      .update(data.inputPassword)
      .digest()
      .toString("base64");
  }

  async createUser(data: CreateUser) {
    const nonce = randomUUID();

    if (await this.findUserByEmail(data.email)) {
      throw new AppError(
        errorOfFormError<CreateUser>("Email registered. ", {
          _errors: [],
          email: {
            _errors: ["The email is registered. "],
          },
        }),
      );
    }

    return await this.storage.createObject(this.model, {
      ...data,
      id: await this.storage.nextSequence(this.model, "id"),
      nonce,
      hashedPassword: this.hashPassword(data, nonce),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async findUserByEmail(email: string) {
    return await this.storage.readObjectByIndex(this.model, "email", email);
  }

  async findUserById(id: number) {
    return await this.storage.readObjectByPk(this.model, id);
  }

  async login(data: LoginUser): Promise<LoginUserResponse> {
    const user = await this.findUserByEmail(data.email);

    if (!user) {
      throw new AppError(
        errorOfFormError<LoginUser>("The email is not found. ", {
          _errors: [],
          email: {
            _errors: ["The email is not found. "],
          },
        }),
      );
    }

    if (user.hashedPassword !== this.hashPassword(data, user.nonce)) {
      throw new AppError(
        errorOfFormError<LoginUser>("Incorrect password. ", {
          _errors: [],
          inputPassword: {
            _errors: ["Incorrect. "],
          },
        }),
      );
    }

    return {
      token: await this.signJwt(user),
    };
  }

  async signJwt(user: UserDO) {
    return await new jose.SignJWT({ email: user.email, id: user.id })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setExpirationTime("14d")
      .sign(new TextEncoder().encode(env.APP_SECRET));
  }

  async getMeByToken(token: string) {
    const { payload } = await this.verifyToken(token);

    const { id } = payload;

    return await this.findUserById(Number(id));
  }

  async verifyToken(token: string) {
    return await jose.jwtVerify(
      token,
      new TextEncoder().encode(env.APP_SECRET),
    );
  }
}
