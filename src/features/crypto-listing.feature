Feature: Yahoo Finance Cryptocurrency Page
  As a user
  I want to view and interact with cryptocurrency listings
  So that I can make informed investment decisions

  Background: 
    Given I am on the Yahoo Finance cryptocurrency page

  Scenario: View cryptocurrency listings
    Then I should see the cryptocurrency screener
    And I should see the table headers
      | Symbol | Name | Price | Change | Change % | Market Cap |

  Scenario: Check cryptocurrency data display
    Then I should see at least one cryptocurrency row
    And each row should contain valid data
      | symbol | price | marketCap |

  Scenario: Sort cryptocurrencies by market cap
    When I click the market cap header
    Then the cryptocurrencies should be sorted by market cap in descending order

  Scenario: Filter cryptocurrencies
    When I enter "Bitcoin" in the search filter
    Then I should only see cryptocurrencies containing "Bitcoin"

  Scenario: Real-time price updates
    When I wait for 30 seconds
    Then the cryptocurrency prices should be updated

  Scenario: Error handling
    Given the API is not responding
    When I refresh the page
    Then I should see an error message

  Scenario: Mobile responsive design
    When I view the page on a mobile device
    Then I should see the mobile menu
    And the table should be scrollable

  Scenario: Search by cryptocurrency symbol
    When I enter "BTC" in the search filter
    Then I should only see cryptocurrencies with symbol "BTC"
    And the search results should be displayed immediately

  Scenario: Search by cryptocurrency name
    When I enter "Ethereum" in the search filter
    Then I should only see cryptocurrencies containing "Ethereum"
    And the results should include variations like "Ethereum Classic"

  # Scenario: Search with partial text
  #   When I enter "bit" in the search filter
  #   Then I should see cryptocurrencies containing "Bit"
  #   And the results should include "bitcoin" and "bitcash"

  # Scenario: Search with special characters
  #   When I enter "^" in the search filter
  #   Then I should see an empty result set
  #   And I should see a "No results found" message

  # Scenario: Clear search results
  #   Given I have entered "Bitcoin" in the search filter
  #   When I click the clear search button
  #   Then I should see all cryptocurrencies
  #   And the search input should be empty

  # Scenario: Search with minimum characters
  #   When I enter "b" in the search filter
  #   Then I should see a message requesting more characters
  #   And when I enter "bi" the search should execute

  # Scenario: Case insensitive search
  #   When I enter "bitcoin" in lowercase in the search filter
  #   Then I should see results containing "Bitcoin"
  #   When I enter "BITCOIN" in uppercase in the search filter
  #   Then I should see the same results

  # Scenario: Search persistence after page refresh
  #   Given I have entered "Bitcoin" in the search filter
  #   When I refresh the page
  #   Then the search term "Bitcoin" should still be applied
  #   And I should see the filtered results