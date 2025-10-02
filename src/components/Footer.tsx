import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hoofprints. Alla rättigheter förbehållna.
          </div>
          
          <div className="flex gap-6">
            <Link 
              to="/about" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
