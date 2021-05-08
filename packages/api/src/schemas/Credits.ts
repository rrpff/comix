import { gql } from 'graphql-tag'

export default gql`
  type LibraryCreditCharacter {
    type: String!
    source: String!
    sourceId: String!
    name: String
    issues: [LibraryIssue!]
  }

  type LibraryCreditConcept {
    type: String!
    source: String!
    sourceId: String!
    name: String
    issues: [LibraryIssue!]
  }

  type LibraryCreditLocation {
    type: String!
    source: String!
    sourceId: String!
    name: String
    issues: [LibraryIssue!]
  }

  type LibraryCreditObject {
    type: String!
    source: String!
    sourceId: String!
    name: String
    issues: [LibraryIssue!]
  }

  type LibraryCreditPerson {
    type: String!
    source: String!
    sourceId: String!
    name: String
    issues: [LibraryIssue!]
    roles: [String!]!
  }

  type LibraryCreditStoryArc {
    type: String!
    source: String!
    sourceId: String!
    name: String
    issues: [LibraryIssue!]
  }

  type LibraryCreditTeam {
    type: String!
    source: String!
    sourceId: String!
    name: String
    issues: [LibraryIssue!]
  }

  input CreditInput {
    source: String!
    sourceId: String!
  }

  input CreditQuery {
    collection: String!
  }

  extend type Query {
    characterCredit(input: CreditInput!): LibraryCreditCharacter!
    characterCredits(input: CreditQuery!): [LibraryCreditCharacter!]!
    conceptCredit(input: CreditInput!): LibraryCreditConcept!
    conceptCredits(input: CreditQuery!): [LibraryCreditConcept!]!
    locationCredit(input: CreditInput!): LibraryCreditLocation!
    locationCredits(input: CreditQuery!): [LibraryCreditLocation!]!
    objectCredit(input: CreditInput!): LibraryCreditObject!
    objectCredits(input: CreditQuery!): [LibraryCreditObject!]!
    personCredit(input: CreditInput!): LibraryCreditPerson!
    personCredits(input: CreditQuery!): [LibraryCreditPerson!]!
    storyArcCredit(input: CreditInput!): LibraryCreditStoryArc!
    storyArcCredits(input: CreditQuery!): [LibraryCreditStoryArc!]!
    teamCredit(input: CreditInput!): LibraryCreditTeam!
    teamCredits(input: CreditQuery!): [LibraryCreditTeam!]!
  }
`
