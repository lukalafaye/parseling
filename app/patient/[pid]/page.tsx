import { ChatBox } from "@/components/chatbox";
import { NewConsultationForm } from "@/components/new-consultation";
import { db } from "@/drizzle/db";
import { patients } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Thread({ params }: { params: { pid: string } }) {
  const patient = await db.query.patients.findFirst({

    where: eq(patients.id, params.pid),
    // with: {
    //   replies: {
    //     orderBy: [asc(replies.createdAt)],
    //   },
    // },
  });

  if (!patient) notFound();

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
          className="bg-background text-foreground px-4 py-2 rounded-lg font-medium font-mono flex flex-row items-center gap-2 border border-neutral-200 transition-all ease-in-out hover:shadow-md hover:text-neutral-700"
          href={"/"}
        >
          <ArrowLeft size={20} />
          Back
        </Link>
      </div>
      <div className="max-w-[1300px] flex w-full flex-row items-center justify-between py-8 px-36">
        <div className="flex flex-row justify-between gap-20">
          <div className="flex flex-col gap-6">
            <div className="h-[200px] w-[200px] bg-neutral-100 shadow-md rounded-2xl overflow-hidden">
              <Image alt="pfp" width={200} height={200} src={"/guy.jpg"}  />
            </div>
            <div><p className="font-mono text-2xl">{patient.firstName} {patient.lastName}</p></div>
          </div>
          <div className="flex flex-col w-full gap-4">
          <div className=" shadow-sm font-mono bg-white border-neutral-200 border rounded-2xl px-8 py-6 flex flex-row justify-between">
              <p className="text-lg">Patient Added: {patient.createdAt.toLocaleDateString()}</p>
              <p className="text-lg">Patient Updated: {patient.updatedAt.toLocaleDateString()}</p>
            </div>
            <div className=" shadow-sm bg-white border-neutral-200 border rounded-2xl px-8 py-6 w-full">
              <p className="text-lg">{patient.description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1300px] flex w-full flex-row items-center justify-between py-8 px-36">
      {/* <Link href={`/patient/${params.pid}/new-consultation`} className="
      text-white flex items-center justify-center  px-4 py-3 rounded-xl
      bg-blue-500 w-full text-lg font-mono hover:bg-blue-400 shadow-blue-400 shadow-sm hover:shadow-blue-300 transition-all">New Consultation</Link> */}

      <NewConsultationForm pid={params.pid}/>
      </div>
      <div className="w-full max-w-[1300px] py-0 px-36 mt-4 mb-4">
        <div className="w-full h-[1px] bg-foreground opacity-10"></div>
      </div>
      <div className="max-w-[1300px] flex w-full flex-row items-center justify-between py-8 px-36 pb-52">
        <ChatBox/>
        
      </div>
        
    </main>
  );
}
