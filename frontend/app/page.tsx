import { Suspense } from "react"
import { DataTable } from "@/components/DataTable"

function DataTableWrapper() {
  return <DataTable />
}

export default function Home() {
  return (
    <Suspense fallback={<div className="container mx-auto p-6">Loading...</div>}>
      <DataTableWrapper />
    </Suspense>
  )
}


