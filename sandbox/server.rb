#!/usr/bin/env ruby
# frozen_string_literal: true

require "socket"
require "json"
require "timeout"
require_relative "runner"

PORT = (ENV["SANDBOX_PORT"] || 3001).to_i
FORK_TIMEOUT = 5

$stdout.sync = true
puts "Sandbox server listening on port #{PORT}"

server = TCPServer.new("0.0.0.0", PORT)

def handle(conn)
  line = conn.gets
  request = JSON.parse(line)
  code = request["code"]
  input = request["input"]

  reader, writer = IO.pipe

  pid = fork do
    reader.close
    result = run_sort(code, input)
    writer.write(result.to_json)
    writer.close
    exit! 0
  end

  writer.close

  begin
    Timeout.timeout(FORK_TIMEOUT) { Process.waitpid(pid) }
    conn.puts(reader.read)
  rescue Timeout::Error
    Process.kill("KILL", pid)
    Process.waitpid(pid)
    conn.puts({ error: "Execution timed out (#{FORK_TIMEOUT}s limit)" }.to_json)
  ensure
    reader.close
    conn.close
  end
rescue => e
  conn.puts({ error: e.message }.to_json)
  conn.close
end

loop do
  client = server.accept
  Thread.new(client) { |conn| handle(conn) }
end
