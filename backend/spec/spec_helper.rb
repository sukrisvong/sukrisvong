require "simplecov"

SimpleCov.start "rails" do
  enable_coverage :branch

  minimum_coverage line: 100, branch: 100

  skip "/spec/"
  skip "/engines/.*/spec/"
  skip "/engines/.*/lib/.*/(version|engine)\\.rb"
  skip "/engines/.*/test/"

  # Rails boilerplate with no app logic
  skip "app/controllers/application_controller.rb"
  skip "app/jobs/application_job.rb"
  skip "app/mailers/application_mailer.rb"
  skip "app/models/application_record.rb"
end

RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups
end
