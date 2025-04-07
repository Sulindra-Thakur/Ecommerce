import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

function CommonForm({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText,
  isBtnDisabled,
  isSubmitting
}) {
  function renderInputsByComponentType(getControlItem) {
    let element = null;
    const controlKey = getControlItem.name || getControlItem.id;
    const value = formData[controlKey] || "";

    switch (getControlItem.componentType || getControlItem.component) {
      case "input":
        element = (
          <Input
            name={controlKey}
            placeholder={getControlItem.placeholder}
            id={controlKey}
            type={getControlItem.type || "text"}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [controlKey]: event.target.value,
              })
            }
            disabled={getControlItem.disabled || false}
          />
        );
        break;
      case "select":
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                [controlKey]: value,
              })
            }
            value={value}
            disabled={getControlItem.disabled || false}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getControlItem.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options?.map((optionItem) => (
                <SelectItem 
                  key={optionItem.value} 
                  value={optionItem.value}
                >
                  {optionItem.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        break;
      case "textarea":
        element = (
          <Textarea
            name={controlKey}
            placeholder={getControlItem.placeholder}
            id={controlKey}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [controlKey]: event.target.value,
              })
            }
            disabled={getControlItem.disabled || false}
          />
        );
        break;
      case "checkbox":
        element = (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={controlKey}
              checked={value} 
              onCheckedChange={(checked) => setFormData({
                ...formData,
                [controlKey]: checked,
              })} 
              disabled={getControlItem.disabled || false}
            />
            <label htmlFor={controlKey} className="text-sm text-muted-foreground">
              {getControlItem.description}
            </label>
          </div>
        );
        break;
      default:
        element = (
          <Input
            name={controlKey}
            placeholder={getControlItem.placeholder}
            id={controlKey}
            type="text"
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [controlKey]: event.target.value,
              })
            }
            disabled={getControlItem.disabled || false}
          />
        );
        break;
    }

    return element;
  }

  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
      {formControls.map((item) => (
        <div key={item.id || item.name} className="w-full">
          <Label className="mb-1 block">{item.label}</Label>
          {renderInputsByComponentType(item)}
        </div>
      ))}
      <div className="mt-4">
        <Button
          type="submit"
          disabled={isBtnDisabled || isSubmitting}
          className="w-full bg-black text-white py-6 rounded-md font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Processing...
            </>
          ) : (
            buttonText || "Submit"
          )}
        </Button>
      </div>
    </form>
  );
}

export default CommonForm;