import { gql } from 'graphql-tag'

export default gql`
  type File {
    name: String!
    path: String!
  }

  type Directory {
    name: String!
    path: String!
    directories: [Directory!]
    files: [File!]
  }

  input DirectoryQuery {
    path: String!
  }

  extend type Query {
    directory(input: DirectoryQuery!): Directory!
  }
`
