import { FiFacebook, FiGithub, FiInstagram, FiSend, FiTwitter,} from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        
        <div>
          <Link to="/" className="footer-logo"> ElectraX</Link>
          <p>Premium electronics, clean design, fast delivery and future-ready devices.</p>
          <div className="socials">
            <a href="https://facebook.com" aria-label="Facebook"> <FiFacebook /> </a>
            <a href="https://instagram.com" aria-label="Instagram"> <FiInstagram /> </a>
            <a href="https://twitter.com" aria-label="Twitter"> <FiTwitter /> </a>
            <a href="https://github.com" aria-label="Github"> <FiGithub /> </a>
          </div>
        </div>

        <div>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div>
          <h4>Support</h4>
          <a href="mailto:support@electrax.dev">Help Center</a>
          <a href="mailto:support@electrax.dev">Warranty</a>
          <a href="mailto:support@electrax.dev">Returns</a>
        </div>

        <div>
          <h4>Newsletter</h4>
          <p>Get launch alerts and private tech deals.</p>

          <form className="newsletter">
            <input type="email" placeholder="Email address" />
            <button aria-label="Subscribe"><FiSend /></button>
          </form>

        </div>

      </div>
      <p className="copy">© 2026 ElectraX. Built for modern tech shoppers.</p>
    </footer>
  );
}

export default Footer;
