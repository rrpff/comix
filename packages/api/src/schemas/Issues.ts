import { gql } from 'graphql-tag'

export default gql`
  type LibraryIssue {
    source: String!
    sourceId: String!
    volume: LibraryVolume
    coverDate: DateTime!
    issueNumber: Float!
    name: String
    characters: [LibraryCreditCharacter!]
    concepts: [LibraryCreditConcept!]
    locations: [LibraryCreditLocation!]
    objects: [LibraryCreditObject!]
    people: [LibraryCreditPerson!]
    storyArcs: [LibraryCreditStoryArc!]
    teams: [LibraryCreditTeam!]

    entries: [LibraryCollectionEntry!]
  }

  input IssueInput {
    source: String!
    sourceId: String!
  }

  extend type Query {
    issue(input: IssueInput!): LibraryIssue!
  }
`
