import { generateUID } from "./uuid.util";

export const convertServiceResponseToRecord = (source: any) => ({
  data: source.data,
  success: source.success,
  message: source.message,
  error: source.error,
});

export function convertCsvProductToObject(csvData) {
  const propertyNames = ["title", "description", "price", "stock"];

  if (Object.keys(csvData || {}).length !== propertyNames.length) {
    throw new Error("Csv object has missing properties.");
  }
  const newObj = {};
  propertyNames.forEach((propertyName, index) => {
    newObj[propertyName] = csvData[index];
  });

  newObj["id"] = generateUID();
  return newObj;
}
