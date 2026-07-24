"use client";

import DriversListView from "@/features/drivers/views/DriversListView"

export default function Page() {
  return (<DriversListView initialHasMore={true} initialDrivers={[]}/>)
}