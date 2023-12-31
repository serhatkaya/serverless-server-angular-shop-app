import { handlerPath } from "@libs/handler-resolver";
import { RequestMethodsType } from "skcore";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: "products/create",
        cors: {
          origins: ["*"],
          allowCredentials: true,
          methods: ["POST", "OPTIONS"] as RequestMethodsType,
        },
      },
    },
  ],
};
