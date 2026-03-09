import React, { useEffect, useState, useMemo, useCallback } from "react";
import ProductCards from "../products/productCards";
import wishlistService from "../../services/wishlistService";
import { Link, useNavigate } from "react-router-dom";

export function WishListArea() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Helper to normalize search text
    const normalizeText = (value) => {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "d")
            .toLowerCase()
            .trim();
    };

    const loadWishlist = useCallback(async () => {
        if (!wishlistService.isAuthenticated()) {
            setItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await wishlistService.getWishlist();
            const list = res?.data || [];
            setItems(Array.isArray(list) ? list : []);
        } catch (err) {
            if (err?.code === "NOT_AUTHENTICATED") {
                setItems([]);
            } else {
                console.error("Failed to load wishlist", err);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadWishlist(); // Initial load

        const refresh = () => loadWishlist();
        // Listen for updates (e.g. when user toggles heart in ProductCard)
        window.addEventListener("wishlist:updated", refresh);
        window.addEventListener("auth:changed", refresh);

        return () => {
            window.removeEventListener("wishlist:updated", refresh);
            window.removeEventListener("auth:changed", refresh);
        };
    }, [loadWishlist]);

    // Filter items based on search term
    const filteredItems = useMemo(() => {
        const term = normalizeText(searchTerm);
        if (!term) return items;
        return items.filter((item) =>
            normalizeText(item?.product?.name).includes(term)
        );
    }, [items, searchTerm]);

    return (
        <section className="bd-product__area section-space">
            <div className="container">
                {/* Header Section: Count & Search */}
                <div className="row">
                    <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6">
                        <div className="bd-product__result mb-30">
                            <h4>{filteredItems.length} Sản phẩm trong danh sách</h4>
                        </div>
                    </div>
                    <div className="col-xxl-6 col-xl-6 col-lg-6 col-md-6">
                        <div className="product__filter-wrapper d-flex flex-wrap gap-3 align-items-center justify-content-md-end mb-30">
                            {filteredItems.length > 0 && (
                                <div className="bd-product__filter-btn">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?")) {
                                                try {
                                                    setLoading(true);
                                                    // Loop deletion since backend lacks clear-all endpoint
                                                    for (const item of filteredItems) {
                                                        if (item?.product?.id) {
                                                            try {
                                                                await wishlistService.removeFromWishlistByProductId(item.product.id);
                                                            } catch (err) {
                                                                console.error(`Failed to remove item ${item.product.id}`, err);
                                                            }
                                                        }
                                                    }
                                                    // Refresh list after clearing
                                                    await loadWishlist();
                                                } catch (e) {
                                                    console.error(e);
                                                    alert("Có lỗi xảy ra khi xóa danh sách.");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        }}
                                        className="btn-link text-danger border-0 bg-transparent p-0 me-3"
                                        style={{ textDecoration: "none", fontWeight: 500 }}
                                    >
                                        <i className="fa-regular fa-trash-can"></i> Xóa tất cả
                                    </button>
                                </div>
                            )}
                            <div className="header-search">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button type="button" aria-label="Tìm kiếm">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="row">
                    <div className="col-xxl-12">
                        {!wishlistService.isAuthenticated() ? (
                            <div className="text-center py-5">
                                <p>Bạn cần đăng nhập để xem danh sách yêu thích.</p>
                                <button
                                    className="fill-btn"
                                    onClick={() => navigate("/login")}
                                >
                                    <span className="fill-btn-inner">
                                        <span className="fill-btn-normal">Đăng nhập ngay</span>
                                        <span className="fill-btn-hover">Đăng nhập ngay</span>
                                    </span>
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="text-center py-5">Đang tải...</div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-5">
                                <p>
                                    {searchTerm
                                        ? "Không tìm thấy sản phẩm nào."
                                        : "Danh sách yêu thích trống."}
                                </p>
                                {!searchTerm && (
                                    <Link to="/productsList" className="fill-btn">
                                        <span className="fill-btn-inner">
                                            <span className="fill-btn-normal">Mua sắm ngay</span>
                                            <span className="fill-btn-hover">Mua sắm ngay</span>
                                        </span>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="row g-5">
                                {filteredItems.map((item) => {
                                    if (!item?.product) return null;
                                    return (
                                        <div
                                            key={item.id}
                                            className="col-xxl-3 col-xl-4 col-lg-4 col-md-6"
                                        >
                                            <ProductCards product={item.product} initialWishlisted={true} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default WishListArea;
