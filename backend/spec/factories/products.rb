FactoryBot.define do
  factory :product do
    sequence(:name) { |n| "Product #{n} Name" }
    description { Faker::Lorem.sentence(word_count: 10) }
    price { Faker::Commerce.price(range: 1.0..999.99) }
    stock { Faker::Number.between(from: 0, to: 100) }
    sequence(:sku) { |n| "SKU#{n.to_s.rjust(5, '0')}" }
    active { true }

    trait :inactive do
      active { false }
    end

    trait :out_of_stock do
      stock { 0 }
    end
  end
end
