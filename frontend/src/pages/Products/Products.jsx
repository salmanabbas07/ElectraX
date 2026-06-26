import { useEffect, useRef, useState } from "react";
import { FiClock, FiDollarSign, FiTag, FiTrendingUp } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import SidebarFilter from "../../components/SidebarFilter/SidebarFilter.jsx";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import { fetchProducts } from "../../services/api.js";
import { getProductId } from "../../utils/productId.js";
import "./Products.css";

function Products() {
  const sortOptions = [
    { name: "Popular First", icon: <FiTrendingUp /> },
    { name: "Newest First", icon: <FiClock /> },
    { name: "Discount First", icon: <FiTag /> },
    { name: "Cheapest", icon: <FiDollarSign /> },
  ];

  const [activeSort, setActiveSort] = useState("Popular First");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const productsTopRef = useRef(null);
  const productsPerPage = 12;
  const selectedCategory = searchParams.get("category") || "All";

  const [filterUi, setFilterUi] = useState({
    category: "All",
    brand: "All",
    price: 220000,
    rating: 0,
  });

  const activeCategory = filterUi.category;
  const categoryProducts = activeCategory === "All" ? products : products.filter((product) => product.category === activeCategory);
  const brands = [...new Set(categoryProducts.map((product) => product.brand))];
  const filteredProducts = categoryProducts
    .filter((product) => filterUi.brand === "All" || product.brand === filterUi.brand)
    .filter((product) => product.price <= filterUi.price)
    .filter((product) => product.rating >= filterUi.rating)
    .sort((a, b) => {
      if (activeSort === "Newest First") {
        const latestA = a.createdAt ? new Date(a.createdAt).getTime() : Number(a.id) || 0;
        const latestB = b.createdAt ? new Date(b.createdAt).getTime() : Number(b.id) || 0;
        return latestB - latestA;
      }
      if (activeSort === "Discount First") return parseInt(b.discount || 0) - parseInt(a.discount || 0);
      if (activeSort === "Cheapest") return a.price - b.price;
      return b.rating - a.rating;
    });
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const startIndex = (currentPage - 1) * productsPerPage;
  const showingStart = filteredProducts.length === 0 ? 0 : startIndex + 1;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
  const pageNumbers = [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter((page, index, pages) => page >= 1 && page <= totalPages && pages.indexOf(page) === index);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Products load nahi ho pa rahe. Backend server check karo."));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setFilterUi((currentFilters) => ({ ...currentFilters, category: selectedCategory }));
  }, [selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterUi.brand, filterUi.price, filterUi.rating, activeSort]);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);

    setTimeout(() => {
      productsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <section className="page-pad products-page">
      <div className="container">
        <div className="products-head">
          <div>
            <h1 className="section-title">{activeCategory === "All" ? "ElectraX Products" : activeCategory}</h1>
            <p className="section-text">Explore the latest premium electronics in one simple collection.</p>
          </div>
          <span>{filteredProducts.length} items</span>
        </div>

        <div className="products-layout">
          <SidebarFilter filters={filterUi} setFilters={setFilterUi} brands={brands}/>

          <div className="products-area" ref={productsTopRef}>
            {error && <p className="section-text">{error}</p>}

            <div className="sort-panel">
              <span>Showing {showingStart}-{Math.min(startIndex + productsPerPage, filteredProducts.length)} of {filteredProducts.length}</span>

              <div className="sort-options">
                {sortOptions.map((option) => (
                  <button key={option.name} className={activeSort === option.name ? "sort-btn active" : "sort-btn"} onClick={() => setActiveSort(option.name)}>
                    {option.icon}
                    {option.name}
                  </button>
                )
                )}
              </div>

            </div>

            <div className="products-list" key={currentPage}>
              {!error && currentProducts.map((product) => (
                <ProductCard key={getProductId(product)} product={product} />
              )
              )}
            </div>

            <div className="pagination">
              <button className="page-btn" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>Previous</button>

              {pageNumbers.map((pageNumber) => (
                <button key={pageNumber} className={currentPage === pageNumber ? "page-btn active" : "page-btn"} onClick={() => goToPage(pageNumber)}>{pageNumber}</button>
              ))}

              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Products;
