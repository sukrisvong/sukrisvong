module AlgorithmVisualizer
  module Algorithms
    module SelectionSort
      NAME = "selection_sort"
      LABEL = "Selection Sort"
      SOURCE = <<~RUBY
        def sort(arr)
          n = arr.length
          n.times do |i|
            min = i
            (i + 1...n).each do |j|
              min = j if arr.compare(j, min) < 0
            end
            arr.swap(i, min) if min != i
          end
        end
      RUBY
    end
  end
end
