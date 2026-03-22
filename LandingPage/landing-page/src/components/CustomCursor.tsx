'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let mx = 0, my = 0;
        let lagX = 0, lagY = 0;
        let animId: number;

        const onMove = (e: MouseEvent) => {
            mx = e.clientX;
            my = e.clientY;
            if (innerRef.current) {
                innerRef.current.style.left = mx + 'px';
                innerRef.current.style.top  = my + 'px';
            }
        };

        const loop = () => {
            lagX += (mx - lagX) * 0.10;
            lagY += (my - lagY) * 0.10;
            if (outerRef.current) {
                outerRef.current.style.left = lagX + 'px';
                outerRef.current.style.top  = lagY + 'px';
            }
            animId = requestAnimationFrame(loop);
        };

        document.addEventListener('mousemove', onMove);
        animId = requestAnimationFrame(loop);

        return () => {
            document.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <>
            {/* Outer lagging circle */}
            <div ref={outerRef} style={{
                position:      'fixed',
                width:         '36px',
                height:        '36px',
                border:        '2px solid rgba(255, 140, 0, 0.85)',
                borderRadius:  '50%',
                pointerEvents: 'none',
                transform:     'translate(-50%, -50%)',
                zIndex:        9998,
                boxShadow:     '0 0 10px rgba(255,140,0,0.4), inset 0 0 8px rgba(255,140,0,0.1)',
            }} />
            {/* Inner solid dot */}
            <div ref={innerRef} style={{
                position:      'fixed',
                width:         '10px',
                height:        '10px',
                background:    '#FF8C00',
                borderRadius:  '50%',
                pointerEvents: 'none',
                transform:     'translate(-50%, -50%)',
                zIndex:        9999,
                boxShadow:     '0 0 8px rgba(255,140,0,0.9)',
            }} />
        </>
    );
}