import { db } from "@/drizzle/db";
import { patients } from "@/drizzle/schema";
import { sql } from "drizzle-orm";
import { ChevronDown, CirclePlus } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const patientsRes = await db
    .select({
      id: patients.id,
      firstName: patients.firstName,
      lastName: patients.lastName,
      description: patients.description,
    })
    .from(patients)
    .groupBy(patients.id)
    .orderBy(sql`${patients.updatedAt} desc`);

  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-50">
      <div className="max-w-[1300px] flex w-full flex-row items-center justify-between py-8 px-36">
        <Link href={"/"} className="font-mono text-xl font-semibold">
          Parseling
        </Link>
        <Link
          className="bg-foreground text-background px-4 py-2 font-medium rounded-full
        bg-gradient-to-br from-sky-200 to-teal-500 w-[32px] h-[32px]"
          href={"/"}
        ></Link>
      </div>
      <div className="w-full max-w-[1300px] py-0 px-36">
        <div className="w-full h-[1px] bg-foreground opacity-10"></div>
      </div>
      <div className="max-w-[1300px] flex w-full flex-row items-center justify-between py-8 px-36">
        <Link
          className="bg-background text-foreground px-4 py-2 rounded-lg font-medium font-mono flex flex-row items-center gap-2 border border-neutral-200"
          href={"/"}
        >
          Sort
          <ChevronDown size={20} />
        </Link>
        <Link
          className="bg-foreground text-background px-4 py-2 rounded-lg font-medium font-mono flex flex-row items-center gap-2 hover:bg-neutral-600 transition-all ease-in-out hover:shadow-md"
          href={"/add-patient"}
        >
          <CirclePlus size={20} />
          Add Patient
        </Link>
      </div>
      <div className="grid max-w-[1300px] grid-cols-1 items-center gap-3 px-4 pb-32 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {patientsRes.map((patient) => {
          return (
            <Link
              key={patient.id}
              href={`/patient/${patient.id}`}
              className="no-scrollbar flex h-[260px] w-[190px] flex-col gap-1 overflow-hidden overflow-y-scroll rounded-xl border border-neutral-200 bg-white text-neutral-800 shadow-md transition-all duration-300 ease-in-out hover:z-50 hover:border-neutral-300 hover:shadow-2xl"
            >
              <div className="bg-neutral-200 rounded-lg min-h-[194px] mx-4 mt-4"></div>
              <p className="max-w-full self-center break-words px-4 pt-2 pb-3 text-md w-full font-medium font-mono">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="max-w-full self-center break-words px-4 pt-2 pb-3 text-[12px] w-full font-medium">
                {patient.description}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
