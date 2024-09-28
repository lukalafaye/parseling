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
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  description: z.string().optional(),
  files: z.array(z.string()).optional(),
});

// Function to insert patient into the database
export async function addPatientAction(data: z.infer<typeof formSchema>) {
  const { firstName, lastName, description, files } = formSchema.parse(data);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });


  console.log(JSON.stringify(data))

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

  // Create the patient in the 'patients' table
  const [newPatient] = await db
    .insert(patients)
    .values({
      firstName,
      lastName,
      description,
      id: nanoid(),
      // Embedding can be handled here if necessary
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Insert documents (if any)
  if (files && files.length > 0) {
    await Promise.all(
      files.map(async (fileContent) => {
        // Get embedding for the file content
        const embedding = await getEmbedding(fileContent);

        // Insert the document with embedding
        return db.insert(docs).values({
          id: nanoid(),
          content: fileContent,
          patientId: newPatient.id, // Link to the patient
          embedding, // Store the embedding
          createdAt: new Date(),
        });
      })
    );
  }

  // Revalidate the cache if needed for updated patients list
  revalidatePath('/');

  return newPatient;
}
