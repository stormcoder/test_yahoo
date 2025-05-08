Feature: Cryptocurrency Filters
  As a user
  I want to view different cryptocurrency filter categories
  So that I can analyze market trends

  Background: 
    Given I am on the Yahoo Finance cryptocurrency page

  Scenario: View Most Active cryptocurrencies
    When I click on the "Most Active" filter
    Then I should see cryptocurrencies sorted by trading volume
    And the trading volume should be in descending order
    And the "Most Active" filter should be highlighted

  Scenario: View Top Gainers
    When I click on the "Top Gainers" filter
    Then I should see cryptocurrencies sorted by percentage gain
    And the percentage change should be positive
    And the percentage changes should be in descending order
    And the "Top Gainers" filter should be highlighted

  Scenario: View Top Losers
    When I click on the "Top Losers" filter
    Then I should see cryptocurrencies sorted by percentage loss
    And the percentage change should be negative
    And the percentage changes should be in ascending order
    And the "Top Losers" filter should be highlighted

  Scenario: View Trending Now
    When I click on the "Trending Now" filter
    Then I should see trending cryptocurrencies
    And each cryptocurrency should show recent price movement
    And the "Trending Now" filter should be highlighted

  Scenario: Filter persistence after page refresh
    When I click on the "Top Gainers" filter
    And I refresh the page
    Then the "Top Gainers" filter should remain selected
    And I should still see cryptocurrencies sorted by percentage gain

  Scenario: Switch between filters
    Given I am viewing the "Most Active" cryptocurrencies
    When I click on the "Top Losers" filter
    Then the view should switch to top losing cryptocurrencies
    And the "Top Losers" filter should be highlighted
    And the "Most Active" filter should not be highlighted