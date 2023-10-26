import { handlerPath } from "@libs/handler-resolver";
import { RequestMethodsType } from "skcore";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "import",
        cors: {
          origins: ["*"],
          allowCredentials: true,
          methods: ["GET", "OPTIONS"] as RequestMethodsType,
        },
      },
    },
  ],
};
