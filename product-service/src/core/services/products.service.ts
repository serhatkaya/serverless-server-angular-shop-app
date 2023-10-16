import { BaseService } from "src/core/services/base.service";
import { Product } from "src/core/types/product.i";
import { PRODUCT_TABLE_NAME } from "../util/globals";

export class ProductService extends BaseService<Product> {
  protected override tableName = PRODUCT_TABLE_NAME;
}
