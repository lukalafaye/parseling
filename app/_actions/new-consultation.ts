// app/actions/patientActions.ts

'use server';

import { db } from '@/drizzle/db';
import { patients, docs } from '@/drizzle/schema';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import OpenAI from "openai";


// Define schema for form validation
const formSchema = z.object({
  notes: z.string().min(2),
  patientId: z.string()
});

// Function to insert patient into the database
export async function newConsultationAction(data: z.infer<typeof formSchema>) {
  const { notes, patientId } = formSchema.parse(data);

  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async function getEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002', // You can use 'text-embedding-ada-002' or your desired model
        input: text,
      });
  
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return null; // Handle the error and return null if there's an issue
    }
  }



  console.log(JSON.stringify(data))

  // Insert documents (if any)
  await db.insert(docs).values({
    id: nanoid(),
    content: notes,
    patientId: patientId, // Link to the patient
    embedding: await getEmbedding(notes),
    createdAt: new Date(),
  });

  // Revalidate the cache if needed for updated patients list
  revalidatePath('/');

  return "yay!";
}
