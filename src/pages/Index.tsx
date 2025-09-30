// Update this page (the content is just a fallback if you fail to update the page)

import heroImage from "@/assets/hero-horse.jpg";

const Index = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-6 text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
            Hoofprints
          </h1>
          <p className="text-2xl md:text-3xl text-white/95 drop-shadow-lg font-light">
            Every horse writes a story, we're here to keep it
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
