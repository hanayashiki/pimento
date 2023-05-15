import { Storage } from "@/lib/server/Storage";
import { UserService } from "@/lib/server/UserService";

(async () => {
  await new Storage().flushAll();

  const userService = new UserService();

  await userService.createUser({
    email: "orangehead.p@gmail.com",
    inputPassword: "Monomono123,",
  });
})();
