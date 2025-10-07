import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-card mt-auto relative z-20">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Hoofprints. Alla rättigheter förbehållna.
          </div>
          
          <div className="flex gap-4 md:gap-6">
            <Link 
              to="/about" 
              className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Om oss
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
