import "./Loader.css";

function Loader() {
  return (
    <div className="skeleton-grid">
      {[1, 2, 3, 4].map((item) => (
        <div className="skeleton-card" key={item}>
          <span></span>
          <p></p>
          <p></p>
          <button></button>
        </div>
      ))}
    </div>
  );
}

export default Loader;
