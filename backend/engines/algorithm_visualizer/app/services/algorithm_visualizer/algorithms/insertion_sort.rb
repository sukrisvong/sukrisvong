module AlgorithmVisualizer
  module Algorithms
    module InsertionSort
      NAME = "insertion_sort"
      LABEL = "Insertion Sort"
      SOURCE = <<~RUBY
        def sort(arr)
          length = arr.length
          (1...length).each do |unsorted_start|
            position = unsorted_start
            while position > 0 && arr.compare(position - 1, position) > 0
              arr.swap(position - 1, position)
              position -= 1
            end
          end
        end
      RUBY
    end
  end
end
