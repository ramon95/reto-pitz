module Api
  module V1
    class ProductsController < ApplicationController
      before_action :set_product,          only: [:show, :update, :destroy]
      before_action :set_discarded_product, only: [:restore]

      def index
        products = Product.all
                          .search_by_name(params[:search])
                          .by_status(params[:status])

        records, pagination = paginate(products)

        render json: { products: records, pagination: pagination }
      end

      def show
        render json: @product
      end

      def create
        @product = Product.new(product_params)

        if @product.save
          render json: @product, status: :created
        else
          render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @product.update(product_params)
          render json: @product
        else
          render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @product.discard
        head :no_content
      end

      def restore
        @product.undiscard
        render json: @product
      end

      private

      def set_product
        @product = Product.find(params[:id])
      end

      # Restore needs to find discarded records (bypasses default_scope)
      def set_discarded_product
        @product = Product.with_discarded.find(params[:id])
        render json: { error: "Product is not deleted" }, status: :unprocessable_entity unless @product.discarded?
      end

      def product_params
        params.require(:product).permit(:name, :description, :price, :stock, :sku, :active)
      end
    end
  end
end
