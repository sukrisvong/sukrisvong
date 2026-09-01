module AlgorithmVisualizer
  module Algorithms
    module HeapSort
      NAME = "heap_sort"
      LABEL = "Heap Sort"
      SOURCE = <<~RUBY
        def sort(arr)
          length = arr.length
          (length / 2 - 1).downto(0) { |root| heapify(arr, length, root) }
          (length - 1).downto(1) do |heap_end|
            arr.swap(0, heap_end)
            heapify(arr, heap_end, 0)
          end
        end

        def heapify(arr, heap_size, root)
          largest = root
          left_child = 2 * root + 1
          right_child = 2 * root + 2
          largest = left_child if left_child < heap_size && arr.compare(left_child, largest) > 0
          largest = right_child if right_child < heap_size && arr.compare(right_child, largest) > 0
          if largest != root
            arr.swap(root, largest)
            heapify(arr, heap_size, largest)
          end
        end
      RUBY
    end
  end
end
