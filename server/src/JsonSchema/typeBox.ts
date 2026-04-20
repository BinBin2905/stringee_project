import { type Static, Type } from "typebox";

export const User = Type.Object({
  name: Type.String(),
  mail: Type.String({ format: "email" }),
});

export type UserType = Static<typeof User>;
