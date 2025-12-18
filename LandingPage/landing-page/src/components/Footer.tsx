import { Instagram, Linkedin, Twitter, Facebook} from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-[#0C2B4E] text-[#F5EFED] pt-16 flex flex-col">
            <div className="w-full px-6 pb-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
                    <div className="space-y-6">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            {/* Updated Logo Section */}
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                                <img src="/logo.png" alt="Provider+ Logo" className="w-full h-full object-contain p-1" />
                            </div>
                            Provider+
                        </h3>
                        <p className="text-xs leading-relaxed opacity-80 max-w-xs">Connecting you with the best services near you. Reliable, fast, and secure.</p>
                        <div className="flex gap-5 pt-2">
                            <a href="/under-construction" className="hover:text-[#D96C06] transition"><Instagram className="w-5 h-5" /></a>
                            <a href="/under-construction" className="hover:text-[#D96C06] transition"><Linkedin className="w-5 h-5" /></a>
                            <a href="/under-construction" className="hover:text-[#D96C06] transition"><Twitter className="w-5 h-5" /></a>
                            <a href="/under-construction" className="hover:text-[#D96C06] transition"><Facebook className="w-5 h-5" /></a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6">Explore</h4>
                        <ul className="space-y-3 opacity-80">
                            <li><a href="#home" className="hover:text-white transition">Home</a></li>
                            <li><a href="#features" className="hover:text-white transition">Services</a></li>
                            <li><a href="/under-construction#" className="hover:text-white transition">About Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6">Resources</h4>
                        <ul className="space-y-3 opacity-80">
                            <li><a href="/under-construction" className="hover:text-white transition">FAQ</a></li>
                            <li><a href="/under-construction" className="hover:text-white transition">Blog</a></li>
                            <li><a href="/under-construction" className="hover:text-white transition">Support</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6">Legal</h4>
                        <ul className="space-y-3 opacity-80">
                            <li><a href="/under-construction" className="hover:text-white transition">Privacy Policy</a></li>
                            <li><a href="/under-construction" className="hover:text-white transition">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="w-full bg-black py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 gap-4">
                    <span>© 2025 Provider+ Inc. All rights reserved.</span>
                    <div className="flex gap-6">
                        <a href="/under-construction" className="hover:text-white transition">Privacy</a>
                        <a href="/under-construction" className="hover:text-white transition">Terms</a>
                        <a href="/under-construction" className="hover:text-white transition">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
export default Footer;