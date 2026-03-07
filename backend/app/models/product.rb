class Product < ApplicationRecord
  include Discard::Model

  # Exclude discarded records from all queries by default
  default_scope -> { kept }

  validates :name,        presence: true, length: { minimum: 3, maximum: 100 }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :price,       presence: true, numericality: { greater_than: 0 }
  validates :stock,       presence: true, numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validates :sku,         presence: true,
                          uniqueness: { conditions: -> { kept } },
                          format: { with: /\A[A-Z0-9]+\z/, message: "only uppercase letters and numbers" }

  scope :active_products,   -> { where(active: true) }
  scope :inactive_products, -> { where(active: false) }
  scope :search_by_name,    ->(query) { where("name ILIKE ?", "%#{sanitize_sql_like(query)}%") if query.present? }
  scope :by_status, ->(status) {
    case status
    when "active"   then active_products
    when "inactive" then inactive_products
    end
  }
end
