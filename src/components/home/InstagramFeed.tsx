import { motion } from "framer-motion";
import { Instagram, ExternalLink } from "lucide-react";

const INSTAGRAM_POSTS = [
  "CztZRccsArL",
  "CtttDOZLLC4",
  "Cr0dM5YNsG4",
  "CrayZfQs-Bz",
  "Cxspu26s7xz"
];

const InstagramFeed = () => {
  return (
    <section className="py-28 bg-white overflow-hidden border-t border-border/40">
      <div className="container-custom">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white mb-2 shadow-[0_10px_20px_rgba(238,42,123,0.3)]">
              <Instagram className="w-7 h-7" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-black">
                Our Instagram
            </h2>
            <p className="text-muted-foreground/80 max-w-xl mx-auto text-lg">
              Follow <span className="text-primary font-bold">@cruzaa_life</span> for the latest e-mobility trends, exclusive offers, and our community stories.
            </p>
            <div className="mt-6">
                <a 
                href="https://www.instagram.com/cruzaa_life" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-3 px-10 py-4 bg-black text-white rounded-full text-xs font-black tracking-[0.2em] uppercase transition-all hover:bg-primary shadow-xl hover:shadow-primary/40 active:scale-95"
                >
                <span>View All Feed</span>
                <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {INSTAGRAM_POSTS.map((id, index) => (
            <motion.div 
              key={id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -12 }}
              className={`rounded-none overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] bg-white border border-border/30 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] ${index >= 2 ? 'hidden sm:block' : ''}`}
            >
                <div className="relative w-full aspect-[4/5] overflow-hidden">
                    <iframe 
                        src={`https://www.instagram.com/p/${id}/embed/`} 
                        className="absolute left-0 w-full h-[calc(100%+135px)] -top-[60px] border-0"
                        scrolling="no" 
                        allowTransparency={true}
                        title={`Instagram Post ${index + 1}`}
                    />
                </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
