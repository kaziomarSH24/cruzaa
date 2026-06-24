import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, ChevronDown } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { useContent } from "@/hooks/useContent";

const iconMap: Record<string, any> = {
  Phone,
  Mail,
  MapPin,
  Clock
};

const Contact = () => {
  const { getContent } = useContent('contact');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  let contactInfo = [];
  try {
    const raw = getContent('contact_info_json');
    contactInfo = raw ? JSON.parse(raw) : [
      { icon: "Phone", title: "Phone", value: "0203 326 8888", description: "Mon-Fri 9am-6pm" },
      { icon: "Mail", title: "Email", value: "hi@cruzaa.com", description: "We reply within 24 hours" },
      { icon: "MapPin", title: "Office", value: "London, UK", description: "Registered in England & Wales" },
      { icon: "Clock", title: "Hours", value: "Mon-Fri 9-6", description: "Weekend support available" }
    ];
  } catch (e) {
    contactInfo = [
      { icon: "Phone", title: "Phone", value: "0203 326 8888", description: "Mon-Fri 9am-6pm" },
      { icon: "Mail", title: "Email", value: "hi@cruzaa.com", description: "We reply within 24 hours" },
      { icon: "MapPin", title: "Office", value: "London, UK", description: "Registered in England & Wales" },
      { icon: "Clock", title: "Hours", value: "Mon-Fri 9-6", description: "Weekend support available" }
    ];
  }

  let faqs = [];
  try {
    const raw = getContent('contact_faq_json');
    faqs = raw ? JSON.parse(raw) : [
      { question: "What is the warranty on Cruzaa products?", answer: "All Cruzaa products come with a 2-year manufacturer warranty covering defects in materials and workmanship. Extended warranty options are also available at checkout." },
      { question: "How long does delivery take?", answer: "Standard UK delivery takes 3-5 business days. Express delivery (1-2 business days) is available for an additional fee. International shipping times vary by destination." },
      { question: "Can I return my Cruzaa product?", answer: "Yes! We offer a 30-day return policy. Products must be in original condition with all packaging. Contact our support team to initiate a return." },
      { question: "Do I need insurance for my electric scooter?", answer: "UK law currently does not require insurance for private e-scooters. However, we recommend checking local regulations and considering insurance for peace of mind." },
      { question: "How do I maintain my Cruzaa scooter?", answer: "Regular maintenance includes keeping tires properly inflated, checking brakes monthly, and charging the battery according to the manual. We also offer annual service packages." }
    ];
  } catch (e) {
    faqs = [
      { question: "What is the warranty on Cruzaa products?", answer: "All Cruzaa products come with a 2-year manufacturer warranty covering defects in materials and workmanship. Extended warranty options are also available at checkout." },
      { question: "How long does delivery take?", answer: "Standard UK delivery takes 3-5 business days. Express delivery (1-2 business days) is available for an additional fee. International shipping times vary by destination." },
      { question: "Can I return my Cruzaa product?", answer: "Yes! We offer a 30-day return policy. Products must be in original condition with all packaging. Contact our support team to initiate a return." },
      { question: "Do I need insurance for my electric scooter?", answer: "UK law currently does not require insurance for private e-scooters. However, we recommend checking local regulations and considering insurance for peace of mind." },
      { question: "How do I maintain my Cruzaa scooter?", answer: "Regular maintenance includes keeping tires properly inflated, checking brakes monthly, and charging the battery according to the manual. We also offer annual service packages." }
    ];
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              {getContent('contact_hero_badge', 'Get in Touch')}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" dangerouslySetInnerHTML={{ __html: getContent('contact_hero_title', 'We\'re here to <span class="text-primary">help</span>') }} />
            <p className="text-xl text-muted-foreground">
              {getContent('contact_hero_subtitle', 'Have a question about our products or need support? Our team is ready to assist you.')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="pb-16">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-8">
            {contactInfo.map((info: any, index: number) => {
              const IconComp = iconMap[info.icon] || Mail;
              return (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <IconComp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-1">{info.title}</h3>
                  <p className="text-lg font-semibold text-primary mb-1">{info.value}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">{getContent('contact_form_title', 'Send us a message')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg input-focus"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg input-focus"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg input-focus"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-border rounded-lg input-focus resize-none"
                    placeholder="Tell us more..."
                  />
                </div>
                <button type="submit" className="btn-hero-primary">
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">{getContent('contact_faq_title', 'Frequently Asked Questions')}</h2>
              <div className="space-y-4">
                {faqs.map((faq: any, index: number) => (
                  <div
                    key={index}
                    className="border border-border rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-secondary/50 transition-colors"
                    >
                      {faq.question}
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          openFaq === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: openFaq === index ? "auto" : 0,
                        opacity: openFaq === index ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="p-4 pt-0 text-muted-foreground">{faq.answer}</p>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Chat CTA */}
      <section className="py-16 bg-secondary/30">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">{getContent('contact_cta_title', 'Need immediate help?')}</h2>
            <p className="text-muted-foreground mb-6">
              {getContent('contact_cta_subtitle', 'Our support team is available via phone during business hours.')}
            </p>
            <a
              href={getContent('contact_cta_phone', 'tel:02033268888')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-5 h-5" />
              {getContent('contact_cta_btn_text', 'Call 0203 326 8888')}
            </a>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
