import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { AIStream } from "ai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { db } from "@/drizzle/db";
import { cosineDistance, gt, sql } from "drizzle-orm";
import { docs } from "@/drizzle/schema";

export const runtime = "edge";

// Define the schema for a single chart data entry
const chartDataEntrySchema = z.object({
  month: z.string(),
  units: z.number(),
});

// Define the schema for an element that includes a comment and chart data
const elementSchema = z.object({
  comment: z.string(),
  chartData: z.array(chartDataEntrySchema), // Change to an array of chart data entries
});

// Define the schema for the list of elements
const elementsListSchema = z.array(elementSchema);

// Define the main schema which includes a main comment and the list of elements
export const mainSchemaChartGen = z.object({
  mainComment: z.string(),
  elements: elementsListSchema,
});


export async function POST(req: Request) {

    const { prompt }: { prompt: string } = await req.json();

    console.log(prompt)


    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
  async function getEmbedding(text: string): Promise<number[] | null> {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002', // You can use 'text-embedding-ada-002' or your desired model
        input: text,
      });
  
      return response.data[0].embedding;

  }

    const similarityThreshold = 0.1;

    const similarityDocs = sql`1 - (${cosineDistance(docs.embedding, await getEmbedding(prompt))})`;



    const similarDocs = await db
    .select({ contents: docs.content })
    .from(docs)
    .where(gt(similarityDocs, similarityThreshold))
    .limit(3);

  const messages: ChatCompletionMessageParam[] = [] ;
  messages.unshift(
    {
      role: "system",
      content: `You generate graphs based on provided data or what the user asks of you. Generate a maximum of 3 graphs.
      Make sure you use a lot of markdown and emojis when writing comments. Include what units you're using in the comments that correspond to each graph, eg "kg" or "hours".`,
    },
  );

  messages.push(
    {
      role: "user",
      content: `${similarDocs.map((i) => {return "Some document containing data: " + i.contents + "\n\n\n\n\n"})} + ${prompt}`
    }
  );


  console.log(messages)



  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    // stream: true,
    messages,
    response_format: zodResponseFormat(mainSchemaChartGen, "chartList"),
  });
  // const stream = OpenAIStream(response);
  // return new StreamingTextResponse(stream);

  const parsedResponse = JSON.stringify(completion.choices[0].message.parsed);

  return new Response(parsedResponse)
}
