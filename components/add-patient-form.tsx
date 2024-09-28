"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import pdfToText from "react-pdftotext";
import { addPatientAction } from "@/app/_actions/add-patient";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  files: z.array(z.string()).optional(),
});

export function AddPatientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileTexts, setFileTexts] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      description: "",
      files: [],
    },
  });

  async function handleFileChange(files: FileList | null) {
    if (!files) return;
    const texts = await Promise.all(
      Array.from(files).map((file) => {
        if (file.type === "application/pdf") {
          return pdfToText(file)
            .then((text) => text as string)
            .catch(() => "");
        } else {
          return file.text();
        }
      }),
    );
    setFileTexts(texts);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const dataToSubmit = {
      ...values,
      files: fileTexts,
    };
    console.log(JSON.stringify(dataToSubmit));

    await addPatientAction(dataToSubmit);

    setIsSubmitting(false);
    toast({
      title: "Patient added",
      description:
        "The new patient has been successfully added, along with the processed text files.",
    });
    form.reset();
    setFileTexts([]);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Patient</CardTitle>
        <CardDescription>
          Enter the details of the new patient below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional information about the patient here."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="files"
              render={({ field: {} }) => (
                <FormItem>
                  <FormLabel>Upload Files</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      accept=".txt, .pdf"
                      onChange={(e) => handleFileChange(e.target.files)}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload any relevant files for the patient (e.g., medical
                    records, test results).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Patient"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
