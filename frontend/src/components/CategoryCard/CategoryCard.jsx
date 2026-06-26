import { FiCamera, FiCpu, FiHeadphones, FiMonitor, FiSmartphone, FiTv, FiWatch,} from "react-icons/fi";
import { Link } from "react-router-dom";
import "./CategoryCard.css";

const icons = {
  Laptops: FiCpu,
  Mobiles: FiSmartphone,
  TVs: FiTv,
  Gaming: FiMonitor,
  Cameras: FiCamera,
  "Smart Watches": FiWatch,
  Speakers: FiHeadphones,
};
 
function CategoryCard({ name }) {
  const Icon = icons[name] || FiCpu;

  return (
    <Link className="category-card" to={`/products?category=${encodeURIComponent(name)}`}>
      <Icon />
      <h3>{name}</h3>
      <p>Explore premium {name.toLowerCase()}</p>
    </Link>
  );
}

export default CategoryCard;
