const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const dotenv = require('dotenv').config();

const Event = require('./models/event');

const schema = buildSchema(`
  type Event {
    _id: ID!,
    title: String!,
    description: String!,
    price: Float!,
    date: String!
  }

  input EventInput {
    title: String!,
    description: String!,
    price: Float!,
    date: String!
  }

  type RootQuery {
    events: [Event!]!
  }

  type RootMutation {
    createEvent(eventInput: EventInput): Event
  }
  
  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);

const root = {
  events: () => {
    try {
      const result = Event.find();

      return result;
    } catch (err) {
      console.log(err);
    }
  },
  createEvent: value => {
    const event = new Event({
      title: value.eventInput.title,
      description: value.eventInput.description,
      price: +value.eventInput.price,
      date: new Date()
    });

    try {
      const result = event.save();
      return result;
    } catch (err) {
      console.log(err);
    }
  }
};

const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);

mongoose.connect(process.env.DB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

app.listen(3000, () => console.log('Start the server on port 3000.'));
