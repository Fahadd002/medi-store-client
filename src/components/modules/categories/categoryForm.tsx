"use client";

import React, { useState, useRef } from "react";
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
import { createCategory } from "@/actions/category.action";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().default(""),
});

interface CategoryFormProps {
  onSuccess?: () => void;
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // stable ref guard to avoid stale-closure double-submits inside useForm's onSubmit
  const submissionLock = useRef(false);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    onSubmit: async ({ value }) => {
      // guard using ref (stable across renders / preserved in closure)
      if (submissionLock.current) return;
      submissionLock.current = true;
      setIsSubmitting(true);

      const validationResult = formSchema.safeParse(value);
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast.error(firstError?.message || "Validation failed");
        submissionLock.current = false;
        setIsSubmitting(false);
        return;
      }

      const toastId = toast.loading("Creating category...");
      try {
        const { data, error } = await createCategory(value);

        if (error) {
          toast.error(error.message, { id: toastId });
          return;
        }

        toast.success("Category created successfully!", { id: toastId });
        onSuccess?.();
      } catch (err) {
        toast.error("Something went wrong, please try again.", { id: toastId });
      } finally {
        submissionLock.current = false;
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        <form
          id="create-category-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // pass the native event into the form handler to avoid double-invocation
            form.handleSubmit(e as unknown as Event);
          }}
        >
          <FieldGroup>
            {/* Name Field */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => !value || value.trim().length < 2  ? "Name must be at least 2 characters" : undefined,
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
                      placeholder="Enter category name"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={`${
                        isInvalid
                          ? "border-red-500 focus:ring-red-500"
                          : "border-green-300 focus:ring-green-500 focus:border-green-500"
                      }`}
                    />
                    {isInvalid && (
                      <FieldError className="text-red-600">
                        {field.state.meta.errors[0]}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            {/* Description Field */}
            <form.Field
              name="description"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return undefined;
                  if (value.trim().length > 500) {
                    return "Description must not exceed 500 characters";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => {
                const isInvalid = field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name} className="text-green-700">
                      Description
                    </FieldLabel>
                    <Textarea
                      id={field.name}
                      placeholder="Enter category description (optional)"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={`${
                        isInvalid
                          ? "border-red-500 focus:ring-red-500"
                          : "border-green-300 focus:ring-green-500 focus:border-green-500"
                      }`}
                    />
                    {isInvalid && (
                      <FieldError className="text-red-600">
                        {field.state.meta.errors[0]}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <CardFooter className="mt-6 flex justify-end gap-3 px-0">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
