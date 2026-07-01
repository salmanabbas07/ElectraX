import { FiArrowRight, FiCpu, FiHeadphones, FiSmartphone, FiMonitor } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">

        <div className="hero-content">
          <span className="hero-tag">Next-gen electronics store</span>
          <h1>Upgrade Your Tech Lifestyle</h1>
          <p>Discover premium phones, laptops, gaming gear, audio and smart devices built for faster work, better play and cleaner everyday living.</p>
          <div className="hero-actions">
            <Link className="primary-btn" to="/products"> Shop Collection <FiArrowRight /> </Link>
            <a className="secondary-btn" href="#featured">View Deals</a>
          </div>
        </div>

        <div className="hero-visual">
          <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1100&q=80" alt="Premium laptop setup" />

          <div className="float-item phone"> <FiSmartphone /> Mobiles </div>

          <div className="float-item audio"> <FiHeadphones /> Headphones </div>

          {/* <div className="float-item chip"> <FiCpu /> AI Ready </div> */}

          <div className="float-item chip"> <FiMonitor /> Moniter </div>


        </div>
      </div>
    </section>
  );
}

export default Hero;
