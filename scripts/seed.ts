import { CreateUser } from "@/lib/models";
import { fromSensitive, hashPassword, toSensitive } from "@/lib/Sensitive";
import { PasswordService } from "@/lib/server/PasswordService";
import { Storage } from "@/lib/server/Storage";
import { UserService } from "@/lib/server/UserService";

(async () => {
  await new Storage().flushAll();

  const userService = new UserService();

  const createUserData: CreateUser = {
    email: "orangehead.p@gmail.com",
    inputPassword: "Monomono123,",
  };

  const user = (await userService.createUser(createUserData))!;

  const createUserData2: CreateUser = {
    email: "orangehead.p+1@gmail.com",
    inputPassword: "Monomono123,",
  };

  const user2 = (await userService.createUser(createUserData2))!;

  const userHashedPassword = await hashPassword(
    createUserData.inputPassword,
    user.nonce,
  );

  const passwordService = new PasswordService();
  await passwordService.createTextPassword(user, {
    type: "TEXT",
    name: "yaju",
    text: await toSensitive(userHashedPassword, user.nonce, "114514"),
    url: "https://vercel.com/dashboard",
  });

  const text2 = await toSensitive(userHashedPassword, user.nonce, "1115514");

  await passwordService.createTextPassword(user, {
    type: "TEXT",
    name: "senpai",
    text: text2,
    url: "https://vercel.com/dashboard",
  });

  console.info(
    "decrypting success:",
    "1115514" === (await fromSensitive(userHashedPassword, user.nonce, text2)),
  );

  console.info(await passwordService.listTextPasswords(user));

  console.info(await passwordService.listTextPasswords(user2));
})();
