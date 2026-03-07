require 'rails_helper'

RSpec.describe Product, type: :model do
  subject(:product) { build(:product) }

  describe "validations" do
    it { is_expected.to be_valid }

    describe "name" do
      it "is required" do
        product.name = nil
        expect(product).not_to be_valid
        expect(product.errors[:name]).to include("can't be blank")
      end

      it "requires minimum 3 characters" do
        product.name = "AB"
        expect(product).not_to be_valid
        expect(product.errors[:name]).to include("is too short (minimum is 3 characters)")
      end

      it "allows exactly 3 characters" do
        product.name = "ABC"
        expect(product).to be_valid
      end

      it "rejects more than 100 characters" do
        product.name = "A" * 101
        expect(product).not_to be_valid
        expect(product.errors[:name]).to include("is too long (maximum is 100 characters)")
      end

      it "allows exactly 100 characters" do
        product.name = "A" * 100
        expect(product).to be_valid
      end
    end

    describe "description" do
      it "is optional" do
        product.description = nil
        expect(product).to be_valid
      end

      it "rejects more than 1000 characters" do
        product.description = "A" * 1001
        expect(product).not_to be_valid
        expect(product.errors[:description]).to include("is too long (maximum is 1000 characters)")
      end

      it "allows exactly 1000 characters" do
        product.description = "A" * 1000
        expect(product).to be_valid
      end
    end

    describe "price" do
      it "is required" do
        product.price = nil
        expect(product).not_to be_valid
        expect(product.errors[:price]).to include("can't be blank")
      end

      it "must be greater than 0" do
        product.price = 0
        expect(product).not_to be_valid
        expect(product.errors[:price]).to include("must be greater than 0")
      end

      it "rejects negative values" do
        product.price = -1
        expect(product).not_to be_valid
      end

      it "accepts decimal values" do
        product.price = 9.99
        expect(product).to be_valid
      end
    end

    describe "stock" do
      it "is required" do
        product.stock = nil
        expect(product).not_to be_valid
        expect(product.errors[:stock]).to include("can't be blank")
      end

      it "cannot be negative" do
        product.stock = -1
        expect(product).not_to be_valid
        expect(product.errors[:stock]).to include("must be greater than or equal to 0")
      end

      it "allows 0" do
        product.stock = 0
        expect(product).to be_valid
      end

      it "must be an integer" do
        product.stock = 1.5
        expect(product).not_to be_valid
      end
    end

    describe "sku" do
      it "is required" do
        product.sku = nil
        expect(product).not_to be_valid
        expect(product.errors[:sku]).to include("can't be blank")
      end

      it "must be unique" do
        create(:product, sku: "UNIQUE01")
        product.sku = "UNIQUE01"
        expect(product).not_to be_valid
        expect(product.errors[:sku]).to include("has already been taken")
      end

      it "only allows uppercase letters and numbers" do
        product.sku = "abc123"
        expect(product).not_to be_valid
        expect(product.errors[:sku]).to include("only uppercase letters and numbers")
      end

      it "rejects special characters" do
        product.sku = "SKU-001"
        expect(product).not_to be_valid
      end

      it "accepts valid SKU" do
        product.sku = "SKU001ABC"
        expect(product).to be_valid
      end
    end

    describe "active" do
      it "defaults to true" do
        expect(Product.new.active).to be true
      end

      it "accepts false" do
        product.active = false
        expect(product).to be_valid
      end
    end
  end

  describe "scopes" do
    let!(:active_product)   { create(:product) }
    let!(:inactive_product) { create(:product, :inactive) }

    describe ".active_products" do
      it "returns only active products" do
        expect(Product.active_products).to include(active_product)
        expect(Product.active_products).not_to include(inactive_product)
      end
    end

    describe ".inactive_products" do
      it "returns only inactive products" do
        expect(Product.inactive_products).to include(inactive_product)
        expect(Product.inactive_products).not_to include(active_product)
      end
    end

    describe ".by_status" do
      it "returns active products when status is 'active'" do
        expect(Product.by_status("active")).to include(active_product)
        expect(Product.by_status("active")).not_to include(inactive_product)
      end

      it "returns inactive products when status is 'inactive'" do
        expect(Product.by_status("inactive")).to include(inactive_product)
        expect(Product.by_status("inactive")).not_to include(active_product)
      end

      it "returns all products when status is nil" do
        expect(Product.by_status(nil)).to include(active_product, inactive_product)
      end
    end

    describe ".search_by_name" do
      let!(:laptop) { create(:product, name: "Laptop Pro") }
      let!(:mouse)  { create(:product, name: "Wireless Mouse") }

      it "finds products by partial name (case insensitive)" do
        expect(Product.search_by_name("laptop")).to include(laptop)
        expect(Product.search_by_name("laptop")).not_to include(mouse)
      end

      it "returns all when query is blank" do
        expect(Product.search_by_name("")).to include(laptop, mouse)
        expect(Product.search_by_name(nil)).to include(laptop, mouse)
      end
    end
  end

  describe "soft delete" do
    let!(:product) { create(:product) }

    it "is not discarded by default" do
      expect(product.discarded?).to be false
    end

    it "sets discarded_at when discarded" do
      product.discard
      expect(product.discarded_at).not_to be_nil
    end

    it "is excluded from default queries after discard" do
      product.discard
      expect(Product.find_by(id: product.id)).to be_nil
    end

    it "is visible via with_discarded after discard" do
      product.discard
      expect(Product.with_discarded.find_by(id: product.id)).not_to be_nil
    end

    it "clears discarded_at when restored" do
      product.discard
      product.undiscard
      expect(product.discarded_at).to be_nil
      expect(Product.find_by(id: product.id)).not_to be_nil
    end

    it "allows reuse of SKU after soft delete" do
      sku = product.sku
      product.discard
      new_product = build(:product, sku: sku)
      expect(new_product).to be_valid
    end
  end
end
