import React from 'react';

export const SinhalaIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
        >
        {/* NOTE: We use 'fill="currentColor"' and 'stroke="none"' for the text
         because text needs to be solid to be readable, unlike the outline icons.
      */}
        <text
    x="50%"
    y="60%"
    dominantBaseline="middle"
    textAnchor="middle"
    fontSize="14"
    fontWeight="bold"
    fill="currentColor"
    stroke="none"
    style={{ fontFamily: 'sans-serif' }}
>
            සිං
    </text>

    {/* Optional: Add a subtle circle around it if you want it to look like a button */}
    {/* <circle cx="12" cy="12" r="10" /> */}
    </svg>
);
};