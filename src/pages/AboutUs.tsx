import Layout from "@/components/layout/Layout";

const teamWithImages = [
  {
    name: "Aleen M.",
    image: "/team/aleen.jpg",
  },
  {
    name: "John B.", // Using "B" as requested in text, despite filename
    image: "/team/john.jpg",
  },
  {
    name: "Michelle W.",
    image: "/team/michelle.jpg",
  },
];

const AboutUs = () => {
  return (
    <Layout>
      <section className="bg-cream/30 py-24 min-h-[80vh] flex flex-col justify-center">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-16 text-center">
            Our Team
          </h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 items-center max-w-6xl mx-auto">
            {/* Team Members */}
            <div className="flex justify-center gap-8 md:col-span-2 lg:col-span-2 flex-wrap">
              {teamWithImages.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-6 inline-block">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-navy shadow-lg relative z-10">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Blue tint overlay effect as seen in reference */}
                      <div className="absolute inset-0 bg-navy/20 mix-blend-multiply" />
                    </div>
                  </div>
                  <h3 className="font-serif text-xl font-medium text-navy">
                    {member.name}
                  </h3>
                </div>
              ))}
            </div>

            {/* Description Text */}
            <div className="md:col-span-2 lg:col-span-1 text-center lg:text-left space-y-8">
              <p className="font-serif text-xl md:text-2xl text-navy leading-relaxed italic">
                Our team is dedicated to providing you with the most accurate, comprehensive, 
                elucidated, cross-checked, and error-free information available online.
              </p>
              
              <div className="pt-4">
                <p className="text-navy/80 font-medium">
                  Write to us, your Suggestion meant alot to us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutUs;
