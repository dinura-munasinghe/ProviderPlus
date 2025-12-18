'use client';

import Link from "next/link";
import { Construction, ArrowLeft, Hammer } from "lucide-react";
import { motion } from "framer-motion";

export default function UnderConstruction() {
    return (
        <main className="min-h-screen bg-[#F5EFED] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2B7FDE]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D96C06]/5 rounded-full blur-3xl pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-[#0C2B4E]/5 relative overflow-hidden"
            >
                {/* Decorative Corner Shapes */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D96C06]/10 rounded-bl-[100%] -mr-4 -mt-4"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#19579F]/10 rounded-tr-[100%] -ml-4 -mb-4"></div>

                <div className="relative z-10 flex flex-col items-center">

                    {/* Animated Icon Container */}
                    <div className="relative mb-8">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 1 }}
                            className="w-24 h-24 bg-[#F5EFED] rounded-full flex items-center justify-center border-4 border-white shadow-inner"
                        >
                            <Construction className="w-10 h-10 text-[#D96C06]" />
                        </motion.div>
                        {/* Floating Tool Icon */}
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="absolute -top-2 -right-2 bg-[#0C2B4E] p-2 rounded-full border-2 border-white shadow-md"
                        >
                            <Hammer className="w-4 h-4 text-white" />
                        </motion.div>
                    </div>

                    <h1 className="text-3xl font-bold text-[#0C2B4E] mb-3">Under Construction</h1>
                    <p className="text-[#0C2B4E]/60 text-sm mb-8 leading-relaxed px-4">
                        We're currently building this feature to give you the best experience. Please check back soon!
                    </p>

                    <Link
                        href="/"
                        className="group flex items-center gap-2 bg-[#0C2B4E] text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-[#19579F] transition-all shadow-lg hover:-translate-y-1"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>
            </motion.div>

            {/* Brand Footer */}
            <div className="mt-12 flex flex-col items-center gap-2 opacity-40">
                <div className="h-1 w-12 bg-[#0C2B4E] rounded-full"></div>
                <p className="text-xs text-[#0C2B4E] font-bold uppercase tracking-[0.2em]">
                    Provider+
                </p>
            </div>
        </main>
    );
}