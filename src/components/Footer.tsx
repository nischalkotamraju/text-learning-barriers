export const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/5 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-white text-xl font-bold tracking-tight mb-2">VisualLearn</div>
            <p className="text-white/40 text-sm">
              Making education accessible for everyone.
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="text-white/40 hover:text-white transition">About</a>
            <a href="#" className="text-white/40 hover:text-white transition">Services</a>
            <a href="#" className="text-white/40 hover:text-white transition">Contact</a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-white/30 text-xs tracking-wider">
            © 2025 VisualLearn. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;