puts "Cleaning existing products..."
Product.destroy_all

puts "Creating products..."

products = [
  { name: "Laptop Pro 15", description: "High performance laptop with 16GB RAM and 512GB SSD", price: 1299.99, stock: 25, sku: "LAP001", active: true },
  { name: "Wireless Mouse", description: "Ergonomic wireless mouse with long battery life", price: 29.99, stock: 150, sku: "MOU002", active: true },
  { name: "Mechanical Keyboard", description: "RGB mechanical keyboard with cherry MX switches", price: 89.99, stock: 60, sku: "KEY003", active: true },
  { name: "4K Monitor", description: "27-inch 4K UHD monitor with HDR support", price: 449.99, stock: 30, sku: "MON004", active: true },
  { name: "USB-C Hub", description: "7-in-1 USB-C hub with HDMI, USB 3.0 and SD card reader", price: 49.99, stock: 200, sku: "HUB005", active: true },
  { name: "Webcam HD", description: "1080p HD webcam with built-in microphone", price: 79.99, stock: 85, sku: "CAM006", active: true },
  { name: "Noise Cancelling Headphones", description: "Over-ear headphones with active noise cancellation", price: 199.99, stock: 40, sku: "HEAD007", active: true },
  { name: "External SSD 1TB", description: "Portable external SSD with USB 3.2 gen 2 interface", price: 119.99, stock: 70, sku: "SSD008", active: true },
  { name: "Standing Desk Mat", description: "Anti-fatigue standing desk mat, 90x60cm", price: 39.99, stock: 0, sku: "MAT009", active: false },
  { name: "Laptop Stand", description: "Adjustable aluminum laptop stand for better ergonomics", price: 34.99, stock: 120, sku: "STD010", active: true },
  { name: "Cable Management Box", description: "Desktop cable organizer box with multiple outlets", price: 24.99, stock: 90, sku: "CBL011", active: true },
  { name: "Smart Power Strip", description: "WiFi-enabled power strip with individual outlet control", price: 54.99, stock: 45, sku: "PWR012", active: false },
  { name: "Desk Lamp LED", description: "Dimmable LED desk lamp with USB charging port", price: 44.99, stock: 110, sku: "LMP013", active: true },
  { name: "Wrist Rest Pad", description: "Memory foam wrist rest for keyboard and mouse", price: 19.99, stock: 200, sku: "WRS014", active: true },
  { name: "Mini PC", description: "Compact mini PC with Intel Core i5, 8GB RAM", price: 499.99, stock: 15, sku: "MPC015", active: true }
]

products.each do |attrs|
  Product.create!(attrs)
end

puts "Created #{Product.count} products (#{Product.where(active: true).count} active, #{Product.where(active: false).count} inactive)"
