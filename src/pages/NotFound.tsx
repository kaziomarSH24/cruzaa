import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  return (
    <Layout>
      <section className="pt-32 pb-16 min-h-screen flex items-center">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="text-8xl font-bold text-primary mb-4">404</div>
            <h1 className="text-3xl font-bold mb-4">Page not found</h1>
            <p className="text-muted-foreground mb-8">
              Sorry, we couldn't find the page you're looking for. Perhaps you've mistyped the URL or the page has moved.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-colors"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-6 py-3 border border-border font-semibold rounded-full hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
