import { CreateUser } from "@/lib/models";
import { fromSensitive, toSensitive } from "@/lib/Sensitive";
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

  const passwordService = new PasswordService();
  await passwordService.createTextPassword(user, {
    type: "TEXT",
    text: await toSensitive(createUserData.inputPassword, user.nonce, "114514"),
    url: "https://vercel.com/dashboard",
  });

  const text2 = await toSensitive(
    createUserData.inputPassword,
    user.nonce,
    "1115514",
  );

  await passwordService.createTextPassword(user, {
    type: "TEXT",
    text: text2,
    url: "https://vercel.com/dashboard",
  });

  console.info(
    "decrypting success:",
    "1115514" ===
      (await fromSensitive(createUserData.inputPassword, user.nonce, text2)),
  );
})();
