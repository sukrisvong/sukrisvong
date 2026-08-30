module AlgorithmVisualizer
  class TrackedArray
    attr_reader :steps, :comparison_count, :swap_count

    def initialize(data)
      @data = data.dup
      @steps = []
      @comparison_count = 0
      @swap_count = 0
    end

    def [](index)
      @data[index]
    end

    def []=(index, value)
      @data[index] = value
    end

    def compare(i, j)
      @comparison_count += 1
      @steps << { type: "compare", indices: [i, j], array: @data.dup }
      @data[i] <=> @data[j]
    end

    def swap(i, j)
      @swap_count += 1
      @data[i], @data[j] = @data[j], @data[i]
      @steps << { type: "swap", indices: [i, j], array: @data.dup }
    end

    def length
      @data.length
    end

    def size
      @data.size
    end

    def to_a
      @data.dup
    end
  end
end
