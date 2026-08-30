module AlgorithmVisualizer
  module Algorithms
    module HeapSort
      NAME = "heap_sort"
      LABEL = "Heap Sort"
      SOURCE = <<~RUBY
        def sort(arr)
          n = arr.length
          (n / 2 - 1).downto(0) { |i| heapify(arr, n, i) }
          (n - 1).downto(1) do |i|
            arr.swap(0, i)
            heapify(arr, i, 0)
          end
        end

        def heapify(arr, n, i)
          largest = i
          left = 2 * i + 1
          right = 2 * i + 2
          largest = left if left < n && arr.compare(left, largest) > 0
          largest = right if right < n && arr.compare(right, largest) > 0
          if largest != i
            arr.swap(i, largest)
            heapify(arr, n, largest)
          end
        end
      RUBY
    end
  end
end
