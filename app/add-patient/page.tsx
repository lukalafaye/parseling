import { AddPatientForm } from "@/components/add-patient-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function Home() {
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
      <div className="pt-0 pb-48">
        <AddPatientForm />
      </div>
    </main>
  );
}
