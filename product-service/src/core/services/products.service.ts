import {
  BatchGetItemInput,
  BatchGetItemOutput,
} from "aws-sdk/clients/dynamodb";
import { BaseService } from "src/core/services/base.service";
import { ServiceResponse, Stock } from "src/core/types";
import { Product } from "src/core/types/product.i";
import {
  PRODUCT_TABLE_NAME,
  STOCK_TABLE_NAME,
  cloneObject,
} from "src/core/util/";
import { StocksService } from "./stocks.service";

export class ProductService extends BaseService<Product> {
  stocksService = new StocksService();
  constructor(tableName = PRODUCT_TABLE_NAME) {
    super(tableName);
  }

  getByIdWithStocks = (productId: string) =>
    new Promise<ServiceResponse<Product>>(async (resolve, _) => {
      const productResponse = await this.getById(productId);
      const stockParams: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: "stocks",
        FilterExpression: "#productId = :productId",
        ExpressionAttributeNames: {
          "#productId": "product_id",
        },
        ExpressionAttributeValues: {
          ":productId": productId,
        },
      };

      if (productResponse.success) {
        this.client.scan(stockParams, (stockErr, stockData) => {
          if (!stockErr && stockData.Items && Array.isArray(stockData.Items)) {
            const productWithStocks = {
              ...productResponse.data,
              stock: stockData.Items[0] as Stock,
            };
            resolve({
              success: true,
              data: productWithStocks,
              message: `Product and associated stock data acquired for product ID: ${productId}`,
            });
          } else {
            resolve({
              success: true,
              data: productResponse.data,
              message: `Product data acquired, but no stock data found for product ID: ${productId}`,
            });
          }
        });
      } else {
        resolve(productResponse);
      }
    });

  createWithStocks = (product: Product) =>
    new Promise<ServiceResponse<Product>>(async (resolve, _) => {
      if (!product.stock) {
        resolve({
          success: false,
          data: null,
          message: "Please provide valid stock data",
        });
      }

      const productResponse = await this.create(
        cloneObject(product, ["stock"])
      );

      if (productResponse.success) {
        const stocks = await this.stocksService.create({
          ...product.stock,
          product_id: productResponse.data.id,
        });
        if (stocks.success) {
          resolve({
            data: {
              ...productResponse.data,
              stock: stocks.data,
            },
            success: true,
            message: "Product created with stock",
          });
        } else {
          resolve({
            error: stocks.error,
            success: false,
            message: "Error while creating product with stocks",
            data: null,
          });
        }
      } else {
        resolve(productResponse);
      }
    });

  getAllWithStocks = () =>
    new Promise<ServiceResponse<Product[]>>(async (resolve, _) => {
      const productListResponse = await this.getAll();

      if (productListResponse.success) {
        const products: Product[] = productListResponse.data;
        const productIds = products.map((product) => product.id);

        const batchGetParams: BatchGetItemInput = {
          RequestItems: {
            [STOCK_TABLE_NAME]: {
              Keys: productIds.map((id) => ({
                product_id: {
                  S: id,
                },
              })),
            },
          },
        };

        this.db.batchGetItem(
          batchGetParams,
          (err: AWS.AWSError, data: BatchGetItemOutput) => {
            if (err) {
              resolve({
                success: false,
                data: [],
                message:
                  "Error while fetching products and associated stock data",
                error: err,
              });
            } else {
              const retrievedProducts = productListResponse.data;

              const retrievedStocks = data.Responses[
                STOCK_TABLE_NAME
              ] as AWS.DynamoDB.AttributeMap[];

              const productMap = new Map<string, Product>();
              retrievedProducts.forEach((product) =>
                productMap.set(product.id, product)
              );

              const productsWithStocks = retrievedStocks.map((stockMap) => {
                const stock = this.convertToObject<Stock>(stockMap);
                const product = productMap.get(stock.product_id);
                if (product) {
                  return {
                    ...product,
                    stock: stock,
                  };
                }
                return null;
              });

              resolve({
                success: true,
                data: productsWithStocks,
                message: "Products and associated stock data acquired",
              });
            }
          }
        );
      } else {
        resolve(productListResponse);
      }
    });
}
