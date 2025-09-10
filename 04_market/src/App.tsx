import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Card,
  Descriptions,
  Tag,
  List,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { Product, ProductCreate, CartItem } from './services/api';
import { productApi, cartApi } from './services/api';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // Load products and cart on component mount
  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await cartApi.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productApi.getProducts();
      setProducts(data);
    } catch (error) {
      message.error('Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalVisible(true);
  };

  const handleView = async (productId: number) => {
    try {
      const product = await productApi.getProduct(productId);
      setSelectedProduct(product);
      setIsDetailModalVisible(true);
    } catch (error) {
      message.error('Failed to load product details');
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      await productApi.deleteProduct(productId);
      message.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const handleSubmit = async (values: ProductCreate) => {
    try {
      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, values);
        message.success('Product updated successfully');
      } else {
        await productApi.createProduct(values);
        message.success('Product created successfully');
      }
      setIsModalVisible(false);
      loadProducts();
    } catch (error) {
      message.error(`Failed to ${editingProduct ? 'update' : 'create'} product`);
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await cartApi.addToCart({ product_id: productId, quantity: 1 });
      message.success('Product added to cart');
      loadCart();
      loadProducts(); // Reload to update stock if needed
    } catch (error) {
      message.error('Failed to add product to cart');
    }
  };

  const handleRemoveFromCart = async (cartItemId: number) => {
    try {
      await cartApi.removeFromCart(cartItemId);
      message.success('Item removed from cart');
      loadCart();
    } catch (error) {
      message.error('Failed to remove item from cart');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartApi.clearCart();
      message.success('Cart cleared');
      loadCart();
    } catch (error) {
      message.error('Failed to clear cart');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock} units
        </Tag>
      ),
      sorter: (a: Product, b: Product) => a.stock - b.stock,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => 
        description ? (description.length > 50 ? `${description.substring(0, 50)}...` : description) : 'No description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddToCart(record.id)}
            title="Add to Cart"
            disabled={record.stock === 0}
            size="small"
          />
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
            title="View Details"
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit Product"
          />
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              title="Delete Product"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="header-content">
          <ShoppingOutlined className="logo-icon" />
          <Title level={2} className="header-title">Product Market</Title>
        </div>
      </Header>
      <Content className="content">
        <div className="content-container">
          <div className="page-header">
            <div>
              <Title level={3}>Product Management</Title>
              <p>Manage your product inventory with full CRUD operations</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="large"
            >
              Add New Product
            </Button>
          </div>

          <Card>
            <Table
              columns={columns}
              dataSource={products}
              rowKey="id"
              loading={loading}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} products`,
              }}
            />
          </Card>

          {/* Shopping Cart - Fixed position bottom left */}
          <div className="shopping-cart">
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    <ShoppingCartOutlined /> Shopping Cart ({cart.length})
                  </span>
                  {cart.length > 0 && (
                    <Button
                      type="link"
                      size="small"
                      icon={<ClearOutlined />}
                      onClick={handleClearCart}
                      title="Clear Cart"
                    />
                  )}
                </div>
              }
              size="small"
              style={{ width: 300, maxHeight: 400, overflow: 'auto' }}
            >
              {cart.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>Cart is empty</p>
              ) : (
                <List
                  size="small"
                  dataSource={cart}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveFromCart(item.id)}
                          title="Remove from cart"
                        />
                      ]}
                    >
                      <List.Item.Meta
                        title={item.product.name}
                        description={
                          <div>
                            <div>Quantity: {item.quantity}</div>
                            <div>${(item.product.price * item.quantity).toFixed(2)}</div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
              {cart.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                  <strong>
                    Total: ${cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
                  </strong>
                </div>
              )}
            </Card>
          </div>

          {/* Create/Edit Modal */}
          <Modal
            title={editingProduct ? 'Edit Product' : 'Create New Product'}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={600}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ stock: 0, price: 0 }}
            >
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>

              <Form.Item
                name="price"
                label="Price"
                rules={[
                  { required: true, message: 'Please enter price' },
                  { type: 'number', min: 0, message: 'Price must be positive' }
                ]}
              >
                <InputNumber
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  prefix="$"
                />
              </Form.Item>

              <Form.Item
                name="stock"
                label="Stock Quantity"
                rules={[
                  { required: true, message: 'Please enter stock quantity' },
                  { type: 'number', min: 0, message: 'Stock must be positive' }
                ]}
              >
                <InputNumber
                  placeholder="0"
                  min={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea
                  placeholder="Enter product description (optional)"
                  rows={4}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                  <Button onClick={() => setIsModalVisible(false)}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* Product Details Modal */}
          <Modal
            title="Product Details"
            open={isDetailModalVisible}
            onCancel={() => setIsDetailModalVisible(false)}
            footer={[
              <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                Close
              </Button>,
            ]}
            width={600}
          >
            {selectedProduct && (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="ID">{selectedProduct.id}</Descriptions.Item>
                <Descriptions.Item label="Name">
                  <strong>{selectedProduct.name}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  <span style={{ fontSize: '18px', color: '#1890ff' }}>
                    ${selectedProduct.price.toFixed(2)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Stock">
                  <Tag color={selectedProduct.stock > 10 ? 'green' : selectedProduct.stock > 0 ? 'orange' : 'red'}>
                    {selectedProduct.stock} units available
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {selectedProduct.description || 'No description provided'}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default App;
