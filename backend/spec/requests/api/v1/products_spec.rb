require 'rails_helper'

RSpec.describe "Api::V1::Products", type: :request do
  let(:valid_attributes) do
    {
      name: "Test Product",
      description: "A test product description",
      price: 99.99,
      stock: 10,
      sku: "TST001",
      active: true
    }
  end

  let(:invalid_attributes) do
    { name: "AB", price: -1, stock: -5, sku: "invalid sku" }
  end

  describe "GET /api/v1/products" do
    it "returns a successful response" do
      get "/api/v1/products"
      expect(response).to have_http_status(:ok)
    end

    it "returns products with pagination metadata" do
      create_list(:product, 3)
      get "/api/v1/products"
      json = JSON.parse(response.body)
      expect(json).to have_key("products")
      expect(json).to have_key("pagination")
    end

    it "paginates results (10 per page by default)" do
      create_list(:product, 12)
      get "/api/v1/products"
      json = JSON.parse(response.body)
      expect(json["products"].length).to eq(10)
      expect(json["pagination"]["total_count"]).to eq(12)
      expect(json["pagination"]["total_pages"]).to eq(2)
    end

    it "respects per_page param" do
      create_list(:product, 5)
      get "/api/v1/products", params: { per_page: 3 }
      json = JSON.parse(response.body)
      expect(json["products"].length).to eq(3)
    end

    it "filters by active status" do
      create(:product, active: true)
      create(:product, :inactive)
      get "/api/v1/products", params: { status: "active" }
      json = JSON.parse(response.body)
      expect(json["products"].all? { |p| p["active"] == true }).to be true
    end

    it "filters by inactive status" do
      create(:product, active: true)
      create(:product, :inactive)
      get "/api/v1/products", params: { status: "inactive" }
      json = JSON.parse(response.body)
      expect(json["products"].all? { |p| p["active"] == false }).to be true
    end

    it "searches by name" do
      create(:product, name: "Laptop Pro")
      create(:product, name: "Wireless Mouse")
      get "/api/v1/products", params: { search: "Laptop" }
      json = JSON.parse(response.body)
      expect(json["products"].length).to eq(1)
      expect(json["products"].first["name"]).to eq("Laptop Pro")
    end

    it "search is case insensitive" do
      create(:product, name: "Laptop Pro")
      get "/api/v1/products", params: { search: "laptop" }
      json = JSON.parse(response.body)
      expect(json["products"].length).to eq(1)
    end
  end

  describe "GET /api/v1/products/:id" do
    let!(:product) { create(:product) }

    it "returns the product" do
      get "/api/v1/products/#{product.id}"
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["id"]).to eq(product.id)
      expect(json["name"]).to eq(product.name)
    end

    it "returns 404 for non-existent product" do
      get "/api/v1/products/99999"
      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json["error"]).to eq("Record not found")
    end
  end

  describe "POST /api/v1/products" do
    context "with valid attributes" do
      it "creates a product and returns 201" do
        expect {
          post "/api/v1/products", params: { product: valid_attributes }
        }.to change(Product, :count).by(1)
        expect(response).to have_http_status(:created)
      end

      it "returns the created product" do
        post "/api/v1/products", params: { product: valid_attributes }
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Test Product")
        expect(json["sku"]).to eq("TST001")
      end
    end

    context "with invalid attributes" do
      it "returns 422 and error messages" do
        expect {
          post "/api/v1/products", params: { product: invalid_attributes }
        }.not_to change(Product, :count)
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json).to have_key("errors")
        expect(json["errors"]).not_to be_empty
      end
    end

    context "with duplicate SKU" do
      it "returns 422" do
        create(:product, sku: "DUP001")
        post "/api/v1/products", params: { product: valid_attributes.merge(sku: "DUP001") }
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"].join).to include("Sku")
      end
    end
  end

  describe "PUT /api/v1/products/:id" do
    let!(:product) { create(:product) }

    context "with valid attributes" do
      it "updates the product" do
        put "/api/v1/products/#{product.id}", params: { product: { name: "Updated Name" } }
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Updated Name")
      end
    end

    context "with invalid attributes" do
      it "returns 422" do
        put "/api/v1/products/#{product.id}", params: { product: { price: -10 } }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    it "returns 404 for non-existent product" do
      put "/api/v1/products/99999", params: { product: { name: "X" } }
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/products/:id (soft delete)" do
    let!(:product) { create(:product) }

    it "soft deletes the product (does not remove from DB) and returns 204" do
      expect {
        delete "/api/v1/products/#{product.id}"
      }.not_to change(Product.with_discarded, :count)
      expect(response).to have_http_status(:no_content)
    end

    it "hides soft-deleted product from normal queries" do
      delete "/api/v1/products/#{product.id}"
      expect(Product.find_by(id: product.id)).to be_nil
      expect(Product.with_discarded.find_by(id: product.id)).not_to be_nil
    end

    it "sets discarded_at timestamp" do
      delete "/api/v1/products/#{product.id}"
      expect(product.reload.discarded_at).not_to be_nil
    end

    it "returns 404 for non-existent product" do
      delete "/api/v1/products/99999"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "PUT /api/v1/products/:id/restore" do
    let!(:product) { create(:product).tap(&:discard) }

    it "restores the product and returns 200" do
      put "/api/v1/products/#{product.id}/restore"
      expect(response).to have_http_status(:ok)
      expect(product.reload.discarded_at).to be_nil
    end

    it "makes the product visible again in normal queries" do
      put "/api/v1/products/#{product.id}/restore"
      expect(Product.find_by(id: product.id)).not_to be_nil
    end

    it "returns 422 when trying to restore a non-deleted product" do
      active = create(:product)
      put "/api/v1/products/#{active.id}/restore"
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "returns 404 for non-existent product" do
      put "/api/v1/products/99999/restore"
      expect(response).to have_http_status(:not_found)
    end
  end
end
