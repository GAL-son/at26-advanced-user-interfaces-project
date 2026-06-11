// src/app/(pages)/test/page.tsx

"use client";
import React from 'react';
import ListWrapper from '@/app/_components/Events/ListItem'
import ResultListItem, { RaceResultExtended } from '@/app/(pages)/events/[id]/ResultListItem';

export default function TestPage() {
  const dummyData: RaceResultExtended[] = [
    {
      pos: 1,
      name: "John Doe",
      combo: 2,
      eloAfter: 1500,
      eloChange: 50,
      car: "Ferrari F8",
      laps: 45,
      totalTime: 600000, // 10 min
      gap: "-",
    },
    {
      pos: 2,
      name: "Jane Smith",
      combo: 1,
      eloAfter: 1450,
      eloChange: -30,
      car: "Audi R8",
      laps: 45,
      totalTime: 620000, // 10 min 20 sec
      gap: "1.000",
    },
    {
      pos: 3,
      name: "Alice Johnson",
      combo: 0,
      eloAfter: 1400,
      eloChange: -20,
      car: "Mercedes C63",
      laps: 45,
      totalTime: 640000, // 10 min 40 sec
      gap: "2.000",
    },
  ];

  return (
    <div className="p-8 bg-brand-navy-dark">
      <h1 className="text-3xl font-bold text-white mb-6">Test List Items</h1>
      <ul role="list" className="space-y-4">
        {dummyData.map((result, index) => (
          <ListWrapper key={index}>
            <ResultListItem row={result} />
          </ListWrapper>
        ))}
      </ul>
    </div>
  );
}