'use client';

import { useState } from "react";
import { Star, MapPin, User, BadgeCheck } from "lucide-react";


// temporary dummy data for demonstration
const providers = [
    { id: 1, name: "Saman Perera", district: "Colombo", category: "Electrician", rating: 4.9, reviews: 124, summary: "Expert in home wiring and panel upgrades. 10+ years experience." },
    { id: 2, name: "Ravi Kumar", district: "Jaffna", category: "Plumber", rating: 4.8, reviews: 89, summary: "Reliable plumbing solutions for residential and commercial needs." },
    { id: 3, name: "Nimali Silva", district: "Kandy", category: "Home Cleaner", rating: 5.0, reviews: 56, summary: "Deep cleaning services with eco-friendly products." },
    { id: 4, name: "Fahim Ahmed", district: "Galle", category: "Carpenter", rating: 4.7, reviews: 210, summary: "Custom furniture repair and antique restoration specialist." },
    { id: 5, name: "Chathura D.", district: "Gampaha", category: "Electrician", rating: 4.9, reviews: 102, summary: "Fast and affordable AC servicing and maintenance." }
];

const TopProviders = () => {
    const [isPaused, setIsPaused] = useState(false);
    const loopedProviders = [...providers, ...providers];

    return (
        <section className="w-full overflow-hidden bg-gray-200 pt-9 pb-13">
            <div className="text-center mb-10 ">
                <h1 className="text-4xl md:text-5xl font-bold text-[#0C2B4E] w-full text-center md:text-center mx-auto mb-3">
                    Our Top Providers
                </h1>
                <p className="text-[#0C2B4E]/100 text-s">Best service professionals from across the island.</p>
                <p className="text-[#D96C06] text-sm font-bold uppercase tracking-widest mt-4 animate-pulse">
                    {isPaused ? "Paused" : "Tap to Pause Reel"}
                </p>
            </div>

            <div
                className="relative w-full cursor-pointer group"
                onClick={() => setIsPaused(!isPaused)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsPaused(!isPaused);
                    }
                }}
                role="button"
                tabIndex={0}
                aria-label={isPaused ? "Resume provider reel" : "Pause provider reel"}
            >
                <div className="absolute top-0 left-0 h-full w-12 md:w-32 bg-gradient-to-r from-[#F5EFED] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 h-full w-12 md:w-32 bg-gradient-to-l from-[#F5EFED] to-transparent z-10 pointer-events-none"></div>

                <div
                    className="flex gap-8 w-max px-4"
                    style={{
                        animation: "scroll 40s linear infinite",
                        animationPlayState: isPaused ? "paused" : "running",
                    }}
                >
                    {loopedProviders.map((provider, index) => (
                        <div key={`${provider.id}-${index}`} className="w-72 bg-white rounded-3xl p-6 shadow-sm border border-[#0C2B4E]/5 hover:border-[#D96C06]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center select-none">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border-4 border-[#F5EFED] shadow-sm mb-4 relative">
                                <User className="w-10 h-10 text-gray-400" />
                             </div>
                            <div className="flex justify-center gap-1 mb-1">
                                <h4 className="text-[#0C2B4E] font-bold text-lg mb-1">{provider.name}</h4>
                                <BadgeCheck style={{marginTop: '5px'}} className="w-5 h-5 fill-[#2B7FDE] text-white mt-2"/>
                            </div>
                            <div className="flex items-center gap-1 bg-[#F5EFED] px-3 py-1 rounded-full mb-2">
                                <Star className="w-3.5 h-3.5 text-[#D96C06] fill-[#D96C06]" />
                                <span className="text-xs font-bold text-[#0C2B4E]">{provider.rating}</span>
                                <span className="text-[10px] text-[#0C2B4E]/90">({provider.reviews})</span>
                            </div>
                            <div className="w-full h-px bg-[#0C2B4E]/5 mb-2"></div>
                            <div className="space-y-1 mb-4">
                                <span className="block text-xs font-bold text-[#19579F] uppercase tracking-wide">{provider.category}</span>
                                <div className="flex items-center justify-center gap-1 text-[#0C2B4E]/100 text-xs"><MapPin className="w-3 h-3" /><span>{provider.district}</span></div>
                            </div>
                            <p className="text-sm text-[#0C2B4E]/90 leading-relaxed line-clamp-3">&#34;{provider.summary}&#34;</p>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </section>
    );
};

export default TopProviders;