module AlgorithmVisualizer
  module Algorithms
    module QuickSort
      NAME = "quick_sort"
      LABEL = "Quick Sort"
      SOURCE = <<~RUBY
        def sort(arr, low = 0, high = arr.length - 1)
          return if low >= high
          pivot = partition(arr, low, high)
          sort(arr, low, pivot - 1)
          sort(arr, pivot + 1, high)
        end

        def partition(arr, low, high)
          i = low - 1
          (low...high).each do |j|
            if arr.compare(j, high) <= 0
              i += 1
              arr.swap(i, j)
            end
          end
          arr.swap(i + 1, high)
          i + 1
        end
      RUBY
    end
  end
end
