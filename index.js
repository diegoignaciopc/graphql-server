import {ApolloServer, UserInputError, gql} from 'apollo-server'
import {v1 as uuid} from 'uuid'
import axios from 'axios'

const persons = [
    {
        name: "Diego",
        street: "La Arcilla",
        city: "San Fernando",
        id: "1",
        age: "23",
        phone: '19876544'
    },
    {
        name: "Ignacio",
        street: "La Arcilla",
        city: "Rancagua",
        id: "2",
        age: "22",
    },
    {
        name: "Dante",
        street: "La Arcilla",
        city: "Santiago ",
        id: "3",
        age: "24",
        phone: '87654321'
    }
]

const typeDefinitions = gql `
    enum YesNo {
        YES
        NO
    }
    
    type Address {
        street: String!
        city: String!
    }
    
    type Person {
        name: String!
        age: String!
        address: Address!
        phone: String
        id: ID!
    }
    
    type Query {
        personCount: Int!
        allPersons(phone: YesNo): [Person]!
        findPerson(name: String!): Person
    }
    
    type Mutation {
        addPerson(
            name: String!
            age: String
            street: String!
            city: String!
            id: ID!
            phone: String
            ): Person
        }
`

const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: async (root, args) => {
            const {data: personsFromtRestApi} = await axios.get('http://localhost:3000/persons')

            if (!args.phone) return personsFromtRestApi

            const byPhone = person =>
                args.phone === "YES" ? person.phone : !person.phone

            return personsFromtRestApi.filter(byPhone)

        },
        findPerson: (root, args) => {
            const {name} = args
            return persons.find(person => person.name === name)
        },
    },
    Mutation: {
      addPerson: (root, args) => {
          if (persons.find(p => p.name === args.name)) {
              throw new UserInputError('Name must be unique', {
                  invalidArgs: args.name
              })
          }
          const person = {...args, id: uuid()}
          person.push(person)
           return person
      }
    },
    Person: {
        address: (root) => {
            return {
                street: root.street,
                city: root.city
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs : typeDefinitions,
    resolvers
})

server.listen().then(({url}) => {
    console.log(`Dale al puerto ${url}`)
})
