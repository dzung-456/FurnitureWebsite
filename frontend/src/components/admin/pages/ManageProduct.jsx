import React, { useState, useEffect } from "react";
import ProductHeader from "../manage_product/ProductHeader";
import ProductControls from "../manage_product/ProductControls";
import ProductTable from "../manage_product/ProductTable";
import Pagination from "../manage_product/Pagination";
import AddProduct from "../manage_product/AddProduct";
import EditProduct from "../manage_product/EditProduct";
import ViewProduct from "../manage_product/ViewProduct";
import productService from "../../../services/productService";
import categoryService from "../../../services/categoryService";
import "./ManageProduct.css";

const ManageProduct = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [viewingProductId, setViewingProductId] = useState(null);

  const ITEMS_PER_PAGE = 5;

  // Lấy dữ liệu từ API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
      setCategories([]);
    }
  };

  const handleAddProduct = () => {
    setShowAddForm(true);
  };

  const handleSubmitProduct = async (productData, imageFile) => {
    try {
      await productService.createProduct(productData, imageFile);
      setShowAddForm(false);
      fetchProducts();
      alert("Thêm sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert("Thêm sản phẩm thất bại!");
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleViewProduct = (id) => {
    setViewingProductId(id);
  };

  const handleCloseView = () => {
    setViewingProductId(null);
  };

  const handleEditProduct = (id) => {
    setViewingProductId(null);
    setEditingProductId(id);
  };

  const handleSubmitEdit = async (productData, imageFile) => {
    try {
      await productService.updateProduct(
        editingProductId,
        productData,
        imageFile
      );
      setEditingProductId(null);
      fetchProducts();
      alert("Cập nhật sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      alert("Cập nhật sản phẩm thất bại!");
    }
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  const handleDeleteProduct = async (id) => {
    // Confirmation dialog to prevent accidental deletion
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác!"
      )
    ) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      setViewingProductId(null);
      fetchProducts();
      alert("Xóa sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      alert("Xóa sản phẩm thất bại!");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory =
      !categoryFilter || String(product.category_id) === categoryFilter;
    // Lọc theo trạng thái dựa vào quantity
    let matchStatus = true;
    if (statusFilter === "in_stock") {
      matchStatus = product.quantity > 0;
    } else if (statusFilter === "out_of_stock") {
      matchStatus = product.quantity === 0;
    }
    return matchSearch && matchCategory && matchStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  if (loading) {
    return (
      <div className="manage-product">
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ fontSize: "1.2rem", color: "#667eea" }}>
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="manage-product">
        <AddProduct onSubmit={handleSubmitProduct} onCancel={handleCancelAdd} />
      </div>
    );
  }

  if (viewingProductId) {
    return (
      <div className="manage-product">
        <ViewProduct
          productId={viewingProductId}
          onClose={handleCloseView}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      </div>
    );
  }

  if (editingProductId) {
    return (
      <div className="manage-product">
        <EditProduct
          productId={editingProductId}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="manage-product">
      <ProductHeader onAddClick={handleAddProduct} />
      <ProductControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      <ProductTable
        products={currentProducts}
        onView={handleViewProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ManageProduct;
