"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateCategory } from "@/actions/category.action";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().default(""),
});

interface EditCategoryFormProps {
  category: {
    id: string;
    name: string;
    description: string | null;
  };
  onSuccess?: () => void;
}

export function EditCategoryForm({ category, onSuccess }: EditCategoryFormProps) {
  const form = useForm({
    defaultValues: {
      name: category.name,
      description: category.description || "",
    },
    onSubmit: async ({ value }) => {
      // Validate with Zod before submitting
      const validationResult = formSchema.safeParse(value);
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast.error(firstError?.message || "Validation failed");
        return;
      }

      const toastId = toast.loading("Updating category...");
      try {
        // Call your update API here
        const { data, error } = await updateCategory(category.id, value);
        
        if (error) {
          toast.error(error.message, { id: toastId });
          return;
        }

        toast.success("Category updated successfully!", { id: toastId });
        onSuccess?.();
      } catch (err) {
        toast.error("Something went wrong, please try again.", { id: toastId });
      }
    },
  });

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <form
          id="edit-category-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            {/* Name Field */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => 
                  !value || value.trim().length < 2 
                    ? "Name must be at least 2 characters" 
                    : undefined,
              }}
            >
              {(field) => {
                const isInvalid = field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name} className="text-green-700">
                      Category Name *
                    </FieldLabel>
                    <Input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border-green-300 focus:ring-green-500 focus:border-green-500"
                    />
                    {isInvalid && (
                      <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            {/* Description Field */}
            <form.Field
              name="description"
            >
              {(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name} className="text-green-700">
                      Description
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="min-h-[80px] border-green-300 focus:ring-green-500 focus:border-green-500"
                    />
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => onSuccess?.()}
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          Cancel
        </Button>
        <Button
          form="edit-category-form"
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}