import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

// Mapping of filter keys to display names
const filterCategoryNames = {
  category: "Categories",
  brand: "Brands",
  seasonal: "Seasonal Type",
  tags: "Tags",
  weatherDiscountEligible: "Special Offers"
};

function ProductFilter({ filters, handleFilter }) {
  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-extrabold">Filters</h2>
      </div>
      <div className="p-4 space-y-4">
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-base font-bold capitalize">
                {filterCategoryNames[keyItem] || keyItem}
              </h3>
              <div className="grid gap-2 mt-2">
                {filterOptions[keyItem].map((option) => (
                  <Label 
                    key={option.id}
                    className="flex font-medium items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                  >
                    <Checkbox
                      checked={
                        filters &&
                        Object.keys(filters).length > 0 &&
                        filters[keyItem] &&
                        filters[keyItem].indexOf(option.id) > -1
                      }
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </Label>
                ))}
              </div>
            </div>
            <Separator />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
