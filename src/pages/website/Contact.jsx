import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, MessageSquare, CornerDownRight } from 'lucide-react';

const Contact = () => {
  const [phone, setPhone] = useState('+91');
  const [phoneError, setPhoneError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('+91')) {
      val = '+91';
    }
    const digitsOnly = val.slice(3).replace(/\D/g, '');
    const finalVal = '+91' + digitsOnly.slice(0, 10);
    setPhone(finalVal);

    if (finalVal.length > 3 && finalVal.length < 13) {
      setPhoneError('Please enter a valid 10-digit number');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.length !== 13 || phoneError) return;
    
    const whatsappText = `Hello SDRS Gold Finance,\n\nI would like to request an appraisal.\n\n*Name:* ${formData.name}\n*Phone:* ${phone}\n*Message:* ${formData.message}`;
    const whatsappUrl = `https://wa.me/919843257757?text=${encodeURIComponent(whatsappText)}`;
    
    window.open(whatsappUrl, '_blank');

    setSuccess(true);
    setFormData({ name: '', message: '' });
    setPhone('+91');
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* HERO SECTION: Updated to Clean Gradient */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden pt-20 md:pt-0">
        <div className="absolute inset-0 bg-white/5" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-brand-text mb-4 md:mb-6 uppercase tracking-tighter">
              Contact Our <span className="text-brand-red">Experts</span>
            </h1>
            <p className="text-gray-600 text-sm md:text-xl font-body italic max-w-2xl mx-auto">
              Experience transparency and trust. Our dedicated team is here to provide expert valuation and instant financial solutions tailored to your needs.
            </p>
          </motion.div>
        </div>

        {/* Decorative Gold Line */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-1 bg-gold-gradient shadow-[0_0_20px_rgba(166,124,0,0.1)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1 }}
        />
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row gap-16 items-start">
          {/* Left: Contact Info */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-brand-red font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Flagship Outlet</span>
            <h2 className="text-4xl md:text-6xl font-bold mb-10 leading-tight text-brand-text">Coimbatore <br /> <span className="text-brand-red italic">Headquarters</span></h2>
            
            <div className="grid grid-cols-1 gap-8 mb-12">
               <div className="flex gap-4 group">
                  <div className="text-brand-red group-hover:scale-125 transition-transform"><MapPin size={24} /></div>
                  <div>
                    <h4 className="font-bold text-brand-text uppercase text-sm tracking-widest mb-1">Office Address</h4>
                    <p className="text-gray-600 font-body">SDRS Gold Finance, Vadavalli, Coimbatore - 641041</p>
                  </div>
               </div>
               <div className="flex gap-4 group">
                  <div className="text-brand-red group-hover:scale-125 transition-transform"><Phone size={24} /></div>
                  <div>
                    <h4 className="font-bold text-brand-text uppercase text-sm tracking-widest mb-1">Direct Call</h4>
                    <p className="text-brand-red font-body text-xl font-bold">+91 9843257757</p>
                  </div>
               </div>
               <div className="flex gap-4 group">
                  <div className="text-brand-red group-hover:scale-125 transition-transform"><Phone size={24} /></div>
                  <div>
                    <h4 className="font-bold text-brand-text uppercase text-sm tracking-widest mb-1">Office</h4>
                    <p className="text-brand-red font-body text-xl font-bold">0422 2557757</p>
                  </div>
               </div>
               <div className="flex gap-4 group">
                  <div className="text-brand-red group-hover:scale-125 transition-transform"><MessageSquare size={24} /></div>
                  <div>
                    <h4 className="font-bold text-brand-text uppercase text-sm tracking-widest mb-1">WhatsApp Chat</h4>
                    <p className="text-gray-600 font-body italic text-sm">Instant support & quotes</p>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
               <a href="tel:9843257757" className="btn-premium !px-12 py-4 flex items-center justify-center gap-2">
                 <Phone size={20} /> Call Now
               </a>
               <a href="https://wa.me/919843257757" className="btn-premium flex items-center justify-center gap-2 !bg-green-600 hover:!bg-green-700">
                 <MessageSquare size={20} /> WhatsApp
               </a>
            </div>
          </motion.div>
          
          {/* Right: Contact Form */}
          <motion.div 
            className="flex-1 w-full max-w-xl lg:max-w-none glass-premium p-10 md:p-12 rounded-[2.5rem] relative bg-white/40 border-black/5 shadow-xl"
            id="contact"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
             <h3 className="text-3xl font-bold mb-4 text-brand-text">Request an <span className="text-brand-red">Appraisal</span></h3>
             <p className="text-gray-600 font-body mb-8">Ready to discover the true value of your gold? Fill out the form below and we'll connect with you shortly.</p>
                          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/50 border border-black/10 p-5 rounded-2xl focus:border-brand-red transition-colors text-brand-text outline-none w-full" 
                    />
                    <div>
                      <input 
                        type="text" 
                        placeholder="Phone Number" 
                        value={phone}
                        onChange={handlePhoneChange}
                        className={`bg-white/50 border ${phoneError ? 'border-red-500' : 'border-black/10'} p-5 rounded-2xl focus:border-brand-red transition-colors text-brand-text outline-none w-full`} 
                      />
                      {phoneError && <span className="text-red-500 text-xs mt-1 block px-2">{phoneError}</span>}
                    </div>
                 </div>
                 <textarea 
                   rows="4" 
                   placeholder="Your Message" 
                   value={formData.message}
                   onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                   className="w-full bg-white/50 border border-black/10 p-5 rounded-2xl focus:border-brand-red transition-colors text-brand-text outline-none" 
                 />
                 
                 <button 
                   type="submit" 
                   disabled={phone.length !== 13 || phoneError}
                   className={`w-full py-5 text-lg rounded-2xl transition-all flex items-center justify-center gap-2 ${phone.length === 13 && !phoneError ? 'btn-premium !bg-green-600 hover:!bg-green-700' : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
                 >
                   {success ? 'Opened in WhatsApp!' : <><MessageSquare size={20} /> Send on WhatsApp</>}
                 </button>
              </form>
          </motion.div>
        </div>
      </section>

      {/* Styled Map Container */}
      <section className="py-24">
        <div className="container mx-auto px-6">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-brand-text">Find Us on <span className="text-brand-red">Google Maps</span></h2>
           </div>
           <div className="h-[500px] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15664.846569106064!2d76.8833924!3d11.0264936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba85edbc3d84381%3A0x6b4f762028f0907!2sVadavalli%2C%20Coimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1713955000000!5m2!1sen!2sin" 
                className="w-full h-full border-0 grayscale contrast-[1.2] brightness-[0.9]" 
                allowFullScreen="" 
                loading="lazy" 
                title="Google Maps"
              />
              <div className="absolute top-10 right-10 p-6 glass-premium !bg-brand-red/90 rounded-2xl max-w-[240px] pointer-events-none">
                 <div className="flex gap-3 items-center mb-2">
                    <CornerDownRight size={20} className="text-brand-red" />
                    <span className="font-bold text-white text-sm">Quick Directions</span>
                 </div>
                 <p className="text-white/80 text-xs font-body italic leading-relaxed">Simply search for "SDRS Gold Finance" on your navigation app.</p>
              </div>
           </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Contact;
