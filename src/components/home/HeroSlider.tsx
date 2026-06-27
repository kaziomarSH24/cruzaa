import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroSliderService, { HeroSlide } from "@/services/heroSliderService";

// Extract YouTube video ID from any YouTube URL format
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

const HeroSlider = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchSlides = async () => {
    try {
      const data = await heroSliderService.getSlides();
      setSlides(data);
    } catch (e) {
      console.error('Failed to load slides:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    if (slides.length === 0) return;
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, slides.length]);

  if (loading) {
    return <div className="h-screen bg-charcoal flex items-center justify-center text-white">Loading Slider...</div>;
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-charcoal -mt-[70px] sm:-mt-[106px] pt-[70px] sm:pt-[106px]">
      {/* Slides */}
      <AnimatePresence mode="wait">
        {slides.map(
          (slide, index) =>
            index === currentSlide && (
              <motion.div
                key={slide.id || index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 100) prevSlide();
                  else if (info.offset.x < -100) nextSlide();
                }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                {/* Background: YouTube video OR image */}
                <div className="absolute inset-0">
                  {slide.video_url && getYouTubeId(slide.video_url) ? (
                    <>
                      {/* YouTube iframe background – aspect-ratio-aware cover */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: 'max(100%, calc(100vh * (16 / 9)))',
                            height: 'max(100%, calc(100vw * (9 / 16)))',
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeId(slide.video_url)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(slide.video_url)}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&vq=hd1080&hd=1`}
                            style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            title={slide.title}
                          />
                        </div>
                      </div>
                      {/* Dark overlay for video slides */}
                      <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/75 to-charcoal/40 lg:to-charcoal/30" />
                    </>
                  ) : (
                    <>
                      {/* Image background */}
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/40 lg:to-transparent" />
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="relative h-full container-custom flex items-center">
                  <div className="max-w-xl lg:max-w-2xl pt-20 pb-32">
                    {/* Badge */}
                    {slide.badge && (
                      <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4 md:mb-6"
                      >
                        {slide.badge}
                      </motion.span>
                    )}

                    {/* Subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/70 text-sm md:text-base uppercase tracking-widest mb-2 md:mb-4"
                    >
                      {slide.subtitle}
                    </motion.p>

                    {/* Title */}
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 md:mb-6"
                    >
                      {slide.title}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-base md:text-xl text-white/70 mb-6 md:mb-8 max-w-md"
                    >
                      {slide.description}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-wrap gap-4"
                    >
                      <Link to={slide.cta_link} className="btn-hero-primary">
                        {slide.cta_text}
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                      <Link to="/products" className="btn-hero-outline">
                        View All Products
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative h-2 sm:h-3 rounded-full transition-all duration-300 ${index === currentSlide ? "w-6 sm:w-8 bg-primary" : "w-2 sm:w-3 bg-white/40 hover:bg-white/60"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === currentSlide && (
              <motion.div
                className="absolute inset-0 bg-primary rounded-full"
                layoutId="activeSlide"
              />
            )}
          </button>
        ))}
      </div>

      {/* Slide Counter */}
      {/* <div className="absolute bottom-8 right-4 md:right-8 z-50 text-white/60 text-xs sm:text-sm font-medium">
        <span className="text-white">{String(currentSlide + 1).padStart(2, "0")}</span>
        <span className="mx-2">/</span>
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div> */}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div
          key={currentSlide}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-primary"
        />
      </div>
    </section>
  );
};

export default HeroSlider;
