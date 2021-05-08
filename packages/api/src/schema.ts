import { gql } from 'graphql-tag'
import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date'
import CollectionsSchema from './schemas/Collections'
import CreditsSchema from './schemas/Credits'
import DirectoriesSchema from './schemas/Directories'
import EntriesSchema from './schemas/Entries'
import IssuesSchema from './schemas/Issues'
import VolumesSchema from './schemas/Volumes'
import { GraphqlContext } from './types'
import { Resolvers } from './types/schema'
import { collections } from './queries/collections'
import { collection } from './queries/collection'
import { collectionDirectories } from './queries/collectionDirectories'
import { directory } from './queries/directory'
import { entries } from './queries/entries'
import { characterCredit, conceptCredit, locationCredit, objectCredit, personCredit, storyArcCredit, teamCredit } from './queries/credit'
import { characterCredits, conceptCredits, locationCredits, objectCredits, personCredits, storyArcCredits, teamCredits } from './queries/credits'
import { issue } from './queries/issue'
import { volume } from './queries/volume'
import { volumes } from './queries/volumes'
import { createCollection } from './mutations/createCollection'
import { updateCollection } from './mutations/updateCollection'
import { deleteCollection } from './mutations/deleteCollection'

const BaseSchema = gql`
  scalar Date
  scalar Time
  scalar DateTime

  type MutationResult {
    success: Boolean!
  }

  type Query {
    dummy: String
  }

  type Mutation {
    dummy: String
  }

  type Subscription {
    dummy: String
  }
`

const typeDefs = [
  BaseSchema,
  CollectionsSchema,
  CreditsSchema,
  DirectoriesSchema,
  EntriesSchema,
  IssuesSchema,
  VolumesSchema,
]

const resolvers: Resolvers = {
  Date: GraphQLDate,
  Time: GraphQLTime,
  DateTime: GraphQLDateTime,
  Query: {
    collections,
    collection,
    collectionDirectories,
    directory,
    entries,
    issue,
    volume,
    volumes,

    characterCredit,
    conceptCredit,
    locationCredit,
    objectCredit,
    personCredit,
    storyArcCredit,
    teamCredit,

    characterCredits,
    conceptCredits,
    locationCredits,
    objectCredits,
    personCredits,
    storyArcCredits,
    teamCredits,
  },
  Mutation: {
    createCollection,
    updateCollection,
    deleteCollection,
  },
  Subscription: {
    collectionCreated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['COLLECTION_CREATED'])
    },
    collectionUpdated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['COLLECTION_UPDATED'])
    },
    collectionDeleted: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['COLLECTION_DELETED'])
    },
    entryCreated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['ENTRY_CREATED'])
    },
    entryUpdated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['ENTRY_UPDATED'])
    },
    entryDeleted: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['ENTRY_DELETED'])
    },
    libraryUpdateFinished: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(['LIBRARY_UPDATE_FINISHED'])
    },
  }
}

export default makeExecutableSchema<GraphqlContext>({
  typeDefs,
  resolvers,
})
