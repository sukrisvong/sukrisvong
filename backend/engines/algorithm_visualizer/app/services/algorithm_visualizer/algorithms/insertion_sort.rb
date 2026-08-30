module AlgorithmVisualizer
  module Algorithms
    module InsertionSort
      NAME = "insertion_sort"
      LABEL = "Insertion Sort"
      SOURCE = <<~RUBY
        def sort(arr)
          n = arr.length
          (1...n).each do |i|
            j = i
            while j > 0 && arr.compare(j - 1, j) > 0
              arr.swap(j - 1, j)
              j -= 1
            end
          end
        end
      RUBY
    end
  end
end
