import React from "react";
import { Twitter, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black text-slate-100 py-4 px-6 border-t border-slate-800">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Project Name */}
          <div className="order-1 sm:order-none">
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              BountyQuest
            </span>
          </div>

          {/* Social Links */}
          <div className="order-3 sm:order-none flex items-center justify-center space-x-8">
            <a
              href="#"
              className="group flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50 hover:bg-blue-500/10 transition-all duration-300"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
            </a>
            <a
              href="#"
              className="group flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50 hover:bg-blue-600/10 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </a>
            <a
              href="#"
              className="group flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50 hover:bg-red-500/10 transition-all duration-300"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
            </a>
          </div>

          {/* Links */}
          <div className="order-2 sm:order-none flex items-center space-x-6 text-xs font-medium">
            <span className="text-slate-400">© {currentYear}</span>
            <a
              href="#"
              className="text-slate-400 hover:text-slate-100 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-blue-400 after:transition-all hover:after:w-full"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-slate-100 transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-blue-400 after:transition-all hover:after:w-full"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
