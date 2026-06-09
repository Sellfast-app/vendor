const FOOD_BUSINESS_TYPE = "restaurant/food service";

export const normalizeBusinessType = (businessType: unknown) =>
  typeof businessType === "string"
    ? businessType
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\s*\/\s*/g, "/")
        .toLowerCase()
    : "";

export const isFoodBusinessType = (businessType: unknown) =>
  normalizeBusinessType(businessType) === FOOD_BUSINESS_TYPE;
