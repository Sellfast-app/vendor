import FoodTaxonomyManager from "@/components/food-taxonomy-manager";
import { BusinessTypeGuard } from "@/components/business-type-guard";

export default function Page() {
  return <BusinessTypeGuard allow={["food"]} redirectTo="/dashboard"><FoodTaxonomyManager kind="categories" /></BusinessTypeGuard>;
}
