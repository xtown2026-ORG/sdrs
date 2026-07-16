import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, MessageSquare } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import logoImg from '../../assets/profile.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // Intersection Observer to track active section
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the upper part of viewport
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveHash(`#${entry.target.id}`);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = ['services', 'contact'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [location.pathname]);

  // Sync active hash with URL hash on location change
  useEffect(() => {
    setActiveHash(location.hash);
  }, [location.hash]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/#services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (e, path) => {
    if (path.startsWith('/#')) {
      e.preventDefault();
      const id = path.substring(2);
      const element = document.getElementById(id);

      if (location.pathname === '/') {
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          navigate(path, { replace: true });
        } else {
          // If at the top of home page
          window.scrollTo({ top: 0, behavior: 'smooth' });
          navigate('/', { replace: true });
        }
      } else {
        navigate(path);
      }
      setIsOpen(false);
    } else {
      // Normal route
      setIsOpen(false);
    }
  };

  const isLinkActive = (linkPath) => {
    // For about page or home route
    if (linkPath === '/') return location.pathname === '/' && !activeHash;
    if (linkPath.startsWith('/#')) {
      return location.pathname === '/' && activeHash === linkPath.substring(1);
    }
    // Handle Contact active state for both dedicated page and homepage section
    if (linkPath === '/contact') {
      return location.pathname === '/contact' || (location.pathname === '/' && activeHash === '#contact');
    }
    return location.pathname === linkPath;
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md py-2 shadow-lg' : 'bg-transparent py-4'
      }`}
    >
      {/* Scroll Progress Indicator (Optional highlight) */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-gold-gradient opacity-20 w-full" />

      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 md:w-16 md:h-16 overflow-hidden relative">
            <img 
              src={logoImg} 
              alt="SDRS Logo" 
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl md:text-3xl font-bold tracking-tight text-brand-text leading-none">
              SDRS <span className="text-brand-red">GOLD</span>
            </span>
            <span className="text-[12px] md:text-[14px] uppercase tracking-[0.3em] text-brand-red font-bold font-body">Finance</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              onClick={(e) => handleNavClick(e, link.path)}
              className={`font-body text-sm font-medium transition-colors hover:text-brand-red relative group ${
                isLinkActive(link.path) ? 'text-brand-red' : 'text-brand-text'
              }`}
            >
              {link.name}
              <motion.span 
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold"
                initial={false}
                animate={{ width: isLinkActive(link.path) ? '100%' : '0%' }}
                whileHover={{ width: '100%' }}
              />
            </Link>
          ))}
          <a href="tel:9843257757" className="btn-premium !py-2 !px-5 text-sm flex items-center gap-2">
            <Phone size={16} />
            <span>Speak to Expert: 9843257757</span>
          </a>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-4">
           <a href="tel:9843257757" className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center text-white border border-brand-gold/30">
              <Phone size={18} />
           </a>
           <button 
             className="text-brand-text p-1 hover:text-brand-red transition-colors"
             onClick={() => setIsOpen(!isOpen)}
           >
             {isOpen ? <X size={28} /> : <Menu size={28} />}
           </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-b border-black/5 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className={`font-heading text-xl font-semibold transition-colors hover:text-brand-red ${
                    isLinkActive(link.path) ? 'text-brand-red' : 'text-brand-text'
                  }`}
                  onClick={(e) => handleNavClick(e, link.path)}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/10" />
              <div className="flex flex-col gap-4">
                <a href="tel:9843257757" className="btn-premium flex items-center justify-center gap-2">
                  <Phone size={20} />
                  Call Now
                </a>
                <a href="https://wa.me/919843257757" className="btn-gold flex items-center justify-center gap-2">
                  <MessageSquare size={20} />
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
