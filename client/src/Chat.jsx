import React, { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  useSubscription,
  gql,
  useMutation,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { Button, Col, Container, FormInput, Row } from "shards-react";

const uri = "ws://localhost:4000";
const link = new WebSocketLink({
  uri,
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  uri,
  cache: new InMemoryCache(),
  link,
});

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      user
      content
    }
  }
`;

const POST_MESSAGE = gql`
  mutation ($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const Message = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES);
  if (!data) {
    return null;
  }
  return (
    <div>
      {data.messages.map(({ id, user: messageFrom, content }, key) => {
        const isMyMessage = user === messageFrom;
        return (
          <div
            key={key}
            style={{
              display: "flex",
              justifyContent: isMyMessage ? "flex-end" : "flex-start",
              paddingBottom: "1em",
            }}
          >
            <div
              style={{
                height: 50,
                width: 50,
                border: "2px solid #e5e6ea",
                borderRadius: 25,
                textAlign: "center",
                fontSize: "18px",
                paddingTop: 10,
                marginRight: "0.5em",
              }}
            >
              {messageFrom.slice(0, 2).toUpperCase()}
            </div>
            <div
              style={{
                background: isMyMessage ? "#58bf56" : "#e5e6ea",
                color: isMyMessage ? "white" : "black",
                padding: "1em",
                borderRadius: "1em",
                maxWidth: "60%",
              }}
            >
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Chat = () => {
  const [state, setState] = useState({
    user: "Jack",
    content: "",
  });

  const [postMessage] = useMutation(POST_MESSAGE);
  const onSend = () => {
    if (state.content.length > 0) {
      postMessage({
        variables: state,
      });
    }

    setState({ ...state, content: "" });
  };

  return (
    <Container>
      <Message user={state.user} />
      <Row>
        <Col xs={2} style={{ padding: 0 }}>
          <FormInput
            label={"User"}
            value={state.user}
            onChange={(evt) => {
              setState({ ...state, user: evt.target.value });
            }}
          ></FormInput>
        </Col>
        <Col xs={8} style={{ padding: 0 }}>
          <FormInput
            label={"Content"}
            value={state.content}
            onChange={(evt) => {
              setState({ ...state, content: evt.target.value });
            }}
            onKeyUp={(evt) => {
              if (evt.keyCode === 13) {
                onSend();
              }
            }}
          ></FormInput>
        </Col>
        <Col xs={2} style={{ padding: 0 }}>
          <Button onClick={() => onSend()}>Send</Button>
        </Col>
      </Row>
    </Container>
  );
};
export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);
