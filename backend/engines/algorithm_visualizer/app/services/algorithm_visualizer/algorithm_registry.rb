module AlgorithmVisualizer
  module AlgorithmRegistry
    ALL = [
      Algorithms::BubbleSort,
      Algorithms::SelectionSort,
      Algorithms::InsertionSort,
      Algorithms::ShellSort,
      Algorithms::QuickSort,
      Algorithms::HeapSort
    ].freeze

    def self.find(name)
      ALL.find { |a| a::NAME == name }
    end
  end
end
