import { categories } from "../../data/categories.js";
import { formatPrice } from "../../utils/formatPrice.js";
import "./SidebarFilter.css";

function SidebarFilter({ filters, setFilters, brands }) {
  const changeFilter = (name, value) => {
    if (name === "category") {
      setFilters({ ...filters, category: value, brand: "All" });
      return;
    }

    setFilters({ ...filters, [name]: value });
  };

  return (
    <aside className="filter-panel">
      <h3>Filters</h3>

      <label>
        Category
        <select
          value={filters.category}
          onChange={(e) => changeFilter("category", e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label>
        Brand
        <select
          value={filters.brand}
          onChange={(e) => changeFilter("brand", e.target.value)}
        >
          <option value="All">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>

      <label>
        {" "}
        Max Price: {formatPrice(filters.price)}
        <input
          type="range"
          min="10000"
          max="220000"
          step="5000"
          value={filters.price}
          onChange={(e) => changeFilter("price", Number(e.target.value))}
        />
      </label>

      <label>
        {" "}
        Minimum Rating
        <select
          value={filters.rating}
          onChange={(e) => changeFilter("rating", Number(e.target.value))}
        >
          <option value="0">Any Rating</option>
          <option value="4.5">4.5+</option>
          <option value="4.7">4.7+</option>
          <option value="4.8">4.8+</option>
        </select>
      </label>
    </aside>
  );
}

export default SidebarFilter;
