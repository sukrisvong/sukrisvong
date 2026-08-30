module AlgorithmVisualizer
  module Algorithms
    module BubbleSort
      NAME = "bubble_sort"
      LABEL = "Bubble Sort"
      SOURCE = <<~RUBY
        def sort(arr)
          length = arr.length
          (length - 1).times do |pass|
            (length - 1 - pass).times do |index|
              arr.swap(index, index + 1) if arr.compare(index, index + 1) > 0
            end
          end
        end
      RUBY
    end
  end
end
