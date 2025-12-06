'use client';

import { Bot, MapPin, ShieldCheck, Star, MessageCircleIcon, PartyPopper, Radar } from "lucide-react";
import {motion} from "framer-motion";
import { themeColors } from "@/constants/theme";
import { SinhalaIcon } from "./SinhalaIcon";

const Features = () => {
    const features = [
        {
            icon: <Bot className="w-8 h-8 text-accent transition-colors duration-300"/>,
            title: "AI Bot",
            desc: "Smart assistance tailored to your specific needs anytime."
        },
        {
            icon: <MapPin className="w-8 h-8 text-accent transition-colors duration-300" />,
            title: "Geo Location",
            desc: "Real-time tracking to find services near you instantly."
        },
        {
            icon: <ShieldCheck className="w-8 h-8 text-navy transition-colors duration-300" />,
            title: "Verified Providers",
            desc: "100% vetted professionals for your peace of mind."
        },
        {
            icon: <Star className="w-8 h-8 text-orange transition-colors duration-300" />,
            title: "Rating System",
            desc: "Community-driven reviews to ensure top quality."
        },
        {
            icon: <MessageCircleIcon className="w-8 h-8 text-orange transition-colors duration-300" />,
            title: "Direct Chat",
            desc: "Discuss job details with providers before you book."
        },
        {
            icon: <SinhalaIcon className="w-8 h-8 text-orange transition-colors duration-300" />,
            title: "Fully Sinhala Version",
            desc: "Switch the entire app interface to Sinhala with one seamless tap."
        },
        {
            icon: <PartyPopper className="w-8 h-8 text-orange transition-colors duration-300" />,
            title: "Event Planner",
            desc: "Plan all your events with our specialist providers in one go!"
        },
        {
            icon: <Radar className="w-8 h-8 text-orange transition-colors duration-300" />,
            title: "Live Arrival",
            desc: "Watch your provider's location on the map in real-time as they head to your doorstep."
        },
    ];

    return (
        <section id="features" className="bg-[#F5EFED] pt-6 pb-1">
            <div className="w-full max-w-6xl mx-auto mt-6 mb-12 ">
                <div className="text-center mb-10 ">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#0C2B4E] w-full text-center md:text-center mx-auto ">
                        What We Offer
                    </h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group bg-orange/20 rounded-[32px] p-8 shadow-sm border border-transparent hover:border-orange/20 flex flex-col items-center text-center gap-6 cursor-default transition-all duration-300 relative overflow-hidden`}
                            style={{boxShadow: `-5px 5px 15px -10px ${themeColors.navy}`, backgroundColor: `${themeColors.offwhite}`}}
                        >
                         {/*Hover Gradient Background Effect */}
                            <div className="absolute inset-0 bg-[#D96C06] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out border-3 border-black"></div>
                            <div className="relative z-10 flex flex-col items-center text-center gap-6 transition-colors duration-300">
                                <div className="p-5 bg-[#F5EFED] rounded-xl group-hover:bg-white/20 group-hover:text-white text-[#19579F] transition-all duration-300 shadow-inner group-hover:shadow-none group-hover:scale-110 group-hover:rotate-6">
                                    {item.icon}
                                </div>
                                <div className="space-y-3">
                                    <h3 className="font-bold text-xl text-[#0C2B4E] group-hover:text-white transition-colors duration-300">{item.title}</h3>
                                    <p className="text-sm text-[#0C2B4E]/100 group-hover:text-white/90 leading-relaxed transition-colors duration-300">{item.desc}</p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;