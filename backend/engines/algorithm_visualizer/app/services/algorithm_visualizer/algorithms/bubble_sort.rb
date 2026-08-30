module AlgorithmVisualizer
  module Algorithms
    module BubbleSort
      NAME = "bubble_sort"
      LABEL = "Bubble Sort"
      SOURCE = <<~RUBY
        def sort(arr)
          n = arr.length
          (n - 1).times do |i|
            (n - 1 - i).times do |j|
              arr.swap(j, j + 1) if arr.compare(j, j + 1) > 0
            end
          end
        end
      RUBY
    end
  end
end
