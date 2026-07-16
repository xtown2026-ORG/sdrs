import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import logoImg from '../../assets/profile.png';

const FacebookIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-black/5 pt-16 pb-8 text-gray-600">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-16 h-16 overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <img src={logoImg} alt="SDRS Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold tracking-tight text-brand-text leading-none">
                  SDRS <span className="text-brand-red">GOLD</span>
                </span>
                <span className="text-[12px] uppercase tracking-[0.2em] text-brand-red font-bold font-body">Finance</span>
              </div>
            </Link>
            <p className="text-sm font-body leading-relaxed mb-6">
              Empowering dreams with instant value. SDRS Gold Finance is Coimbatore's leading premium gold buyer and financier, offering trust and transparency. A trusted and government-registered gold finance company.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/18drULc6sp/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition-all duration-300">
                <FacebookIcon size={18} />
              </a>
              <a href="https://www.instagram.com/goldsdrs?igsh=MTg1ZmtlOWtmbmxyeA==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition-all duration-300">
                <InstagramIcon size={18} />
              </a>
              <a href="mailto:sdrsgoldfinance@gmail.com" className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-brand-red hover:text-white transition-all duration-300">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-brand-text font-bold mb-6 font-heading">Quick Links</h4>
            <ul className="space-y-4 text-sm font-body">
              <li><Link to="/" className="hover:text-brand-red transition-colors">Home</Link></li>
              <li><Link to="/services" className="hover:text-brand-red transition-colors">Our Services</Link></li>
              <li><Link to="/about" className="hover:text-brand-red transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-red transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-brand-text font-bold mb-6 font-heading">Our Services</h4>
            <ul className="space-y-4 text-sm font-body">
              <li><Link to="/services" className="hover:text-brand-red transition-colors">Cash for Gold</Link></li>
              <li><Link to="/services" className="hover:text-brand-red transition-colors">Cash for Silver</Link></li>
              <li><Link to="/services" className="hover:text-brand-red transition-colors">Cash for Diamond</Link></li>
              <li><Link to="/services" className="hover:text-brand-red transition-colors">Auction Gold / Pledging Gold Release</Link></li>
              <li><Link to="/services" className="hover:text-brand-red transition-colors">Gold Loan Takeover Speciality</Link></li>
              <li><Link to="/services" className="hover:text-brand-red transition-colors">Super Gold Loan (95% Value)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-brand-text font-bold mb-6 font-heading">Operating Hours</h4>
            <ul className="space-y-4 text-sm font-body">
              <li className="flex justify-between"><span>Mon - Sat:</span> <span className="text-brand-text font-medium">10:00 AM - 6:30 PM</span></li>
              
              <li className="mt-8 pt-6 border-t border-black/5">
                <p className="text-xs italic leading-relaxed">
                  *Market rates are updated live daily based on international gold index.
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-black/5 gap-4">
          <p className="text-xs font-body text-gray-600">
            © 2026 SDRS Gold Finance. All Rights Reserved.
          </p>
          <button 
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-all duration-300 text-gray-600"
          >
            <ArrowUp size={20} />
          </button>
          <div className="flex gap-6 text-xs font-body">
            <a href="#" className="hover:text-brand-red">Privacy Policy</a>
            <a href="#" className="hover:text-brand-red">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
