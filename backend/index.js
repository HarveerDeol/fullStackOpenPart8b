import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone'
import { v1 as  uuidv1 } from 'uuid';
import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';
mongoose.set('strictQuery', false)
import Author from './models/author.js';
import Book from './models/book.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('connected to MongoDB')
})
.catch((error) => {
  console.log('error connection to MongoDB:', error.message)
})

const typeDefs = `

  type Author {
    name: String!,
    id: ID!,
    born: Int,
  }

  type Book {
    title: String!,
    published: Int,
    author: Author!,
    id: ID!,
    genres: [String!]!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    authorCount:Int!
    allBooks(genre:String):[Book!]!
    allAuthors:[Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!,
      published: Int,
      author: String!,
      genres: [String!]!
    ): Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }

  
`

const resolvers = {
  Query: {

    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => { 
      if (!args.genre){
        return Book.find({}).populate('author');;
      }
      return Book.find({ genres : genre });
    },
    allAuthors: async (root, args) => { return Author.find({}) },

    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      let authorMatch = await Author.find({ name: args.author });
      console.log("authorMathc",authorMatch)
      
      if (!authorMatch.length){
        const newAuthor = new Author({name: args.author})
        console.log('new author:',newAuthor)
        try {
          await newAuthor.save()
        } catch (error){
          throw new GraphQLError('failed saving author',{
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }}) 
        }
      } 
      authorMatch = await Author.find({ name: args.author });
      console.log('new author 2:',authorMatch[0])
      const book = new Book({
        author: authorMatch[0]._id,
        title: args.title,
        published: args.published,
        genres: args.genres,
      });
      console.log(book)
      try {
        await book.save()
      } catch (error){
        console.log('book object:',book)
        throw new GraphQLError('failed saving book',{
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }})
      }

      return book
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({name : args.name})
      author.born = args.setBornTo
      try {
        await author.save()
        console.log('save sucessful')
      } catch (error){
        throw new GraphQLError('Changing Birth Year Failed', {         
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: args.name,
          error}
        })
        
      }
  },
  createUser: async (root, args) => {
    const user = new User({ username: args.username })

    return user.save()
      .catch(error => {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error
          }
        })
      })
  },
  login: async (root, args) => {
    const user = await User.findOne({ username: args.username })

    if ( !user || args.password !== 'secret' ) {
      throw new GraphQLError('wrong credentials', {
        extensions: {
          code: 'BAD_USER_INPUT'
        }
      })        
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    }

    return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
  },

}
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})



