module AlgorithmVisualizer
  module Algorithms
    module QuickSort
      NAME = "quick_sort"
      LABEL = "Quick Sort"
      SOURCE = <<~RUBY
        def sort(arr, low = 0, high = arr.length - 1)
          return if low >= high
          pivot_index = partition(arr, low, high)
          sort(arr, low, pivot_index - 1)
          sort(arr, pivot_index + 1, high)
        end

        def partition(arr, low, high)
          last_swapped = low - 1
          (low...high).each do |candidate|
            if arr.compare(candidate, high) <= 0
              last_swapped += 1
              arr.swap(last_swapped, candidate)
            end
          end
          arr.swap(last_swapped + 1, high)
          last_swapped + 1
        end
      RUBY
    end
  end
end
