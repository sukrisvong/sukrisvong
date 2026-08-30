module AlgorithmVisualizer
  module Algorithms
    module SelectionSort
      NAME = "selection_sort"
      LABEL = "Selection Sort"
      SOURCE = <<~RUBY
        def sort(arr)
          length = arr.length
          length.times do |sorted_boundary|
            min_index = sorted_boundary
            (sorted_boundary + 1...length).each do |candidate|
              min_index = candidate if arr.compare(candidate, min_index) < 0
            end
            arr.swap(sorted_boundary, min_index) if min_index != sorted_boundary
          end
        end
      RUBY
    end
  end
end
