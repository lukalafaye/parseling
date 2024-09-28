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
import { newConsultationAction } from "@/app/_actions/new-consultation";

const formSchema = z.object({
  notes: z.string().min(2),
  patientId: z.string()
});

export function NewConsultationForm(props: {pid: string}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
      patientId: props.pid,
    },
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    console.log(values);

    await newConsultationAction(values);

    setIsSubmitting(false);
    toast({
      title: "Notes added",

    });
    form.reset();
  }

  return (
    <Card className="w-full max-w-full mx-auto">
      <CardHeader>
        <CardTitle>Add Notes</CardTitle>
        <CardDescription>
          Enter the details of the new consultation below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                    rows={14}
                      placeholder="Enter any additional information about the patient here."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Notes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
