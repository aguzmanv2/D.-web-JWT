import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String
    updatedAt: String
  }

  type AuthPayload {
    message: String!
    token: String!
    user: User!
  }

  type RegisterPayload {
    message: String!
    user: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    me: User
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): RegisterPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`);
