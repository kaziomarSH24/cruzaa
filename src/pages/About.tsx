import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import scooterMain from "@/assets/products/scooter-main.jpg";
import { useContent } from "@/hooks/useContent";

const About = () => {
  const { getContent } = useContent('about');

  const resolveImage = (val: string, fallback: string) => {
    if (!val) return fallback;
    if (val.startsWith('http') || val.startsWith('data:') || val.startsWith('/')) return val;
    return `/uploads/${val}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <Layout>
      {/* Hero / Title */}
      <section className="pt-10 pb-20 bg-gradient-to-b from-secondary/50 via-background to-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />
        
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-widest uppercase mb-6"
            >
              {getContent('about_story_badge', 'The Journey')}
            </motion.span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
              {getContent('about_story_title', 'Our Story')}
            </h1>
            <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Story Content */}
      <section className="pb-32">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-6">
                <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed italic border-l-4 border-primary pl-6">
                  {getContent('about_story_highlight', 'Our journey started in 2015 when we began experimenting with tech that was fun, stylish and complimentary to modern lifestyles.')}
                </p>
              </motion.div>

              <motion.div 
                variants={itemVariants} 
                className="space-y-6 text-lg text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: getContent('about_story_description_html', `
                    <p>We noticed a rise in the popularity of electric assisted products like electric scooters and e-bikes. Since our interest grew, we carried out extensive research and wanted to create something of our own.</p>
                    <p>We have worked tirelessly making sure safety, design and user experience were optimised and our products are fun whilst fitting perfectly into everyday lifestyle and making commuting more environmentally friendly.</p>
                    <p>And so our first product – the fully electric Cruzaa scoota – was launched. Although we couldn’t be prouder of our electric scoota we have since launched further unique products to fit into the Cruzaa portfolio.</p>
                    <p>Tim Cahill joining Cruzaa has brought a wealth of entrepreneurial experience and creativity whilst continually driving our strategy and fulfilling the vision.</p>
                  `)
                }}
              />

              <motion.div 
                variants={itemVariants}
                className="pt-10 mt-10 border-t border-border relative"
              >
                <div className="absolute -top-px left-0 w-24 h-px bg-primary" />
                <h3 className="text-3xl font-black text-foreground mb-3 tracking-tighter">
                  {getContent('about_story_squad_title', 'Cruzaa Squad')}
                </h3>
                <p className="text-2xl font-bold text-primary flex items-center gap-3">
                  <span className="w-8 h-px bg-primary/30" />
                  {getContent('about_story_squad_quote', '“Move your own way”')}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 to-gold/30 rounded-[2rem] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  src={resolveImage(getContent('about_story_image'), scooterMain)}
                  alt="Cruzaa Story"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gold/10 rounded-full blur-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
