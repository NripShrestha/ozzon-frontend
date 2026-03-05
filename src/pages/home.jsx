import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Battery,
  Droplet,
  Droplets,
  Zap,
  Shield,
  Thermometer,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  Loader2,
  AlertCircle,
  ShoppingCart,
  ClipboardList,
  Phone,
} from "lucide-react";

import ozzonVideo from "../assets/ozzon_scroll.mp4";
import logo from "../assets/Logo.png";
import photoshoot2 from "../assets/photoshoot2.png";

// Auth utilities
import { getAuth, logout, authFetch } from "./auth/useAuth";

// ── API CONFIG ──
const BASE_URL = import.meta.env.VITE_API_URL;

// ── API HELPERS ──
const fetchCategories = async () => {
  const res = await fetch(`${BASE_URL}/api/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

const fetchProducts = async ({
  page = 1,
  keyword = "",
  category = "",
} = {}) => {
  const params = new URLSearchParams({ page });
  if (keyword) params.set("keyword", keyword);
  if (category) params.set("category", category);
  const res = await fetch(`${BASE_URL}/api/products?${params}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

const fetchCartCount = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/api/cart`);
    if (!res.ok) return 0;
    const data = await res.json();
    return (data.items ?? []).reduce(
      (sum, item) => sum + (item.quantity || 1),
      0,
    );
  } catch {
    return 0;
  }
};

// Category icon map
const CATEGORY_ICONS = {
  default: Battery,
  lubricant: Droplet,
  lubricants: Droplet,
  fluid: Droplets,
  fluids: Droplets,
  "automotive-fluid": Droplets,
  "automotive-fluids": Droplets,
  bike: Zap,
  "bike-battery": Zap,
  "bike-batteries": Zap,
};

const getCategoryIcon = (name = "") => {
  const key = name.toLowerCase().replace(/\s+/g, "-");
  return CATEGORY_ICONS[key] ?? Battery;
};

gsap.registerPlugin(ScrollTrigger);

// ── SKELETON CARD ──
const SkeletonCard = () => (
  <div className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-lg p-8">
    <div className="mb-5 h-14 w-14 rounded-lg bg-zinc-700" />
    <div className="h-6 w-3/4 bg-zinc-700 rounded mb-3" />
    <div className="h-4 w-full bg-zinc-800 rounded mb-2" />
    <div className="h-4 w-5/6 bg-zinc-800 rounded" />
  </div>
);

// ── PRODUCT SKELETON ──
const ProductSkeleton = () => (
  <div className="animate-pulse bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
    <div className="grid md:grid-cols-2">
      <div className="aspect-square bg-zinc-800" />
      <div className="p-10 md:p-14 flex flex-col justify-center gap-4">
        <div className="h-3 w-24 bg-zinc-700 rounded" />
        <div className="h-8 w-3/4 bg-zinc-700 rounded" />
        <div className="h-4 w-full bg-zinc-800 rounded" />
        <div className="h-4 w-5/6 bg-zinc-800 rounded" />
        <div className="h-10 w-36 bg-zinc-700 rounded mt-4" />
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ── AUTH STATE ──
  const [auth, setAuth] = useState(() => getAuth());

  // ── CART COUNT ──
  const [cartCount, setCartCount] = useState(0);

  // ── DATA STATE ──
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [productsError, setProductsError] = useState(null);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length,
    );

  // ── FETCH CART COUNT (only if logged in) ──
  useEffect(() => {
    if (!auth) return;
    fetchCartCount().then(setCartCount);
  }, [auth]);

  // ── FETCH CATEGORIES ──
  useEffect(() => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    fetchCategories()
      .then(setCategories)
      .catch((err) => setCategoriesError(err.message))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // ── FETCH FEATURED PRODUCTS ──
  useEffect(() => {
    setProductsLoading(true);
    setProductsError(null);
    fetchProducts({ page: 1 })
      .then(({ products }) => setFeaturedProducts(products.slice(0, 6)))
      .catch((err) => setProductsError(err.message))
      .finally(() => setProductsLoading(false));
  }, []);

  // Reset slide index when products change
  useEffect(() => {
    setCurrentSlide(0);
  }, [featuredProducts]);

  // ── GSAP SCROLL ANIMATION ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initTimeline = () => {
      setIsReady(true);
      video.pause();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=400%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(video, { currentTime: video.duration, ease: "none" }, 0);
      tl.fromTo(
        ".hero-text",
        { opacity: 1, y: 0 },
        { opacity: 0, y: -50, duration: 0.5 },
        0,
      );
    };

    if (video.readyState >= 2) initTimeline();
    else video.onloadedmetadata = initTimeline;

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <div
      className="bg-[#1a1a1a] text-white w-full min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-10 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent box-border">
        <div className="flex-shrink-0">
          {logo ? (
            <img
              src={logo}
              alt="OZZON"
              className="h-6 md:h-12 object-contain"
            />
          ) : (
            <span className="text-xl md:text-2xl font-black tracking-tighter">
              OZZ<span className="text-[#ed1b35]">ON</span>
            </span>
          )}
        </div>

        <div className="hidden md:flex gap-8 items-center text-[10px] font-bold uppercase tracking-[0.3em]">
          <Link to="/products" className="hover:text-[#ed1b35] transition">
            Products
          </Link>

          {auth ? (
            <div className="flex items-center gap-4">
              {/* Cart icon with badge */}
              <Link
                to="/cart"
                className="relative flex items-center justify-center h-9 w-9 rounded-full border border-zinc-700 hover:border-[#ed1b35] transition-colors group"
                aria-label="Cart"
              >
                <ShoppingCart className="h-4 w-4 text-zinc-400 group-hover:text-[#ed1b35] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-[#ed1b35] text-white text-[9px] font-black leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Orders icon */}
              <Link
                to="/orders"
                className="flex items-center justify-center h-9 w-9 rounded-full border border-zinc-700 hover:border-[#ed1b35] transition-colors group"
                aria-label="My Orders"
              >
                <ClipboardList className="h-4 w-4 text-zinc-400 group-hover:text-[#ed1b35] transition-colors" />
              </Link>

              <span className="text-zinc-400 normal-case tracking-normal text-xs">
                Hi,{" "}
                <span className="text-white font-bold">
                  {auth.user?.name?.split(" ")[0] ?? "User"}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 border border-zinc-700 px-5 py-2 hover:border-[#ed1b35] hover:text-[#ed1b35] transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#ed1b35] px-6 py-2 hover:bg-white hover:text-black transition-all"
            >
              Login
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <Zap className="rotate-90" /> : <Menu />}
        </button>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black/95 border-t border-zinc-800 p-6 flex flex-col gap-6 md:hidden animate-in slide-in-from-top">
            <Link
              to="/products"
              className="text-sm font-bold uppercase tracking-widest"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>

            {auth ? (
              <div className="flex flex-col gap-3">
                <Link
                  to="/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest"
                >
                  <ShoppingCart className="h-4 w-4 text-[#ed1b35]" />
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ed1b35] text-white text-[9px] font-black">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>

                {/* Orders link in mobile menu */}
                <Link
                  to="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest"
                >
                  <ClipboardList className="h-4 w-4 text-[#ed1b35]" />
                  My Orders
                </Link>

                <p className="text-zinc-400 text-xs">
                  Signed in as{" "}
                  <span className="text-white font-bold">
                    {auth.user?.name ?? "User"}
                  </span>
                </p>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 border border-zinc-700 px-6 py-3 font-bold uppercase text-xs hover:border-[#ed1b35] hover:text-[#ed1b35] transition-all w-full"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#ed1b35] px-6 py-3 text-center font-bold uppercase text-xs"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* ── HERO SCROLL ANIMATION ── */}
      <section
        ref={heroRef}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black"
      >
        {ozzonVideo && (
          <video
            ref={videoRef}
            src={ozzonVideo}
            className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]"
            muted
            playsInline
            preload="auto"
          />
        )}
        {!ozzonVideo && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-black via-zinc-900 to-[#1a1a1a]">
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#ed1b35] opacity-10 blur-[200px] rounded-full" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="hero-text relative z-10 text-center px-6">
          <h1 className="text-6xl md:text-[10rem] font-black italic leading-none uppercase tracking-tighter">
            Pure <br />
            <span className="text-[#ed1b35]">Energy.</span>
          </h1>
          <p className="mt-6 text-zinc-400 uppercase tracking-[0.4em] text-xs md:text-sm">
            Scroll to Power Up
          </p>
        </div>
      </section>

      {/* ── REST OF SITE ── */}
      <div className="relative z-20 w-full">
        {/* ── ABOUT OZZON ── */}
        <section className="py-24 bg-[#1a1a1a]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-4">
                  Who We Are
                </p>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                  About <span className="text-[#ed1b35]">OZZON</span>
                </h2>
                <p className="text-lg text-zinc-400 mb-5 leading-relaxed">
                  OZZON is a leading manufacturer of premium automotive
                  batteries, lubricants, and energy solutions. With years of
                  experience and cutting-edge technology, we power many vehicles
                  across the nation.
                </p>
                <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                  Our commitment to quality, innovation, and customer
                  satisfaction has made us the trusted choice for vehicle
                  owners, dealers, and service centers nationwide.
                </p>
              </div>
              <div className="relative">
                <img
                  src={photoshoot2}
                  alt="Manufacturing"
                  className="rounded-lg shadow-2xl w-full object-cover"
                />
                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#ed1b35] opacity-10 blur-3xl rounded-full" />
                <div className="absolute inset-0 rounded-lg border border-white/5" />
              </div>
            </div>
          </div>
        </section>

        {/* ── PRODUCT CATEGORIES (dynamic) ── */}
        <section className="py-24 bg-zinc-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-3">
                What We Make
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Our <span className="text-[#ed1b35]">Products</span>
              </h2>
              <p className="text-lg text-zinc-400">
                Comprehensive range of automotive power and lubrication
                solutions
              </p>
            </div>

            {categoriesError && (
              <div className="flex items-center justify-center gap-3 text-red-400 py-12">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  Could not load categories. {categoriesError}
                </p>
              </div>
            )}

            {categoriesLoading && !categoriesError && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(5)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!categoriesLoading && !categoriesError && (
              <>
                {categories.length === 0 ? (
                  <p className="text-center text-zinc-500 py-12">
                    No categories found.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat, idx) => {
                      const Icon = getCategoryIcon(cat.name);
                      const isLastOdd =
                        idx === categories.length - 1 &&
                        categories.length % 2 !== 0;
                      return (
                        <Link
                          key={cat._id}
                          to={`/products?category=${cat._id}`}
                          className={`group relative overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800 hover:border-[#ed1b35] transition-all duration-300 hover:shadow-lg hover:shadow-[#ed1b35]/10 ${isLastOdd ? "sm:col-span-2 lg:col-span-1" : ""}`}
                        >
                          <div className="p-8">
                            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-[#ed1b35] shadow-lg shadow-[#ed1b35]/30">
                              <Icon className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                              {cat.name}
                            </h3>
                            {cat.description && (
                              <p className="text-zinc-400 mb-5 text-sm leading-relaxed">
                                {cat.description}
                              </p>
                            )}
                            <span className="inline-flex items-center gap-2 text-[#ed1b35] font-bold text-sm uppercase tracking-widest group-hover:gap-3 transition-all">
                              Explore <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#ed1b35] opacity-5 rounded-tl-full" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ── WHY CHOOSE OZZON ── */}
        <section className="py-24 bg-[#1a1a1a]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-3">
                The Difference
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Why Choose <span className="text-[#ed1b35]">OZZON</span>
              </h2>
              <p className="text-lg text-zinc-400">
                Built on the foundation of quality, innovation, and trust
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Battery,
                  title: "Long-Lasting Power",
                  desc: "Extended battery life with superior performance and reliability",
                },
                {
                  icon: Zap,
                  title: "Advanced Technology",
                  desc: "Cutting-edge manufacturing processes and quality materials",
                },
                {
                  icon: Thermometer,
                  title: "Heat Resistance",
                  desc: "Engineered to withstand extreme temperatures and conditions",
                },
                {
                  icon: MapPin,
                  title: "Nationwide Reliability",
                  desc: "Trusted by many customers across the country",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center group">
                  <div className="mx-auto mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-[#ed1b35] transition-colors">
                    <Icon className="h-9 w-9 text-[#ed1b35]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED PRODUCTS CAROUSEL (dynamic) ── */}
        <section className="py-24 bg-zinc-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ed1b35] mb-3">
                Best Sellers
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Featured <span className="text-[#ed1b35]">Products</span>
              </h2>
              <p className="text-lg text-zinc-400">
                Explore our best-selling automotive solutions
              </p>
            </div>

            {productsError && (
              <div className="flex items-center justify-center gap-3 text-red-400 py-12">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  Could not load products. {productsError}
                </p>
              </div>
            )}

            {productsLoading && !productsError && <ProductSkeleton />}

            {!productsLoading &&
              !productsError &&
              featuredProducts.length === 0 && (
                <p className="text-center text-zinc-500 py-12">
                  No products available yet.
                </p>
              )}

            {!productsLoading &&
              !productsError &&
              featuredProducts.length > 0 && (
                <div className="relative">
                  <div className="overflow-hidden rounded-lg">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                      }}
                    >
                      {featuredProducts.map((product) => (
                        <div key={product._id} className="w-full flex-shrink-0">
                          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                            <div className="grid md:grid-cols-2 gap-0">
                              <div className="aspect-square overflow-hidden bg-zinc-800">
                                <img
                                  src={product.image?.url}
                                  alt={product.name}
                                  className="h-full w-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://images.unsplash.com/photo-1609952048180-7b35ea6b083b?w=600&q=80";
                                  }}
                                />
                              </div>
                              <div className="flex flex-col justify-center p-10 md:p-14">
                                <span className="text-[10px] font-bold text-[#ed1b35] mb-3 uppercase tracking-[0.4em]">
                                  {typeof product.category === "object"
                                    ? product.category.name
                                    : product.category}
                                </span>
                                <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                                  {product.name}
                                </h3>
                                {product.description && (
                                  <p className="text-zinc-400 mb-8 text-sm leading-relaxed line-clamp-3">
                                    {product.description}
                                  </p>
                                )}
                                <Link
                                  to={`/products/${product._id}`}
                                  className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#ed1b35] text-white font-bold rounded hover:bg-[#c81529] transition-colors shadow-lg shadow-[#ed1b35]/20 w-fit text-sm uppercase tracking-widest"
                                >
                                  View Details{" "}
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {featuredProducts.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900 border border-zinc-700 rounded-full hover:border-[#ed1b35] transition-colors"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="h-5 w-5 text-white" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900 border border-zinc-700 rounded-full hover:border-[#ed1b35] transition-colors"
                        aria-label="Next"
                      >
                        <ChevronRight className="h-5 w-5 text-white" />
                      </button>

                      <div className="flex justify-center gap-2 mt-8">
                        {featuredProducts.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 rounded-full transition-all ${index === currentSlide ? "w-8 bg-[#ed1b35]" : "w-2 bg-zinc-700"}`}
                            aria-label={`Slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="py-16 border-t border-zinc-900 bg-black text-center">
          <Battery className="mx-auto mb-4 text-[#ed1b35] animate-pulse" />
          <p className="text-[9px] text-zinc-700 uppercase tracking-[0.6em] mb-6">
            OZZON Industrial Excellence 2026
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1">
              Get in Touch
            </p>
            <a
              href="tel:+9779801037535"
              className="flex items-center gap-2 text-zinc-400 hover:text-[#ed1b35] transition-colors text-sm"
            >
              <Phone className="h-3.5 w-3.5" />
              +977 9801037535
            </a>
            <a
              href="tel:+9779851422535"
              className="flex items-center gap-2 text-zinc-400 hover:text-[#ed1b35] transition-colors text-sm"
            >
              <Phone className="h-3.5 w-3.5" />
              +977 9851422535
            </a>
            <p className="text-zinc-500 text-xs mt-1">Kumari Kaji Shrestha</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
