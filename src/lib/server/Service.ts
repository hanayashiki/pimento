import { Storage } from "./Storage";

export class Service {
  storage = new Storage();

  static instances = new WeakMap();

  static get<S extends Service>(Service: { new (): S }): S {
    const cached = this.instances.get(Service);
    if (cached) {
      return cached;
    } else {
      return new Service();
    }
  }
}
