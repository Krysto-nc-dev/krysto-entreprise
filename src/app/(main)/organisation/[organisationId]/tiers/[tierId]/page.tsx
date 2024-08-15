import { ArrowBigLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import React from 'react';

const Page = ({ params }: { params: { organisationId: string } }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-lg font-semibold">tiers details</h1>
      <Link href={`/organisation/${params.organisationId}/tiers`}>
        <Button size="sm" className="text-sm">
          <ArrowBigLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </Link>
    </div>
  );
}


export default Page;
