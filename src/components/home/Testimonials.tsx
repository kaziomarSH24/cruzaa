import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "James Thompson",
    role: "Daily Commuter",
    content: "Best investment I've made for my commute. The Cruzaa scooter is fast, reliable, and looks amazing. My 45-minute commute is now a breeze!",
    rating: 5,
    avatar: "JT",
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    role: "Verified Buyer",
    content: "Incredible build quality and the customer service is outstanding. The Bluetooth speakers are a nice bonus. Highly recommend!",
    rating: 5,
    avatar: "SM",
  },
  {
    id: 3,
    name: "David Chen",
    role: "Tech Enthusiast",
    content: "The LED display and app connectivity are fantastic. Love tracking my rides and the battery life is exactly as advertised.",
    rating: 5,
    avatar: "DC",
  },
];

const Testimonials = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4">What Our Riders Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Join thousands of happy riders who have transformed their daily commute
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 md:p-8"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-gold fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 text-sm md:text-base leading-relaxed">"{testimonial.content}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm md:text-base">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm md:text-base">{testimonial.name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
