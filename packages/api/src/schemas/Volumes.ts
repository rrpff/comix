import { gql } from 'graphql-tag'

export default gql`
  type LibraryVolume {
    source: String!
    sourceId: String!
    name: String!
    issues: [LibraryIssue!]
  }

  input VolumesQuery {
    collection: String!
  }

  input VolumeInput {
    source: String!
    sourceId: String!
  }

  extend type Query {
    volume(input: VolumeInput!): LibraryVolume!
    volumes(input: VolumesQuery!): [LibraryVolume!]!
  }
`
