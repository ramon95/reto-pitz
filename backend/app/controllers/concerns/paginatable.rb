module Paginatable
  extend ActiveSupport::Concern

  def paginate(collection)
    per_page = (params[:per_page] || 10).to_i.clamp(1, 100)
    page     = [(params[:page] || 1).to_i, 1].max

    total_count = collection.count
    total_pages = (total_count.to_f / per_page).ceil

    records = collection.limit(per_page).offset((page - 1) * per_page)

    pagination = {
      current_page: page,
      per_page:     per_page,
      total_count:  total_count,
      total_pages:  total_pages,
      next_page:    page < total_pages ? page + 1 : nil,
      prev_page:    page > 1 ? page - 1 : nil
    }

    [records, pagination]
  end
end
