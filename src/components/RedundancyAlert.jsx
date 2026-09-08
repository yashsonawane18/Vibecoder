import React from 'react';
import Link from 'next/link';

export default function RedundancyAlert({ duplicates }) {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md mt-2">
      <div className="flex items-start">
        <div className="flex-shrink-0 text-amber-500 mr-3 text-lg">
          ⚠️
        </div>
        <div>
          <h3 className="text-sm font-medium text-amber-800">
            Similar questions already exist:
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <ul className="list-disc pl-5 space-y-1">
              {duplicates.map(dup => (
                <li key={dup.id}>
                  <Link href={`/question/${dup.id}`} className="font-medium underline hover:text-amber-900">
                    {dup.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-xs text-amber-600 font-medium">
            View existing answers instead of posting a duplicate
          </p>
        </div>
      </div>
    </div>
  );
}
