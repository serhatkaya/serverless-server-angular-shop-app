import { Stock } from "../types";
import { STOCK_TABLE_NAME } from "../util/globals";
import { BaseService } from "./base.service";

export class StocksService extends BaseService<Stock> {
  constructor(tableName = STOCK_TABLE_NAME, db, client) {
    super(tableName, db, client);
  }
}
