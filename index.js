import { gql, ApolloServer, UserInputError } from "apollo-server";
import { v1 as uuid } from 'uuid'
import axios from 'axios'
const persons = [
  {
    name: "Midu",
    phone: "034-1234567",
    street: "123 Main St",
    city: "New York",
    id: "3d4f-4g5g-6h6j"
  },
  {
    name: "Youseff",
    phone: "034-1234567",
    street: "Avenida Full St",
    city: "York",
    id: '3d59-4g5g-6h6j'
  },
  {
    name: "Itzik",
    street: "Calle Testing St",
    city: "Ibiza",
    id: '3d599471-4g5g-6h6j'
  }
];
const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }
  type Address{
    street: String!
    city: String!
  }
  type Person {
    name: String!
    phone: String
    address: Address!
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
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(
      name: String!
      phone: String!
    ): Person
  }
`

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: async (root, args) => {
      const { data: personFromRestApi} = await axios.get('http://localhost:3000/persons')
      if(!args.phone) return personFromRestApi;
      const byPhone = person => args.phone === 'YES' ? person.phone : !person.phone;
      return personFromRestApi.filter(byPhone);
    },
    findPerson: (root, args) => {
      return persons.find(person => person.name === args.name);
    }
  },
  Mutation: {
    addPerson: (root, args) => {
      // const {name, phone, street, city} = args;
      if(persons.find(person => person.name === args.name)){
        throw new UserInputError('Person already exists',
         {invalidArgs: args.name}
        );
      }
      const person = { ...args, id: uuid() }
      persons.push(person);
      return person;  // update database with new person
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex(person => person.name === args.name);
      if(personIndex === -1) {
        throw new UserInputError('Person not found');
      }
      const person = persons[personIndex];
      const updatedPerson = {...person, phone: args.phone};
      persons[personIndex] = updatedPerson;
      return updatedPerson
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
  typeDefs,
  resolvers
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
})