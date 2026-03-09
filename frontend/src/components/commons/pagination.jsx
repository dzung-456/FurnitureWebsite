import React from "react";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange?.(page);
  };

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <div className="bd-basic__pagination  mb-50 d-flex align-items-center justify-content-center">
      <nav>
        <ul>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToPage(currentPage - 1);
              }}
              aria-disabled={currentPage === 1}
            >
              <i className="fa-regular fa-angle-left"></i>
            </a>
          </li>

          {pages.map((p) => (
            <li key={p}>
              {p === currentPage ? (
                <span className="current">{p}</span>
              ) : (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(p);
                  }}
                >
                  {p}
                </a>
              )}
            </li>
          ))}

          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToPage(currentPage + 1);
              }}
              aria-disabled={currentPage === totalPages}
            >
              <i className="fa-regular fa-angle-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
export default Pagination;
