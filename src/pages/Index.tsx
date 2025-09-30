// Update this page (the content is just a fallback if you fail to update the page)

import heroImage from "@/assets/hero-horse.jpg";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="text-center text-white">
          <h1 className="mb-4 text-5xl md:text-6xl font-bold drop-shadow-lg">Hoofprints</h1>
          <p className="text-xl md:text-2xl drop-shadow-lg">Every horse writes a story, we're here to keep it</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
