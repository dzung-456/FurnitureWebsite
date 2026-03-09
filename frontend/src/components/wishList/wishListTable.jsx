import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import wishlistService from "../../services/wishlistService";
import cartService from "../../services/cartService";

export function WishListTable() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyMmId, setBusyMmId] = useState(null); // busy item id

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
        loadWishlist();

        const refresh = () => loadWishlist();
        window.addEventListener("wishlist:updated", refresh);
        window.addEventListener("auth:changed", refresh);

        return () => {
            window.removeEventListener("wishlist:updated", refresh);
            window.removeEventListener("auth:changed", refresh);
        }
    }, [loadWishlist]);

    const normalizeImageUrl = (image) => {
        if (!image) return "";
        if (typeof image !== "string") return "";
        if (/^https?:\/\//i.test(image)) return image;
        if (image.startsWith("/")) return image;
        return `/uploads/products/${image}`;
    };

    const formatVnd = (val) => `${Number(val || 0).toLocaleString("vi-VN")}₫`;

    const handleAddToCart = async (product) => {
        if (!product?.id) return;
        setBusyMmId(product.id);
        try {
            await cartService.addItem(product.id, 1);
            // Optional: remove from wishlist after adding to cart?
            // await handleRemove(product.id); 
        } catch (err) {
            if (err?.code === "NOT_AUTHENTICATED") {
                navigate("/login");
                return;
            }
            console.error("Failed to add to cart", err);
        } finally {
            setBusyMmId(null);
        }
    }

    const handleRemove = async (productId) => {
        if (!productId) return;

        // Optimistic update
        setItems(prev => prev.filter(item => item?.product?.id !== productId));

        setBusyMmId(productId);
        try {
            await wishlistService.removeFromWishlistByProductId(productId);
        } catch (err) {
            console.error("Failed to remove wishlist item", err);
            alert("❌ Không thể xóa khỏi danh sách yêu thích");
            loadWishlist(); // Revert
        } finally {
            setBusyMmId(null);
        }
    };

    return (
        <div className="cart-area section-space">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="table-content table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="product-thumbnail">Ảnh</th>
                                        <th className="cart-product-name">Sản phẩm</th>
                                        <th className="product-price">Đơn giá</th>
                                        <th className="product-quantity">Trạng thái</th>
                                        <th className="product-subtotal">Thêm vào giỏ</th>
                                        <th className="product-remove">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center">
                                                Đang tải danh sách yêu thích...
                                            </td>
                                        </tr>
                                    ) : !wishlistService.isAuthenticated() ? (
                                        <tr>
                                            <td colSpan={6} className="text-center">
                                                Bạn cần đăng nhập để xem danh sách yêu thích.{" "}
                                                <button
                                                    type="button"
                                                    className="fill-btn"
                                                    onClick={() => navigate("/login")}
                                                >
                                                    <span className="fill-btn-inner">
                                                        <span className="fill-btn-normal">Đăng nhập</span>
                                                        <span className="fill-btn-hover">Đăng nhập</span>
                                                    </span>
                                                </button>
                                            </td>
                                        </tr>
                                    ) : items.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center">
                                                Danh sách yêu thích trống. <Link to="/shop">Mua sắm ngay</Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item) => {
                                            const product = item?.product;
                                            if (!product) return null; // Should not happen

                                            const imageUrl = normalizeImageUrl(product?.image);
                                            const price = product?.sale_price > 0 ? product.sale_price : product.price;
                                            const inStock = (product?.quantity || 0) > 0;

                                            return (
                                                <tr key={item.id}>
                                                    <td className="product-thumbnail">
                                                        <Link to={`/productDetail/${product.id}`}>
                                                            {imageUrl ? (
                                                                <img src={imageUrl} alt={product.name} />
                                                            ) : (
                                                                <span>—</span>
                                                            )}
                                                        </Link>
                                                    </td>
                                                    <td className="product-name">
                                                        <Link to={`/productDetail/${product.id}`}>
                                                            {product.name}
                                                        </Link>
                                                    </td>
                                                    <td className="product-price">
                                                        <span className="amount">{formatVnd(price)}</span>
                                                    </td>
                                                    <td className="product-quantity">
                                                        <span className={inStock ? "text-success" : "text-danger"}>
                                                            {inStock ? "Còn hàng" : "Hết hàng"}
                                                        </span>
                                                    </td>
                                                    <td className="product-subtotal">
                                                        <button
                                                            className="fill-btn"
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={!inStock || busyMmId === product.id}
                                                        >
                                                            <span className="fill-btn-inner">
                                                                <span className="fill-btn-normal">Thêm vào giỏ</span>
                                                                <span className="fill-btn-hover">Thêm vào giỏ</span>
                                                            </span>
                                                        </button>
                                                    </td>
                                                    <td className="product-remove">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemove(product.id)}
                                                            disabled={busyMmId === product.id}
                                                            style={{ background: "transparent", border: 0 }}
                                                            aria-label="Remove"
                                                        >
                                                            <i className="fa fa-times"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WishListTable;
