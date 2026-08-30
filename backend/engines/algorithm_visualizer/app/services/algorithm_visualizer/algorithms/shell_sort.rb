module AlgorithmVisualizer
  module Algorithms
    module ShellSort
      NAME = "shell_sort"
      LABEL = "Shell Sort"
      SOURCE = <<~RUBY
        def sort(arr)
          length = arr.length
          gap = length / 2
          while gap > 0
            (gap...length).each do |index|
              position = index
              while position >= gap && arr.compare(position - gap, position) > 0
                arr.swap(position - gap, position)
                position -= gap
              end
            end
            gap /= 2
          end
        end
      RUBY
    end
  end
end
