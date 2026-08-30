module AlgorithmVisualizer
  module Algorithms
    module ShellSort
      NAME = "shell_sort"
      LABEL = "Shell Sort"
      SOURCE = <<~RUBY
        def sort(arr)
          n = arr.length
          gap = n / 2
          while gap > 0
            (gap...n).each do |i|
              j = i
              while j >= gap && arr.compare(j - gap, j) > 0
                arr.swap(j - gap, j)
                j -= gap
              end
            end
            gap /= 2
          end
        end
      RUBY
    end
  end
end
